"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import PricingSection from "./landing/page";

const VENDORS = [
  {
    name: "Salesforce",
    category: "CRM · SaaS",
    spend: "$284,000",
    days: 18,
    risk: "High" as const,
    usage: "94%",
    owner: "A. Wongkul",
  },
  {
    name: "AWS",
    category: "Infrastructure · Cloud",
    spend: "$612,000",
    days: 44,
    risk: "Medium" as const,
    usage: "87%",
    owner: "T. Charoenwong",
  },
  {
    name: "Workday",
    category: "HRIS · SaaS",
    spend: "$156,000",
    days: 27,
    risk: "High" as const,
    usage: "61%",
    owner: "P. Rattana",
  },
  {
    name: "Datadog",
    category: "Monitoring · DevOps",
    spend: "$98,400",
    days: 72,
    risk: "Low" as const,
    usage: "78%",
    owner: "K. Sombat",
  },
  {
    name: "Zendesk",
    category: "Support · SaaS",
    spend: "$74,200",
    days: 51,
    risk: "Medium" as const,
    usage: "55%",
    owner: "N. Pracha",
  },
];

const ALERTS = [
  {
    days: 18,
    vendor: "Salesforce Enterprise",
    value: "$284,000 · 30-day alert sent",
    level: "red" as const,
  },
  {
    days: 44,
    vendor: "AWS Reserved Instances",
    value: "$612,000 · 60-day alert sent",
    level: "amber" as const,
  },
  {
    days: 72,
    vendor: "Datadog Pro",
    value: "$98,400 · 90-day alert sent",
    level: "green" as const,
  },
];

const riskStyle: Record<"High" | "Medium" | "Low", React.CSSProperties> = {
  High: { background: "#fdecea", color: "#c0392b", border: "1px solid #f5c6c3" },
  Medium: { background: "#fdf6e3", color: "#9a6c00", border: "1px solid #f0d97a" },
  Low: { background: "#e8f5ee", color: "#1a6b3c", border: "1px solid #a8d9bb" },
};

const daysColor: Record<"High" | "Medium" | "Low", string> = {
  High: "#c0392b",
  Medium: "#b8860b",
  Low: "#1a6b3c",
};

const alertBg: Record<"red" | "amber" | "green", React.CSSProperties> = {
  red: { background: "#fdecea", border: "1px solid #f5c6c3" },
  amber: { background: "#fdf6e3", border: "1px solid #f0d97a" },
  green: { background: "#e8f5ee", border: "1px solid #a8d9bb" },
};

const alertDaysColor: Record<"red" | "amber" | "green", string> = {
  red: "#c0392b",
  amber: "#9a6c00",
  green: "#1a6b3c",
};

