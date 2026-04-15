import bcrypt from "bcryptjs";
import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";

import { createAndSendVerificationCode } from "@/lib/verification";
import { prisma } from "@/lib/prisma";
import { createOAuthClients, oauthCookieName, safeRelativeRedirect, createUsernameSeed, type OAuthProvider } from "@/lib/oauth";

const BCRYPT_ROUNDS = 12;

interface GoogleUserInfo {
  sub: string;
  email?: string;
  email_verified?: boolean;
  name?: string;
}

interface GitHubUser {
  id: number;
  login: string;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

function isSupportedProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

function toSignInUrl(request: NextRequest, message?: string) {
  const target = new URL("/auth/signin", request.url);
  if (message) {
    target.searchParams.set("oauthError", message);
  }
  return target;
}

async function createUniqueUsername(seed: string) {
  const normalized = createUsernameSeed(seed) || "user";

  for (let i = 0; i < 30; i++) {
    const suffix = i === 0 ? "" : `_${randomBytes(3).toString("hex")}`;
    const candidate = `${normalized}${suffix}`.slice(0, 30);

    const exists = await prisma.user.findUnique({
      where: { username: candidate },
      select: { id: true },
    });

    if (!exists) return candidate;
  }

  return `user_${randomBytes(4).toString("hex")}`;
}

async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google profile.");
  }

  const data = (await response.json()) as GoogleUserInfo;

  if (!data.sub || !data.email || !data.email_verified) {
    throw new Error("Google account does not expose a verified email.");
  }

  return {
    providerAccountId: data.sub,
    email: data.email.toLowerCase(),
    usernameSeed: data.name ?? data.email.split("@")[0] ?? "google_user",
  };
}

async function fetchGitHubProfile(accessToken: string) {
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };

  const [userRes, emailsRes] = await Promise.all([
    fetch("https://api.github.com/user", { headers }),
    fetch("https://api.github.com/user/emails", { headers }),
  ]);

  if (!userRes.ok || !emailsRes.ok) {
    throw new Error("Failed to fetch GitHub profile.");
  }

  const user = (await userRes.json()) as GitHubUser;
  const emails = (await emailsRes.json()) as GitHubEmail[];

  const verifiedPrimary = emails.find((entry) => entry.primary && entry.verified)
    ?? emails.find((entry) => entry.verified);

  if (!verifiedPrimary?.email) {
    throw new Error("GitHub account does not expose a verified email.");
  }

  return {
    providerAccountId: String(user.id),
    email: verifiedPrimary.email.toLowerCase(),
    usernameSeed: user.login || verifiedPrimary.email.split("@")[0] || "github_user",
  };
}

async function resolveUserFromOAuth(provider: OAuthProvider, providerAccountId: string, email: string, usernameSeed: string) {
  const existingAccount = await prisma.oAuthAccount.findUnique({
    where: { provider_providerAccountId: { provider, providerAccountId } },
    include: { user: { select: { id: true, email: true, username: true } } },
  });

  if (existingAccount) {
    return existingAccount.user;
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, username: true },
  });

  if (existingUser) {
    await prisma.oAuthAccount.create({
      data: {
        provider,
        providerAccountId,
        userId: existingUser.id,
      },
    });

    return existingUser;
  }

  const username = await createUniqueUsername(usernameSeed);
  const randomPassword = randomBytes(32).toString("hex");
  const passwordHash = await bcrypt.hash(randomPassword, BCRYPT_ROUNDS);

  return prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        username,
        email,
        password: passwordHash,
        emailVerified: true,
      },
      select: { id: true, email: true, username: true },
    });

    await tx.oAuthAccount.create({
      data: {
        provider,
        providerAccountId,
        userId: user.id,
      },
    });

    return user;
  });
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;

  if (!isSupportedProvider(provider)) {
    return NextResponse.redirect(toSignInUrl(request, "unsupported_provider"));
  }

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  const cookieState = request.cookies.get(oauthCookieName(provider, "state"))?.value;
  const redirectTo = safeRelativeRedirect(request.cookies.get(oauthCookieName(provider, "redirect"))?.value ?? null);

  if (error) {
    const response = NextResponse.redirect(toSignInUrl(request, error));
    response.cookies.delete(oauthCookieName(provider, "state"));
    response.cookies.delete(oauthCookieName(provider, "redirect"));
    response.cookies.delete(oauthCookieName(provider, "verifier"));
    return response;
  }

  if (!code || !state || !cookieState || state !== cookieState) {
    const response = NextResponse.redirect(toSignInUrl(request, "invalid_state"));
    response.cookies.delete(oauthCookieName(provider, "state"));
    response.cookies.delete(oauthCookieName(provider, "redirect"));
    response.cookies.delete(oauthCookieName(provider, "verifier"));
    return response;
  }

  try {
    let account: { providerAccountId: string; email: string; usernameSeed: string };
    const oauthClients = createOAuthClients(request);

    if (provider === "google") {
      const codeVerifier = request.cookies.get(oauthCookieName(provider, "verifier"))?.value;
      if (!codeVerifier) {
        return NextResponse.redirect(toSignInUrl(request, "missing_verifier"));
      }

      const tokens = await oauthClients.google.validateAuthorizationCode(code, codeVerifier);
      account = await fetchGoogleProfile(tokens.accessToken());
    } else {
      const tokens = await oauthClients.github.validateAuthorizationCode(code);
      account = await fetchGitHubProfile(tokens.accessToken());
    }

    const user = await resolveUserFromOAuth(provider, account.providerAccountId, account.email, account.usernameSeed);
    await createAndSendVerificationCode(user.id, user.email, user.username);

    const verificationUrl = new URL("/auth/verify", request.url);
    verificationUrl.searchParams.set("userId", user.id);
    verificationUrl.searchParams.set("sent", "1");
    verificationUrl.searchParams.set("source", "signin");
    verificationUrl.searchParams.set("redirectTo", redirectTo);

    const response = NextResponse.redirect(verificationUrl);
    response.cookies.delete(oauthCookieName(provider, "state"));
    response.cookies.delete(oauthCookieName(provider, "redirect"));
    response.cookies.delete(oauthCookieName(provider, "verifier"));
    return response;
  } catch {
    const response = NextResponse.redirect(toSignInUrl(request, "oauth_failed"));
    response.cookies.delete(oauthCookieName(provider, "state"));
    response.cookies.delete(oauthCookieName(provider, "redirect"));
    response.cookies.delete(oauthCookieName(provider, "verifier"));
    return response;
  }
}
