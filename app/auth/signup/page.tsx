"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Check, AlertCircle } from "lucide-react";
import { signUpAction } from "@/actions/auth";
import type { ActionResult } from "@/types/actions";

// Google brand SVG (no lucide equivalent)
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// GitHub brand SVG (no lucide equivalent)
const GitHubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
  </svg>
);

export default function SignUpPage() {
  const [step, setStep] = useState<"form" | "verify">("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const errors = result && !result.success ? result.errors : {};
  const passwordsMatch = password === confirmPassword;
  const confirmError = confirmTouched && confirmPassword.length > 0 && !passwordsMatch;
  const confirmSuccess = confirmTouched && confirmPassword.length > 0 && passwordsMatch;
  const canSubmit = agreed && passwordsMatch && password.length >= 8 && confirmPassword.length > 0 && !isPending;

  function startOAuth(provider: "google" | "github") {
    window.location.assign(`/api/auth/oauth/${provider}`);
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setConfirmTouched(true);
    if (!canSubmit) return;
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signUpAction(formData);
      if (res?.success) {
        setStep("verify");
      } else {
        setResult(res);
      }
    });
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
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <Link href="/">
          <div className="w-9 h-9">
            <Image src="/aeitor.png" alt="logo" width={24} height={24} />
          </div>
        </Link>

        <p className="text-sm" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
          Already have an account?{" "}
          <Link href="./signin" className="underline underline-offset-2 hover:text-black transition-colors" style={{ color: "#333" }}>
            Sign in
          </Link>
        </p>
      </nav>

      {/* CONTENT */}
      <section className="flex-1 flex items-center justify-center px-4 py-10">

        {step === "form" ? (
          <div className="w-full max-w-4xl flex justify-center">
            <div className="w-full max-w-sm">

              <div className="mb-8 text-center lg:text-left">
                <p
                  className="text-xs uppercase tracking-widest mb-4"
                  style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}
                >
                  Create account
                </p>
                <h1
                  className="text-4xl leading-tight"
                  style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
                >
                  Your workspace
                  <br />
                  awaits.
                </h1>
              </div>

              {/* Card */}
              <div
                className="rounded-2xl border border-neutral-300 overflow-hidden shadow-sm"
                style={{ backgroundColor: "rgba(240,237,230,0.85)", backdropFilter: "blur(8px)" }}
              >
                {/* Form-level error */}
                {errors._form && (
                  <div className="mx-5 mt-5 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
                    <p className="text-xs text-red-600" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                      {errors._form[0]}
                    </p>
                  </div>
                )}

                {/* OAuth */}
                <div className="p-5 flex flex-col gap-2.5">
                  <button
                    type="button"
                    onClick={() => startOAuth("google")}
                    className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-neutral-300 text-sm hover:border-neutral-500 hover:bg-white cursor-pointer"
                    style={{ color: "#333", fontFamily: "'Helvetica Neue', sans-serif", backgroundColor: "rgba(255,255,255,0.6)" }}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <button
                    type="button"
                    onClick={() => startOAuth("github")}
                    className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-neutral-300 text-sm hover:border-neutral-500 hover:bg-white cursor-pointer"
                    style={{ color: "#333", fontFamily: "'Helvetica Neue', sans-serif", backgroundColor: "rgba(255,255,255,0.6)" }}
                  >
                    <GitHubIcon />
                    Continue with GitHub
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 px-5 pb-4">
                  <div className="flex-1 h-px" style={{ backgroundColor: "#d8d4cc" }} />
                  <span className="text-xs" style={{ color: "#aaa", fontFamily: "'Helvetica Neue', sans-serif" }}>or</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: "#d8d4cc" }} />
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} className="px-5 pb-5 flex flex-col gap-3" noValidate>

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      Username
                    </label>
                    <input
                      name="username"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Username"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-neutral-600 transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.7)",
                        color: "#111",
                        fontFamily: "'Helvetica Neue', sans-serif",
                        borderColor: errors.username ? "#ef4444" : "#d1d5db",
                      }}
                      required
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                        {errors.username[0]}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="jane@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-neutral-600 transition-colors"
                      style={{
                        backgroundColor: "rgba(255,255,255,0.7)",
                        color: "#111",
                        fontFamily: "'Helvetica Neue', sans-serif",
                        borderColor: errors.email ? "#ef4444" : "#d1d5db",
                      }}
                      required
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                        {errors.email[0]}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      Password
                    </label>
                    <div className="relative">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 8 characters"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:border-neutral-600 transition-colors pr-10"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.7)",
                          color: "#111",
                          fontFamily: "'Helvetica Neue', sans-serif",
                          borderColor: errors.password ? "#ef4444" : "#d1d5db",
                        }}
                        required
                        minLength={8}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                        {errors.password[0]}
                      </p>
                    )}
                    {/* Password strength bar */}
                    {password.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className="h-0.5 flex-1 rounded-full transition-colors duration-300"
                            style={{
                              backgroundColor:
                                password.length >= i * 3
                                  ? password.length >= 12 ? "#22c55e" : password.length >= 8 ? "#f59e0b" : "#ef4444"
                                  : "#e5e5e5",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      Confirm password
                    </label>
                    <div className="relative">
                      <input
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          setConfirmTouched(true);
                        }}
                        onBlur={() => setConfirmTouched(true)}
                        placeholder="Re-enter your password"
                        className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors pr-10"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.7)",
                          color: "#111",
                          fontFamily: "'Helvetica Neue', sans-serif",
                          borderColor: confirmError
                            ? "#ef4444"
                            : confirmSuccess
                            ? "#22c55e"
                            : "#d1d5db",
                        }}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirmPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                      </button>
                    </div>

                    {/* Error message */}
                    {confirmError && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <AlertCircle size={12} strokeWidth={2} color="#ef4444" />
                        <p className="text-xs" style={{ color: "#ef4444", fontFamily: "'Helvetica Neue', sans-serif" }}>
                          Passwords do not match
                        </p>
                      </div>
                    )}

                    {/* Success message */}
                    {confirmSuccess && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <Check size={12} strokeWidth={2.5} color="#22c55e" />
                        <p className="text-xs" style={{ color: "#22c55e", fontFamily: "'Helvetica Neue', sans-serif" }}>
                          Passwords match
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Agreement */}
                  <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                    <div
                      onClick={() => setAgreed(!agreed)}
                      className="mt-0.5 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
                      style={{
                        borderColor: agreed ? "#1a1a1a" : "#ccc",
                        backgroundColor: agreed ? "#1a1a1a" : "rgba(255,255,255,0.7)",
                      }}
                    >
                      {agreed && <Check size={10} color="white" strokeWidth={3} />}
                    </div>
                    <span className="text-xs leading-relaxed" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                      I agree to the{" "}
                      <span className="underline underline-offset-2 hover:text-black transition-colors cursor-pointer" style={{ color: "#333" }}>
                        Terms of Service
                      </span>{" "}
                      and{" "}
                      <span className="underline underline-offset-2 hover:text-black transition-colors cursor-pointer" style={{ color: "#333" }}>
                        Privacy Policy
                      </span>
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className="mt-1 w-full py-2.5 rounded-xl text-sm text-white transition-opacity flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: "#1a1a1a",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      opacity: canSubmit ? 1 : 0.4,
                      cursor: canSubmit ? "pointer" : "not-allowed",
                    }}
                  >
                    {isPending ? "Creating account..." : (
                      <>
                        Create account
                        <ArrowRight size={14} strokeWidth={2} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

        ) : (
          /* VERIFY STEP */
          <div className="w-full max-w-sm text-center">
            <div
              className="w-14 h-14 rounded-full mx-auto mb-6 flex items-center justify-center border border-neutral-300"
              style={{ backgroundColor: "rgba(255,255,255,0.6)" }}
            >
              <Mail size={22} strokeWidth={1.5} color="#555" />
            </div>
            <p
              className="text-xs uppercase tracking-widest mb-3"
              style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}
            >
              Check your inbox
            </p>
            <h1
              className="text-3xl leading-tight mb-4"
              style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
            >
              We sent you
              <br />
              a magic link.
            </h1>
            <p className="text-sm mb-8 leading-relaxed" style={{ color: "#777", fontFamily: "'Helvetica Neue', sans-serif" }}>
              Click the link we sent to <strong style={{ color: "#333" }}>{email}</strong> to activate your account.
            </p>
            <button
              onClick={() => setStep("form")}
              className="text-sm underline underline-offset-2 hover:text-black transition-colors flex items-center gap-1.5 mx-auto"
              style={{ color: "#888", fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              <ArrowLeft size={13} strokeWidth={1.8} />
              Use a different email
            </button>
          </div>
        )}
      </section>
    </main>
  );
}