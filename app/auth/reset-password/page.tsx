"use client";

import { Suspense, useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { AlertCircle, ArrowRight, CheckCircle2, LockKeyhole } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  resetPasswordAction,
  validatePasswordResetTokenAction,
} from "@/actions/auth";
import type { ActionResult } from "@/types/actions";

type TokenState = "checking" | "valid" | "invalid";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [tokenState, setTokenState] = useState<TokenState>("checking");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isCompleted, setIsCompleted] = useState(false);

  const errors = result && !result.success ? result.errors : {};

  useEffect(() => {
    let cancelled = false;

    async function checkToken() {
      if (!token) {
        if (!cancelled) setTokenState("invalid");
        return;
      }

      const validation = await validatePasswordResetTokenAction(token);
      if (cancelled) return;

      setTokenState(validation.success ? "valid" : "invalid");
      if (!validation.success) {
        setResult(validation);
      }
    }

    checkToken();

    return () => {
      cancelled = true;
    };
  }, [token]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("token", token);

    startTransition(async () => {
      const res = await resetPasswordAction(formData);
      setResult(res);
      if (res.success) {
        setIsCompleted(true);
      }
    });
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#f0ede6",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        fontFamily: "'Georgia', serif",
      }}
    >
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <Link href="/">
          <div className="w-9 h-9">
            <Image src="/aeitor.png" alt="logo" width={24} height={24} />
          </div>
        </Link>

        <p className="text-sm" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
          Need a new link?{" "}
          <Link href="/auth/forgot-password" className="underline underline-offset-2 hover:text-black transition-colors" style={{ color: "#333" }}>
            Request again
          </Link>
        </p>
      </nav>

      <section className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 text-center">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}
            >
              Password reset
            </p>
            <h1
              className="text-4xl leading-tight"
              style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
            >
              Set your new
              <br />
              password.
            </h1>
          </div>

          <div
            className="rounded-2xl border border-neutral-300 overflow-hidden shadow-sm"
            style={{ backgroundColor: "rgba(240,237,230,0.85)", backdropFilter: "blur(8px)" }}
          >
            {tokenState === "checking" && (
              <div className="p-6 text-center">
                <Spinner size={18} />
                <p className="text-sm mt-3" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Validating your reset link...
                </p>
              </div>
            )}

            {tokenState === "invalid" && (
              <div className="p-6 text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center border border-neutral-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <AlertCircle size={22} strokeWidth={1.7} color="#7a3d32" />
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {errors._form?.[0] ?? "This reset link is invalid or has expired."}
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  Request new reset link
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
            )}

            {tokenState === "valid" && !isCompleted && (
              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3" noValidate>
                {errors._form && (
                  <div className="rounded-xl border px-3.5 py-3" style={{ borderColor: "#e7c7c2", backgroundColor: "#f9ece9" }}>
                    <p className="text-xs leading-relaxed" style={{ color: "#7a3d32", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {errors._form[0]}
                    </p>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="password" className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    New password
                  </label>
                  <div className="relative">
                    <LockKeyhole size={14} strokeWidth={1.8} className="absolute left-3.5 top-1/2 -translate-y-1/2" color="#8b8b8b" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="new-password"
                      placeholder="At least 8 chars, 1 uppercase, 1 number"
                      disabled={isPending}
                      className="w-full rounded-xl border px-10 py-2.5 text-sm outline-none transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.7)",
                        color: "#111",
                        fontFamily: "'Helvetica Neue', sans-serif",
                        borderColor: errors.password ? "#ef4444" : "#d1d5db",
                      }}
                      required
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="confirmPassword" className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    Confirm password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Re-enter your password"
                    disabled={isPending}
                    className="w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#111",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      borderColor: errors.confirmPassword ? "#ef4444" : "#d1d5db",
                    }}
                    required
                  />
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {errors.confirmPassword[0]}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="mt-1 w-full py-2.5 rounded-xl text-sm text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {isPending ? (
                    <>
                      <Spinner size={14} /> Updating password...
                    </>
                  ) : (
                    <>
                      Update password
                      <ArrowRight size={14} strokeWidth={2} />
                    </>
                  )}
                </button>
              </form>
            )}

            {tokenState === "valid" && isCompleted && (
              <div className="p-6 text-center">
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center border border-neutral-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
                >
                  <CheckCircle2 size={22} strokeWidth={1.7} color="#33523b" />
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#555", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Your password has been updated successfully. Please sign in with your new credentials.
                </p>
                <Link
                  href="/auth/signin"
                  className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:opacity-80 transition-opacity"
                  style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  Go to sign in
                  <ArrowRight size={14} strokeWidth={2} />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function ResetPasswordFallback() {
  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#f0ede6",
        backgroundImage: `
          linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        fontFamily: "'Georgia', serif",
      }}
    >
      <section className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="rounded-2xl border border-neutral-300 p-6 text-center bg-white/60">
          <Spinner size={18} />
          <p
            className="text-sm mt-3"
            style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            Loading reset form...
          </p>
        </div>
      </section>
    </main>
  );
}
