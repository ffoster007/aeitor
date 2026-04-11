"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { AlertCircle, ArrowRight, Mail, RefreshCcw, ShieldCheck } from "lucide-react";
import { verifyEmailAction, resendVerificationCodeAction } from "@/actions/auth";

function VerifyPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const sent = searchParams.get("sent") === "1";
  const source = searchParams.get("source");

  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  if (!userId) {
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
            Need a fresh session?{" "}
            <Link
              href="/auth/signin"
              className="underline underline-offset-2 hover:text-black transition-colors"
              style={{ color: "#333" }}
            >
              Sign in
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
                Verification error
              </p>
              <h1
                className="text-4xl leading-tight"
                style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
              >
                This link is no
                <br />
                longer valid.
              </h1>
            </div>

            <div
              className="rounded-2xl border border-neutral-300 overflow-hidden shadow-sm p-6 text-center"
              style={{ backgroundColor: "rgba(240,237,230,0.85)", backdropFilter: "blur(8px)" }}
            >
              <div
                className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center border border-neutral-300"
                style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
              >
                <AlertCircle size={22} strokeWidth={1.7} color="#7a3d32" />
              </div>
              <p className="text-sm leading-relaxed mb-6" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                The verification link is missing required information. Return to sign in and request a new code.
              </p>
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm text-white hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                Back to sign in
                <ArrowRight size={14} strokeWidth={2} />
              </Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await verifyEmailAction(userId, code);

    if (!result.success) {
      setError(result.errors?.code?.[0] || result.errors?._form?.[0] || "Verification failed");
      setIsLoading(false);
    }
    // If successful, redirect happens in action
  };

  const handleResend = async () => {
    setError("");
    setIsResending(true);
    setResendSuccess(false);

    const result = await resendVerificationCodeAction(userId);

    if (result.success) {
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } else {
      setError(result.errors?._form?.[0] || "Failed to resend code");
    }

    setIsResending(false);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

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

      </nav>

      <section className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid gap-10 lg:grid-cols-[1.05fr_0.95fr] items-center">
          <div className="max-w-xl">
            <p
              className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}
            >
              Email verification
            </p>
            <h1
              className="text-4xl md:text-5xl leading-tight mb-5"
              style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
            >
              Finish setting up
              <br />
              your workspace.
            </h1>
            <p
              className="text-sm max-w-md leading-relaxed mb-8"
              style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              Enter the 6-digit code from your inbox to activate your account and continue into the dashboard.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div
                className="rounded-2xl border border-neutral-200 p-5"
                style={{ backgroundColor: "rgba(255,255,255,0.62)" }}
              >
                <div
                  className="w-10 h-10 rounded-full mb-4 flex items-center justify-center border border-neutral-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                  <Mail size={18} strokeWidth={1.7} color="#555" />
                </div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Inbox check
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#555", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  New code emails are sent automatically when you sign up or when an unverified account signs in.
                </p>
              </div>

              <div
                className="rounded-2xl border border-neutral-200 p-5"
                style={{ backgroundColor: "rgba(255,255,255,0.62)" }}
              >
                <div
                  className="w-10 h-10 rounded-full mb-4 flex items-center justify-center border border-neutral-300"
                  style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                >
                  <ShieldCheck size={18} strokeWidth={1.7} color="#555" />
                </div>
                <p className="text-xs uppercase tracking-widest mb-2" style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Secure access
                </p>
                <p className="text-sm leading-relaxed" style={{ color: "#555", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Verification keeps inactive or mistyped addresses from reaching the workspace before setup is complete.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full max-w-sm justify-self-center lg:justify-self-end">
            <div className="mb-8 text-center lg:text-left">
              <p
                className="text-xs uppercase tracking-widest mb-4"
                style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}
              >
                One last step
              </p>
              <h2
                className="text-4xl leading-tight"
                style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
              >
                Verify your
                <br />
                email code.
              </h2>
            </div>

            <div
              className="rounded-2xl border border-neutral-300 overflow-hidden shadow-sm"
              style={{ backgroundColor: "rgba(240,237,230,0.85)", backdropFilter: "blur(8px)" }}
            >
              {sent && (
                <div className="mx-5 mt-5 rounded-xl border px-3.5 py-3" style={{ borderColor: "#c9d7c5", backgroundColor: "#edf4ea" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#33523b", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    {source === "signin"
                      ? "We sent a fresh 6-digit code to your email."
                      : "Verification code sent. Check your inbox and enter it below."}
                  </p>
                </div>
              )}

              {error && (
                <div className="mx-5 mt-5 rounded-xl border px-3.5 py-3" style={{ borderColor: "#e7c7c2", backgroundColor: "#f9ece9" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#7a3d32", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    {error}
                  </p>
                </div>
              )}

              {resendSuccess && (
                <div className="mx-5 mt-5 rounded-xl border px-3.5 py-3" style={{ borderColor: "#c9d7c5", backgroundColor: "#edf4ea" }}>
                  <p className="text-xs leading-relaxed" style={{ color: "#33523b", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    Code sent. Check your email for the latest 6-digit verification code.
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4" noValidate>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="code" className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    Verification code
                  </label>
                  <input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={code}
                    onChange={handleCodeChange}
                    maxLength={6}
                    disabled={isLoading}
                    className="w-full rounded-xl border px-3.5 py-3 text-center text-3xl outline-none transition-colors"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)",
                      color: "#111",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      letterSpacing: "0.45em",
                      borderColor: error ? "#ef4444" : "#d1d5db",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={code.length !== 6 || isLoading}
                  className="mt-1 w-full py-2.5 rounded-xl text-sm text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                  {isLoading ? (
                    "Verifying..."
                  ) : (
                    <>
                      Verify email
                      <ArrowRight size={14} strokeWidth={2} />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending}
                  className="w-full py-2.5 rounded-xl border text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-100"
                  style={{
                    borderColor: "#d1d5db",
                    backgroundColor: "rgba(255,255,255,0.6)",
                    color: "#333",
                    fontFamily: "'Helvetica Neue', sans-serif",
                  }}
                >
                  <RefreshCcw size={14} strokeWidth={1.8} />
                  {isResending ? "Sending new code..." : "Resend code"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  );
}
