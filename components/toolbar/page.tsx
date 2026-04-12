"use client";
// components/toolbar.tsx
// Client Component — รับข้อมูล user จาก props

import Image from "next/image";
import Link from "next/link";
import Avatar from "./avatar";

export type ToolbarUser = {
  sub: string;
  email: string;
  username: string;
};

export type ToolbarProps = {
  user?: ToolbarUser | null;
};

const defaultUser: ToolbarUser = {
  sub: "guest",
  email: "guest@example.com",
  username: "Guest",
};

export default function Toolbar({ user }: ToolbarProps = {}) {
  const currentUser = user ?? defaultUser;

  const isSignedIn = Boolean(user);

  return (
    <header className="h-10 bg-[var(--nav-bg)] border-b border-[var(--border)] flex items-center text-[var(--text-primary)] text-xs px-2 w-full flex-none sticky top-0 z-40">
      {/* Left — Logo */}
        <div className="flex items-center h-full">
            <Link href="/dashboard" className="flex items-center px-1.5 h-full space-x-2">
                <Image
                src="/aeitor.png"
                alt="AEITOR Logo"
                width={20}
                height={20}
                priority
                className="mr-2"
                />
                <span className="text-[var(--text-soft)]">/</span>
            </Link>
        </div>

      {/* Center — ว่างไว้ขยาย */}
      <div className="flex-1" />

      {/* Right — Avatar (แสดงเฉพาะตอน login) */}
      {isSignedIn ? (
        <div className="flex items-center px-2">
          <Avatar user={{ username: currentUser.username, email: currentUser.email }} />
        </div>
      ) : (
        <div className="px-2 text-[var(--text-muted)]">Guest</div>
      )}
    </header>
  );
}