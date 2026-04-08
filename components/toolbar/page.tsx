"use client";
// components/toolbar.tsx
// Client Component — รับข้อมูล user จาก props

import Image from "next/image";
import Avatar from "./avatar";

export type ToolbarUser = {
  sub: string;
  email: string;
  username: string;
} | null;

export default function Toolbar({ user }: { user?: ToolbarUser } = {}) {
  const currentUser: ToolbarUser =
    user ?? {
      sub: "guest",
      email: "guest@example.com",
      username: "Guest",
    };

  const isSignedIn = Boolean(user);

  return (
    <header className="h-10 bg-[#161616] border-b border-[#2b2b2c] flex items-center text-white text-xs px-2 w-full flex-none sticky top-0 z-40">
      {/* Left — Logo */}
      <div className="flex items-center h-full">
        <div className="flex items-center px-1.5 h-full space-x-2">
          <Image
            src="/aeitor.png"
            alt="AEITOR Logo"
            width={20}
            height={20}
            priority
            className="mr-2"
          />
          <span className="text-[#2d2f36]">/</span>
        </div>
      </div>

      {/* Center — ว่างไว้ขยาย */}
      <div className="flex-1" />

      {/* Right — Avatar (แสดงเฉพาะตอน login) */}
      {isSignedIn ? (
        <div className="flex items-center px-2">
          <Avatar user={{ username: currentUser.username, email: currentUser.email }} />
        </div>
      ) : (
        <div className="px-2 text-[#9e9e9e]">Guest</div>
      )}
    </header>
  );
}