export default function LandingPage() {
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
        <div className="w-9 h-9">
          <Image src="/aeitor.png" alt="logo" width={24} height={24} />
        </div>

        <ul
          className="hidden md:flex gap-7 text-sm"
          style={{ color: "#444", fontFamily: "'Helvetica Neue', sans-serif", letterSpacing: "0.01em" }}
        >
          {[
            { label: "Docs", href: "#overview" },
            { label: "Pricing", href: "#pricing" },
            { label: "Contract", href: "#contracts" },
          ].map((item) => (
            <li key={item.label}>
              <a href={item.href} className="cursor-pointer hover:text-black transition-colors">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

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

      {/* ─── CONTRACT RENEWAL DASHBOARD SECTION ─── */}
      <section id="overview" className="max-w-5xl mx-auto px-8 pb-24 pt-10">
        {/* Section heading */}
        <div className="flex flex-col items-center text-center mb-10">
          <h2
            className="text-4xl md:text-5xl leading-tight max-w-xl mb-4"
            style={{ color: "#111", fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
          >
            Every renewal,{" "}
            <em style={{ fontStyle: "italic", color: "#555" }}>before</em>
            {" "}it catches you off guard.
          </h2>
          <p
            className="text-sm max-w-sm leading-relaxed"
            style={{ color: "#666", fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            Track all vendor contracts in one dashboard. Automatic alerts at 90, 60, and 30 days.
            Full spend and renewal risk — no spreadsheets, no surprises.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total annual spend", value: "$2.4M", sub: "across 38 vendors", color: "#111" },
            { label: "Renewals this quarter", value: "11", sub: "3 require action now", color: "#b8860b" },
            { label: "High-risk contracts", value: "4", sub: "expiring within 30 days", color: "#c0392b" },
          ].map(({ label, value, sub, color }) => (
            <div
              key={label}
              className="rounded-xl p-5 border border-neutral-200"
              style={{ backgroundColor: "#fff" }}
            >
              <p
                className="text-xs uppercase tracking-widest mb-1"
                style={{ color: "#888", fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                {label}
              </p>
              <p
                className="text-3xl mb-1"
                style={{ color, fontFamily: "'Georgia', serif", fontWeight: 400 }}
              >
                {value}
              </p>
              <p className="text-xs" style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}>
                {sub}
              </p>
            </div>
          ))}
        </div>

        {/* Dashboard panel */}
        <div
          id="contracts"
          className="rounded-2xl border border-neutral-200 overflow-hidden"
          style={{ backgroundColor: "#fff" }}
        >

          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 py-4 border-b border-neutral-200"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            <div>
              <p className="text-sm font-medium text-neutral-800">Contract Renewal Tracker</p>
              <p className="text-xs text-neutral-400 mt-0.5">Sorted by renewal urgency</p>
            </div>
            <div className="flex gap-2">
              {["All", "Critical", "SaaS", "Infra"].map((f, i) => (
                <span
                  key={f}
                  className="text-xs px-3 py-1 rounded-full border cursor-default"
                  style={
                    i === 0
                      ? { backgroundColor: "#1a1a1a", color: "#f0ede6", borderColor: "#1a1a1a" }
                      : { backgroundColor: "#ece9e2", color: "#666", borderColor: "#d9d5cc" }
                  }
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Table */}
          <table className="w-full" style={{ borderCollapse: "collapse", fontFamily: "'Helvetica Neue', sans-serif" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #eee" }}>
                {["Vendor", "Annual Spend", "Days to Renewal", "Risk", "Usage", "Owner"].map((h) => (
                  <th
                    key={h}
                    className="text-left px-5 py-3 text-xs uppercase tracking-widest font-normal"
                    style={{ color: "#aaa" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {VENDORS.map((v, i) => (
                <tr
                  key={v.name}
                  style={{ borderBottom: i < VENDORS.length - 1 ? "1px solid #f5f5f5" : "none" }}
                >
                  <td className="px-5 py-4">
                    <p className="text-sm font-medium text-neutral-800">{v.name}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{v.category}</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {v.spend}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: daysColor[v.risk], fontVariantNumeric: "tabular-nums" }}>
                        {v.days} days
                      </span>
                      <div className="relative h-1 rounded-full overflow-hidden" style={{ width: 72, backgroundColor: "#eee" }}>
                        <div
                          className="absolute left-0 top-0 h-full rounded-full"
                          style={{ width: `${v.days}%`, backgroundColor: daysColor[v.risk] }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={riskStyle[v.risk]}
                    >
                      {v.risk}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-neutral-500">{v.usage}</td>
                  <td className="px-5 py-4 text-xs text-neutral-500">{v.owner}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Alert cards */}
        <p
          className="text-xs uppercase tracking-widest mt-8 mb-4"
          style={{ color: "#aaa", fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Upcoming alerts — sent automatically
        </p>
        <div className="grid grid-cols-3 gap-3">
          {ALERTS.map(({ days, vendor, value, level }) => (
            <div
              key={vendor}
              className="rounded-xl p-4 border"
              style={alertBg[level]}
            >
              <p className="text-2xl" style={{ color: alertDaysColor[level], fontFamily: "'Georgia', serif", fontWeight: 400 }}>
                {days}
              </p>
              <p className="text-xs uppercase tracking-widest mt-0.5 mb-3" style={{ color: "#999", fontFamily: "'Helvetica Neue', sans-serif" }}>
                days remaining
              </p>
              <p className="text-sm font-medium text-neutral-800" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{vendor}</p>
              <p className="text-xs text-neutral-400 mt-0.5" style={{ fontFamily: "'Helvetica Neue', sans-serif" }}>{value}</p>
            </div>
          ))}
        </div>
      </section>

      <PricingSection />
    </main>
  );
}