"use client";

import { useEffect, useRef, useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Settings,
  CreditCard,
  LogOut,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Check,
} from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { useTheme, type ThemePreference } from "@/components/providers/theme-provider";

// ---------------------------------------------------------------
// Types
// ---------------------------------------------------------------
interface UserInfo {
  username: string;
  email: string;
  avatarUrl?: string | null;
}

const THEME_OPTIONS: {
  value: ThemePreference;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "light", label: "Light", icon: <Sun size={14} strokeWidth={1.8} /> },
  { value: "dark", label: "Dark", icon: <Moon size={14} strokeWidth={1.8} /> },
  { value: "system", label: "System", icon: <Monitor size={14} strokeWidth={1.8} /> },
];

// ---------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------
function AvatarImage({
  src,
  initials,
  size,
}: {
  src?: string | null;
  initials: string;
  size: number;
}) {
  return (
    <div
      className="rounded-full overflow-hidden bg-[var(--surface-3)] border border-[var(--border)] flex-shrink-0 flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image src={src} alt="Avatar" width={size} height={size} className="object-cover w-full h-full" />
      ) : (
        <span className="text-[var(--text-soft)] font-medium select-none" style={{ fontSize: size * 0.42 }}>
          {initials}
        </span>
      )}
    </div>
  );
}

function DropdownItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 w-full px-4 py-1.5 text-sm text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text-primary)] cursor-pointer"
    >
      {icon}
      {label}
    </button>
  );
}

// ---------------------------------------------------------------
// Avatar Component
// ---------------------------------------------------------------
export default function Avatar({ user }: { user: UserInfo }) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [isPending, startTransition] = useTransition();

  // Initial letter สำหรับ fallback
  const initials = useMemo(
    () => user.username?.[0]?.toUpperCase() ?? "U",
    [user.username]
  );

  // ปิด dropdown เมื่อคลิกข้างนอกหรือกด Escape
  useEffect(() => {
    if (!isOpen) return;

    const onClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen]);

  // Sign out — ใช้ Server Action จากระบบ JWT ที่สร้างไว้
  const handleSignOut = () => {
    setIsOpen(false);
    startTransition(async () => {
      await signOutAction();
    });
  };

  const navigate = (path: string) => {
    setIsOpen(false);
    router.push(path);
  };

  return (
    <div className="relative" ref={containerRef}>
      {/* ── Trigger Button ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 cursor-pointer focus:outline-none group"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <AvatarImage src={user.avatarUrl} initials={initials} size={26} />
        <ChevronDown
          size={12}
          strokeWidth={2}
          className={`text-[var(--text-soft)] transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* ── Dropdown ── */}
      <div
        role="menu"
        className={`
          absolute right-0 mt-2 w-64
          bg-[var(--surface-1)] text-[var(--text-secondary)]
          border border-[var(--border)] rounded-lg shadow-2xl overflow-hidden
          origin-top-right transition-all duration-150 ease-out
          ${isOpen
            ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-95 -translate-y-1 pointer-events-none"
          }
        `}
      >
        {/* User info */}
        <div className="px-4 py-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-3">
            <AvatarImage src={user.avatarUrl} initials={initials} size={32} />
            <div className="min-w-0">
              <p className="text-sm font-medium text-[var(--text-primary)] truncate">{user.username}</p>
              <p className="text-xs text-[var(--text-soft)] truncate mt-0.5">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Menu items */}
        <div className="py-1.5">
          <DropdownItem
            icon={<Settings size={14} strokeWidth={1.8} />}
            label="Settings"
            onClick={() => navigate("/dashboard/setting")}
          />
          <DropdownItem
            icon={<CreditCard size={14} strokeWidth={1.8} />}
            label="Billing & Plans"
            onClick={() => navigate("/dashboard/billing")}
          />
        </div>

        {/* Theme selector */}
        <div className="border-t border-[var(--border)] py-1.5">
          <p className="px-4 py-1.5 text-[10px] font-semibold text-[var(--text-soft)] uppercase tracking-widest">
            Appearance
          </p>
          {THEME_OPTIONS.map(({ value, label, icon }) => (
            <button
              key={value}
              role="menuitem"
              onClick={() => setTheme(value)}
              className="flex items-center justify-between w-full px-4 py-1.5 text-sm hover:bg-[var(--surface-2)] cursor-pointer"
            >
              <span className="flex items-center gap-2.5 text-[var(--text-muted)]">
                {icon}
                {label}
              </span>
              {theme === value && (
                <Check size={13} strokeWidth={2.5} className="text-[var(--brand)]" />
              )}
            </button>
          ))}
        </div>

        {/* Sign out */}
        <div className="border-t border-[var(--border)] py-1.5">
          <button
            role="menuitem"
            onClick={handleSignOut}
            disabled={isPending}
            className="flex items-center gap-2.5 w-full px-4 py-1.5 text-sm text-[var(--destructive)] hover:bg-[var(--surface-2)] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={14} strokeWidth={1.8} />
            {isPending ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </div>
    </div>
  );
}

