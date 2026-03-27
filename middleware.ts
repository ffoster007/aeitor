// middleware.ts  (root ของ project, next to app/)

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

// Routes ที่ต้อง login
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/profile"];
// Routes สำหรับ guest (login แล้วจะ redirect ออก)
const AUTH_PREFIXES = ["/signin", "/signup"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // ไม่ต้อง check ถ้าไม่ใช่ protected หรือ auth route
  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get("access_token")?.value;
  let isAuthenticated = false;

  // 1. Verify access token
  if (accessToken) {
    try {
      await jwtVerify(accessToken, secret);
      isAuthenticated = true;
    } catch {
      // Token หมดอายุหรือ invalid → ลอง refresh ด้านล่าง
    }
  }

  // 2. ถ้า access token ใช้ไม่ได้ → ลอง refresh ผ่าน API route
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get("refresh_token")?.value;
    if (refreshToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: { cookie: request.headers.get("cookie") ?? "" },
      });

      if (refreshResponse.ok) {
        isAuthenticated = true;
        // Forward cookies ใหม่ที่ได้จาก refresh
        const response = NextResponse.next();
        refreshResponse.headers.getSetCookie().forEach((cookie) => {
          response.headers.append("Set-Cookie", cookie);
        });

        if (isAuthRoute) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        return response;
      }
    }
  }

  // 3. Guard logic
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/signin", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};