// lib/session.ts
// ใช้ใน Server Components / Server Actions เพื่อดึง user จาก access token

import { verifyAccessToken, type AccessTokenPayload } from "./jwt";
import { getAccessToken } from "./cookies";
import { prisma } from "./prisma";

export async function getCurrentUser(): Promise<AccessTokenPayload | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;
    return await verifyAccessToken(token);
  } catch {
    // Token หมดอายุหรือ invalid — middleware จะ refresh แทน
    return null;
  }
}

// Require auth — ใช้ใน Server Components ที่ต้องการ guard
export async function requireUser(): Promise<AccessTokenPayload> {
  const user = await getCurrentUser();
  if (!user) {
    // ไม่ redirect ที่นี่ เพราะ middleware จัดการแล้ว
    // throw เพื่อให้ error boundary หรือ caller จัดการ
    throw new Error("Unauthorized");
  }

  const activeUser = await prisma.user.findUnique({
    where: { id: user.sub },
    select: { id: true, deletedAt: true },
  });

  if (!activeUser || activeUser.deletedAt) {
    throw new Error("Unauthorized");
  }

  return user;
}