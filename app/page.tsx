import Image from "next/image";
import Link from "next/link";
import PricingSection from "./landing/page";
import { getCurrentUser } from "@/lib/session";

const VENDORS = [
  {
    name: "Salesforce",
    category: "CRM · SaaS",
    renewal: "Apr 30",
    noticePeriod: 30,
    monthlyCost: 23700,
    days: 18,
    status: "Critical" as const,
  },
  {
    name: "HubSpot",
    category: "Marketing Automation · SaaS",
    renewal: "May 26",
    noticePeriod: 45,
    monthlyCost: 18400,
    days: 44,
    status: "Warning" as const,
  },
  {
    name: "Workday",
    category: "HRIS · SaaS",
    renewal: "May 09",
    noticePeriod: 30,
    monthlyCost: 12900,
    days: 27,
    status: "Critical" as const,
  },
  {
    name: "Cushman & Wakefield",
    category: "Office Lease · Real Estate",
    renewal: "Jun 23",
    noticePeriod: 60,
    monthlyCost: 7600,
    days: 72,
    status: "Warning" as const,
  },
  {
    name: "Iron Mountain",
    category: "Records Storage · Services",
    renewal: "Aug 08",
    noticePeriod: 30,
    monthlyCost: 5000,
    days: 118,
    status: "Safe" as const,
  },
];

const ALERTS = [
  {
    days: 18,
    vendor: "Salesforce",
    value: "30-day alert sent · notice window open",
    level: "red" as const,
  },
  {
    days: 44,
    vendor: "HubSpot",
    value: "60-day alert sent · included in weekly summary",
    level: "amber" as const,
  },
  {
    days: 72,
    vendor: "Cushman & Wakefield",
    value: "90-day alert sent · lease review scheduled",
    level: "green" as const,
  },
];

const statusStyle: Record<"Critical" | "Warning" | "Safe", React.CSSProperties> = {
  Critical: { background: "#fdecea", color: "#c0392b", border: "1px solid #f5c6c3" },
  Warning: { background: "#fdf6e3", color: "#9a6c00", border: "1px solid #f0d97a" },
  Safe: { background: "#e8f5ee", color: "#1a6b3c", border: "1px solid #a8d9bb" },
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

const totalMonthlySpend = VENDORS.reduce((sum, vendor) => sum + vendor.monthlyCost, 0);
const renewingIn30Days = VENDORS.filter((vendor) => vendor.days <= 30).length;

function formatCurrency(value: number) {
  return `$${value.toLocaleString()}`;
}

function formatCompactCurrency(value: number) {
  return `$${(value / 1000).toFixed(1)}K`;
}

export default async function LandingPage() {
  const user = await getCurrentUser();

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
            { label: "Workspace", href: "#contracts" },
          ].map((item) => (
            <li key={item.label}>
              <a href={item.href} className="cursor-pointer hover:text-black transition-colors">
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/dashboard"
              className="text-sm px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/auth/signin"
                className="text-sm px-4 py-1.5 rounded-full border border-neutral-400 hover:border-neutral-700 transition-colors"
                style={{ fontFamily: "'Helvetica Neue', sans-serif", color: "#333" }}
              >
                Sign in
              </Link>
              <Link
                href="/auth/signup"
                className="text-sm px-4 py-1.5 rounded-full text-white transition-opacity hover:opacity-80"
                style={{ backgroundColor: "#1a1a1a", fontFamily: "'Helvetica Neue', sans-serif" }}
              >
                Get started →
              </Link>
            </>
          )}
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
            Track vendor renewals, notice periods, and monthly spend in one workspace.
            Switch between contracts, calendar, and spending views, import CSVs, and keep 90/60/30-day alerts on schedule.
          </p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "Total vendors", value: String(VENDORS.length), sub: "active in this workspace", color: "#111" },
            { label: "Renewing in 30d", value: String(renewingIn30Days), sub: "notice windows already open", color: "#c0392b" },
            { label: "Monthly spend", value: formatCompactCurrency(totalMonthlySpend), sub: "visible in Spending view", color: "#111" },
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
              <p className="text-sm font-medium text-neutral-800">Vendor contracts</p>
              <p className="text-xs text-neutral-400 mt-0.5">Contracts view sorted by renewal date</p>
            </div>
            <div className="flex gap-2">
              {["Contracts", "Calendar", "Spending"].map((f, i) => (
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
                {["Vendor", "Renewal", "Notice", "Cost/mo", "Status"].map((h) => (
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
                  <td className="px-5 py-4">
                    <p className="text-sm text-neutral-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {v.renewal}
                    </p>
                    <p className="text-xs text-neutral-400 mt-0.5">{v.days} days remaining</p>
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {v.noticePeriod} days
                  </td>
                  <td className="px-5 py-4 text-sm text-neutral-700" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {formatCurrency(v.monthlyCost)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={statusStyle[v.status]}
                    >
                      {v.status}
                    </span>
                  </td>
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
          Automated alerts in the workspace
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