// lib/jwt.ts
// ทำงานฝั่ง server เท่านั้น — ห้าม import ใน Client Component

import { SignJWT, jwtVerify } from "jose";
import { createHash } from "crypto";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// ---------------------------------------------------------------
// Payload types
// ---------------------------------------------------------------
export interface AccessTokenPayload {
  sub: string;       // user id
  email: string;
  username: string;
}

export interface RefreshTokenPayload {
  sub: string;       // user id
  jti: string;       // unique token id (ใช้ revoke ได้)
}

// ---------------------------------------------------------------
// Access Token (short-lived: 15m)
// ---------------------------------------------------------------
export async function signAccessToken(payload: AccessTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m")
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AccessTokenPayload;
}

// ---------------------------------------------------------------
// Refresh Token (long-lived: 7d)
// ---------------------------------------------------------------
export async function signRefreshToken(payload: RefreshTokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN ?? "7d")
    .sign(secret);
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as RefreshTokenPayload;
}

// ---------------------------------------------------------------
// Hash refresh token ก่อนเก็บ DB (เหมือน hash password)
// ถ้า DB หลุด attacker ก็ใช้ token ไม่ได้
// ---------------------------------------------------------------
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}