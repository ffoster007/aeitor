import { createHash, randomBytes } from "crypto";

import { GitHub, Google } from "arctic";

export type OAuthProvider = "google" | "github";

function requireEnv(name: string) {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} environment variable is not set.`);
  }

  return value;
}

const googleClientId = requireEnv("GOOGLE_ID");
const googleClientSecret = requireEnv("GOOGLE_SECRET");
const githubClientId = requireEnv("GITHUB_ID");
const githubClientSecret = requireEnv("GITHUB_SECRET");

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function getForwardedOrigin(request: Request) {
  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return null;
}

export function getAppOrigin(request: Request) {
  const forwardedOrigin = getForwardedOrigin(request);
  if (forwardedOrigin) {
    return trimTrailingSlash(forwardedOrigin);
  }

  const configuredOrigin = process.env.APP_URL ?? process.env.NEXT_PUBLIC_APP_URL;
  if (configuredOrigin) {
    return trimTrailingSlash(configuredOrigin);
  }

  return trimTrailingSlash(new URL(request.url).origin);
}

export function getOAuthCallbackUrl(provider: OAuthProvider, request: Request) {
  return `${getAppOrigin(request)}/api/auth/oauth/${provider}/callback`;
}

export function createOAuthClients(request: Request) {
  return {
    google: new Google(googleClientId, googleClientSecret, getOAuthCallbackUrl("google", request)),
    github: new GitHub(githubClientId, githubClientSecret, getOAuthCallbackUrl("github", request)),
  } as const;
}

export function createState() {
  return randomBytes(32).toString("base64url");
}

export function createCodeVerifier() {
  return randomBytes(48).toString("base64url");
}

export function createUsernameSeed(raw: string) {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 24);
}

export function safeRelativeRedirect(input: string | null) {
  if (!input) return "/dashboard";
  if (!input.startsWith("/")) return "/dashboard";
  if (input.startsWith("//")) return "/dashboard";
  return input;
}

export function oauthCookieName(provider: OAuthProvider, kind: "state" | "verifier" | "redirect") {
  return `oauth_${provider}_${kind}`;
}

export function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}
