// app/signin/page.tsx
"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { signInAction } from "@/actions/auth";
import type { ActionResult } from "@/types/actions";


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
  

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  const errors = result && !result.success ? result.errors : {};

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const res = await signInAction(formData);
      // redirect() จะ throw ก่อนถึงบรรทัดนี้ถ้า success
      setResult(res);
    });
  }

  return (
    <main
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "#f0ede6",
        backgroundImage: `linear-gradient(rgba(0,0,0,0.045) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,0.045) 1px, transparent 1px)`,
        backgroundSize: "40px 40px",
        fontFamily: "'Georgia', serif",
      }}
    >
      {/* NAV */}
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto w-full">
        <Link href="/">
            <div
                className="w-9 h-9 "
            >
            <Image
                src="/aeitor.png"   // อยู่ใน public/logo.png
                alt="logo"
                width={24}
                height={24}
            />
            </div>
        </Link>

        <p className="text-sm" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
          Don't have an account?{" "}
          <Link href="./signup" className="underline underline-offset-2 hover:text-black transition-colors" style={{ color: "#333" }}>
            Sign up
          </Link>
        </p>
      </nav>

      <section className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-10 text-center">
            <p className="text-xs uppercase tracking-widest mb-4"
              style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.15em" }}>
              Welcome back
            </p>
            <h1 className="text-4xl leading-tight"
              style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}>
              Sign in to
              <br />your workspace.
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-2xl border border-neutral-300 overflow-hidden shadow-sm"
            style={{ backgroundColor: "rgba(240,237,230,0.85)", backdropFilter: "blur(8px)" }}>

            {/* OAuth buttons */}
            <div className="p-5 flex flex-col gap-2.5">
              <button
                className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-neutral-300 text-sm hover:border-neutral-500 hover:bg-white cursor-pointer"
                style={{ color: "#333", fontFamily: "'Helvetica Neue', sans-serif", backgroundColor: "rgba(255,255,255,0.6)" }}
              >
                <GoogleIcon />
                Continue with Google
              </button>

              <button
                className="flex items-center justify-center gap-3 w-full py-2.5 rounded-xl border border-neutral-300 text-sm hover:border-neutral-500 hover:bg-white cursor-pointer"
                style={{ color: "#333", fontFamily: "'Helvetica Neue', sans-serif", backgroundColor: "rgba(255,255,255,0.6)" }}
              >
                <GitHubIcon />
                Continue with GitHub
              </button>
            </div>

            {/* Form-level error */}
            {errors._form && (
              <div className="mx-5 mt-5 px-3.5 py-2.5 rounded-xl border border-red-200 bg-red-50">
                <p className="text-xs text-red-600" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                  {errors._form[0]}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-3" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                  Username
                </label>
                <input
                  name="username" type="text" placeholder="Username"
                  autoComplete="username"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.7)", color: "#111",
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

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs" style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    Password
                  </label>
                  <Link href="/forgot-password"
                    className="text-xs underline underline-offset-2 hover:text-black transition-colors"
                    style={{ color: "#888", fontFamily: "'Helvetica Neue', sans-serif" }}>
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    name="password" type={showPassword ? "text" : "password"}
                    placeholder="••••••••" autoComplete="current-password"
                    className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors pr-10"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.7)", color: "#111",
                      fontFamily: "'Helvetica Neue', sans-serif",
                      borderColor: errors.password ? "#ef4444" : "#d1d5db",
                    }}
                    required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    aria-label={showPassword ? "Hide password" : "Show password"}>
                    {showPassword ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                    {errors.password[0]}
                  </p>
                )}
              </div>

              <button type="submit" disabled={isPending}
                className="mt-1 w-full py-2.5 rounded-xl text-sm text-white hover:opacity-80 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}>
                {isPending ? "Signing in..." : <> Sign in <ArrowRight size={14} strokeWidth={2} /> </>}
              </button>
            </form>
          </div>

          <p className="text-center text-xs mt-6" style={{ color: "#aaa", fontFamily: "'Helvetica Neue', sans-serif", lineHeight: "1.6" }}>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-600">Terms of Service</Link>
            {" "}and{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-600">Privacy Policy</Link>.
          </p>
        </div>
      </section>
    </main>
  );
}