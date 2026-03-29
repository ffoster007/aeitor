"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

  
const CHIPS = [
  { icon: "✦", label: "Data Pipeline" },
  { icon: "⬡", label: "Auto Reports" },
  { icon: "◈", label: "Smart Alerts" },
  { icon: "⊕", label: "Team Sync" },
  { icon: "◎", label: "AI Analyst" },
  { icon: "⟐", label: "Audit Trail" },
];

export default function LandingPage() {
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  return (
    <main
      className="min-h-screen font-sans"
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
      <nav className="flex items-center justify-between px-8 py-5 max-w-5xl mx-auto">
        {/* Logo */}
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

        {/* Links */}
        <ul
          className="hidden md:flex gap-7 text-sm"
          style={{ color: "#444", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.01em" }}
        >
          {["Docs", "Pricing", "Contract", "FAQ"].map((item) => (
            <li key={item} className="cursor-pointer hover:text-black transition-colors">
              {item}
            </li>
          ))}
        </ul>

        {/* CTA buttons */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push("/auth/signin")}
                    className="text-sm px-4 py-1.5 rounded-full border border-neutral-400 hover:border-neutral-700 transition-colors cursor-pointer"
                    style={{ fontFamily: "'Helvetica Neue', sans-serif", color: "#333" }}
                >
                    Sign in
                </button>

                <button
                    onClick={() => router.push("/auth/signup")}
                    className="text-sm px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-80 cursor-pointer"
                    style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
                >
                    Get started →
                </button>
            </div>
      </nav>

      {/* HERO */}
      <section className="flex flex-col items-center text-center pt-20 pb-10 px-4">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-8">
          <span
            className="text-xs px-3 py-1 rounded-full border border-neutral-300"
            style={{
              backgroundColor: "#ece9e2",
              color: "#555",
              fontFamily: "'Helvetica Neue', sans-serif",
            }}
          >
            Introducing Nexus v2
          </span>
          <button
            className="text-xs px-3 py-1 rounded-full text-white hover:opacity-80 transition-opacity flex items-center gap-1"
            style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            See what's new →
          </button>
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-6xl leading-tight max-w-2xl mb-6"
          style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
        >
          Build software that
          <br />
          thinks for itself.
        </h1>

        <p
          className="text-sm max-w-sm mb-12 leading-relaxed"
          style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Nexus lets engineering teams ship intelligent automations that monitor,
          adapt, and act — without writing a single workflow config.
        </p>

        {/* Prompt box */}
        <div
          className="w-full max-w-lg rounded-2xl overflow-hidden shadow-lg border border-neutral-300"
          style={{ backgroundColor: "#1e1e1e" }}
        >
          {/* Input area */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 text-neutral-500 text-xs select-none">|</span>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Monitor our API latency and auto-scale when p99 exceeds 800ms..."
                rows={2}
                className="flex-1 bg-transparent resize-none outline-none text-sm leading-relaxed placeholder-neutral-500"
                style={{ color: "#e8e4dc", fontFamily: "'Helvetica Neue', sans-serif" }}
              />
            </div>
          </div>

          {/* Bottom bar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-neutral-700">
            <div className="flex gap-3">
              <button className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm">
                ⌘
              </button>
              <button className="text-neutral-500 hover:text-neutral-300 transition-colors text-sm">
                ◷
              </button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-neutral-600 text-xs" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>
                ⌘ Enter
              </span>
              <button
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm hover:opacity-80 transition-opacity"
                style={{ backgroundColor: "#4a4a4a" }}
              >
                ›
              </button>
            </div>
          </div>
        </div>

        {/* Chip tags */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 max-w-lg">
          {CHIPS.map(({ icon, label }) => (
            <button
              key={label}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-neutral-300 hover:border-neutral-500 hover:bg-neutral-100 transition-all cursor-pointer"
              style={{ color: "#444", fontFamily: "'Helvetica Neue', sans-serif", backgroundColor: "rgba(240,237,230,0.7)" }}
              onClick={() => setPrompt(label)}
            >
              <span className="text-neutral-500">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}