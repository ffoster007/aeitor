// actions/auth.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, hashToken } from "@/lib/jwt";
import { clearAuthCookies, getRefreshToken } from "@/lib/cookies";
import { signUpSchema, signInSchema, verifyEmailSchema } from "@/lib/validations/auth";
import { createAndSendVerificationCode, verifyCode } from "@/lib/verification";
import { issueTokens } from "@/lib/auth-tokens";
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

  // 4. สร้าง User ใน DB (emailVerified: false)
  let user: { id: string; email: string; username: string };
  try {
    user = await prisma.user.create({
      data: { 
        username, 
        email, 
        password: hashedPassword,
        emailVerified: false,
      },
      select: { id: true, email: true, username: true },
    });
  } catch {
    return { success: false, errors: { _form: ["เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง"] } };
  }

  // 5. สร้างและส่ง verification code
  try {
    await createAndSendVerificationCode(user.id, user.email, user.username);
  } catch {
    return { success: false, errors: { _form: ["ไม่สามารถส่ง email ได้ กรุณาลองใหม่อีกครั้ง"] } };
  }

  // 6. Store userId in query param for verification page
  const searchParams = new URLSearchParams({ userId: user.id });
  redirect(`/auth/verify?${searchParams.toString()}`);
}

// ---------------------------------------------------------------
// SIGN IN
// ---------------------------------------------------------------
export async function signInAction(formData: FormData): Promise<ActionResult> {
  // 1. Validate
  const raw = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  const parsed = signInSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { username, password } = parsed.data;

  // 2. หา user — ใช้ message กว้าง ๆ เพื่อป้องกัน user enumeration
  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, email: true, username: true, password: true, emailVerified: true },
  });

  // timing-safe: compare เสมอแม้ไม่มี user เพื่อป้องกัน timing attack
  const dummyHash = "$2b$12$invalidhashfortimingprotection00000000000000000000000";
  const isValid = await bcrypt.compare(password, user?.password ?? dummyHash);

  if (!user || !isValid) {
    return { success: false, errors: { _form: ["Username or Password is incorrect"] } };
  }

  // 3. ตรวจสอบว่า email ได้รับการยืนยันแล้ว
  if (!user.emailVerified) {
    try {
      await createAndSendVerificationCode(user.id, user.email, user.username);
    } catch {
      return {
        success: false,
        errors: { _form: ["We could not send a verification email right now. Please try again."] },
      };
    }

    const searchParams = new URLSearchParams({
      userId: user.id,
      sent: "1",
      source: "signin",
    });

    redirect(`/auth/verify?${searchParams.toString()}`);
  }

  // 4. ออก tokens และ set cookies
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
  redirect("/auth/signin");
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
// VERIFY EMAIL
// ---------------------------------------------------------------
export async function verifyEmailAction(userId: string, code: string): Promise<ActionResult> {
  // 1. Validate input
  const parsed = verifyEmailSchema.safeParse({ code });
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { code: validatedCode } = parsed.data;

  // 2. ตรวจสอบ userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, emailVerified: true },
  });

  if (!user) {
    return { success: false, errors: { _form: ["ไม่พบผู้ใช้"] } };
  }

  // 3. ถ้า email ยืนยันแล้ว ให้ redirect ไป signin
  if (user.emailVerified) {
    redirect("/auth/signin");
  }

  // 4. ตรวจสอบ verification code
  const isValid = await verifyCode(userId, validatedCode);
  if (!isValid) {
    return { success: false, errors: { code: ["รหัสไม่ถูกต้องหรือหมดอายุ"] } };
  }

  // 5. ออก tokens และ set cookies
  await issueTokens(user);

  // 6. Redirect ไป dashboard
  revalidatePath("/", "layout");
  redirect("/dashboard");
}

// ---------------------------------------------------------------
// RESEND VERIFICATION CODE
// ---------------------------------------------------------------
export async function resendVerificationCodeAction(userId: string): Promise<ActionResult> {
  // 1. ตรวจสอบ userId
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, username: true, emailVerified: true },
  });

  if (!user) {
    return { success: false, errors: { _form: ["ไม่พบผู้ใช้"] } };
  }

  // 2. ถ้า email ยืนยันแล้ว ให้ return error
  if (user.emailVerified) {
    return { success: false, errors: { _form: ["Email ของคุณได้รับการยืนยันแล้ว"] } };
  }

  // 3. สร้างและส่ง verification code ใหม่
  try {
    await createAndSendVerificationCode(user.id, user.email, user.username);
  } catch {
    return { success: false, errors: { _form: ["ไม่สามารถส่ง email ได้ กรุณาลองใหม่อีกครั้ง"] } };
  }

  return { success: true };
}
