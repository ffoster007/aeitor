import { createHash, randomBytes } from "crypto";

import { GitHub, Google } from "arctic";

export type OAuthProvider = "google" | "github";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const googleClientId = process.env.GOOGLE_ID;
const googleClientSecret = process.env.GOOGLE_SECRET;
const githubClientId = process.env.GITHUB_ID;
const githubClientSecret = process.env.GITHUB_SECRET;

if (!appUrl) {
  throw new Error("NEXT_PUBLIC_APP_URL environment variable is not set.");
}

if (!googleClientId || !googleClientSecret) {
  throw new Error("Google OAuth env vars are not set. Expected GOOGLE_ID and GOOGLE_SECRET.");
}

if (!githubClientId || !githubClientSecret) {
  throw new Error("GitHub OAuth env vars are not set. Expected GITHUB_ID and GITHUB_SECRET.");
}

const CALLBACKS = {
  google: `${appUrl}/api/auth/oauth/google/callback`,
  github: `${appUrl}/api/auth/oauth/github/callback`,
} as const;

export const oauthClients = {
  google: new Google(googleClientId, googleClientSecret, CALLBACKS.google),
  github: new GitHub(githubClientId, githubClientSecret, CALLBACKS.github),
} as const;

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
