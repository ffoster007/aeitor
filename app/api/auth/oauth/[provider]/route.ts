import { NextRequest, NextResponse } from "next/server";

import { createCodeVerifier, createOAuthClients, createState, oauthCookieName, safeRelativeRedirect, type OAuthProvider } from "@/lib/oauth";

const OAUTH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 10,
};

function isSupportedProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "github";
}

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ provider: string }> },
) {
  const { provider } = await ctx.params;

  if (!isSupportedProvider(provider)) {
    return NextResponse.json({ error: "Unsupported OAuth provider" }, { status: 400 });
  }

  const state = createState();
  const redirectTo = safeRelativeRedirect(request.nextUrl.searchParams.get("redirectTo"));
  const oauthClients = createOAuthClients(request);

  let authorizationUrl: URL;
  let codeVerifier: string | undefined;

  if (provider === "google") {
    codeVerifier = createCodeVerifier();
    authorizationUrl = oauthClients.google.createAuthorizationURL(state, codeVerifier, [
      "openid",
      "profile",
      "email",
    ]);
  } else {
    authorizationUrl = oauthClients.github.createAuthorizationURL(state, ["read:user", "user:email"]);
  }

  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(oauthCookieName(provider, "state"), state, OAUTH_COOKIE_OPTIONS);
  response.cookies.set(oauthCookieName(provider, "redirect"), redirectTo, OAUTH_COOKIE_OPTIONS);

  if (provider === "google" && codeVerifier) {
    response.cookies.set(oauthCookieName(provider, "verifier"), codeVerifier, OAUTH_COOKIE_OPTIONS);
  }

  return response;
}
