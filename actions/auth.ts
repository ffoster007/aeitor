// actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";

import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken, verifyRefreshToken, hashToken } from "@/lib/jwt";
import { setAuthCookies, clearAuthCookies, getRefreshToken } from "@/lib/cookies";
import { signUpSchema, signInSchema } from "@/lib/validations/auth";
import type { ActionResult } from "@/types/actions";

const BCRYPT_ROUNDS = 12; // ค่า cost factor — 12 เหมาะกับ production

// ---------------------------------------------------------------
// SIGN UP
// ---------------------------------------------------------------
export async function signUpAction(formData: FormData): Promise<ActionResult> {
  // 1. Validate input
  const raw = {
    username: formData.get("username"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { username, email, password } = parsed.data;

  // 2. ตรวจ email และ username ซ้ำ (query เดียว)
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { email: true, username: true },
  });

  if (existing) {
    return {
      success: false,
      errors: {
        ...(existing.email === email && { email: ["Email นี้ถูกใช้งานแล้ว"] }),
        ...(existing.username === username && { username: ["Username นี้ถูกใช้งานแล้ว"] }),
      },
    };
  }

  // 3. Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 4. สร้าง User ใน DB
  let user: { id: string; email: string; username: string };
  try {
    user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
      select: { id: true, email: true, username: true },
    });
  } catch {
    return { success: false, errors: { _form: ["เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"] } };
  }

  // 5. ออก tokens และ set cookies
  await issueTokens(user);

  // 6. Redirect ไป dashboard
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ---------------------------------------------------------------
// SIGN IN
// ---------------------------------------------------------------
export async function signInAction(formData: FormData): Promise<ActionResult> {
  // 1. Validate
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { email, password } = parsed.data;

  // 2. หา user — ใช้ message กว้าง ๆ เพื่อป้องกัน user enumeration
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true, password: true },
  });

  // timing-safe: compare เสมอแม้ไม่มี user เพื่อป้องกัน timing attack
  const dummyHash = "$2b$12$invalidhashfortimingprotection00000000000000000000000";
  const isValid = await bcrypt.compare(password, user?.password ?? dummyHash);

  if (!user || !isValid) {
    return { success: false, errors: { _form: ["Email หรือ Password ไม่ถูกต้อง"] } };
  }

  // 3. ออก tokens และ set cookies
  await issueTokens({ id: user.id, email: user.email, username: user.username });

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ---------------------------------------------------------------
// SIGN OUT
// ---------------------------------------------------------------
export async function signOutAction(): Promise<void> {
  // Revoke refresh token จาก DB
  const rawRefreshToken = await getRefreshToken();
  if (rawRefreshToken) {
    const hashed = hashToken(rawRefreshToken);
    await prisma.refreshToken.deleteMany({ where: { token: hashed } }).catch(() => {});
  }

  await clearAuthCookies();
  revalidatePath("/", "layout");
  redirect("/signin");
}

// ---------------------------------------------------------------
// REFRESH SESSION
// เรียกจาก middleware เมื่อ access token หมดอายุ
// ---------------------------------------------------------------
export async function refreshSessionAction(): Promise<boolean> {
  const rawRefreshToken = await getRefreshToken();
  if (!rawRefreshToken) return false;

  try {
    // 1. Verify JWT signature
    const payload = await verifyRefreshToken(rawRefreshToken);

    // 2. ตรวจ hash ใน DB (ป้องกัน token reuse)
    const hashed = hashToken(rawRefreshToken);
    const stored = await prisma.refreshToken.findUnique({
      where: { token: hashed },
      include: { user: { select: { id: true, email: true, username: true } } },
    });

    if (!stored || stored.expiresAt < new Date()) {
      await clearAuthCookies();
      return false;
    }

    // 3. Rotate refresh token (ใช้ token เดิมได้แค่ครั้งเดียว)
    await prisma.refreshToken.delete({ where: { token: hashed } });

    // 4. ออก token ใหม่
    await issueTokens(stored.user);
    return true;
  } catch {
    await clearAuthCookies();
    return false;
  }
}

// ---------------------------------------------------------------
// Helper: ออก access + refresh token และ set HttpOnly cookies
// ---------------------------------------------------------------
async function issueTokens(user: { id: string; email: string; username: string }) {
  const jti = randomUUID();

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ sub: user.id, email: user.email, username: user.username }),
    signRefreshToken({ sub: user.id, jti }),
  ]);

  // เก็บ hash ของ refresh token ใน DB
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 วัน
  await prisma.refreshToken.create({
    data: {
      token: hashToken(refreshToken),
      userId: user.id,
      expiresAt,
    },
  });

  // Set HttpOnly cookies
  await setAuthCookies(accessToken, refreshToken);
}