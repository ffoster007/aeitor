// proxy.ts  (root ของ project)

import { NextResponse, type NextRequest } from "next/server";
import { jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error("JWT_SECRET environment variable is not set. Please add JWT_SECRET to your .env file.");
}
const secret = new TextEncoder().encode(jwtSecret);

// Routes ที่ต้อง login
const PROTECTED_PREFIXES = ["/dashboard", "/settings", "/profile"];
// Routes สำหรับ guest (login แล้วจะ redirect ออก)
const AUTH_PREFIXES = ["/auth/signin", "/auth/signup"];

export async function proxy(request: NextRequest) {
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
      // token หมดอายุหรือ invalid
    }
  }

  // 2. ถ้า access token ใช้ไม่ได้ → ลอง refresh
  if (!isAuthenticated) {
    const refreshToken = request.cookies.get("refresh_token")?.value;

    if (refreshToken) {
      const refreshUrl = new URL("/api/auth/refresh", request.url);

      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
        },
      });

      if (refreshResponse.ok) {
        isAuthenticated = true;

        const response = NextResponse.next();

        // ⚠️ บาง runtime ไม่มี getSetCookie → fallback
        const setCookie = refreshResponse.headers.get("set-cookie");
        if (setCookie) {
          response.headers.append("Set-Cookie", setCookie);
        }

        if (isAuthRoute) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }

        return response;
      }
    }
  }

  // 3. Guard logic
  if (isProtected && !isAuthenticated) {
    const loginUrl = new URL("/auth/signin", request.url);
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