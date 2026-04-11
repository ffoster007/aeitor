"use client";

import { useRef, useState, useTransition } from "react";
import { changePasswordAction } from "@/actions/auth";
import type { ActionResult } from "@/types/actions";

interface AccountSettingsProps {
  username: string;
  email: string;
  userId: string;
  isOAuth: boolean;
}

export function AccountSettings({
  username,
  email,
  userId,
  isOAuth,
}: AccountSettingsProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const res = await changePasswordAction(userId, formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  }

  const inputClass =
    "w-full rounded-xl border border-[#2e2e2e] bg-[#212121] px-4 py-2.5 text-sm text-[#f3efe8] placeholder-[#5a5550] outline-none focus:border-[#4a4540] focus:ring-0 disabled:opacity-50";
  const labelClass =
    "mb-1.5 block text-[11px] uppercase tracking-[0.22em] text-[#8e887f]";
  const fieldError = (key: string) => {
    if (!result || result.success) return null;
    const msg = result.errors[key]?.[0];
    return msg ? (
      <p className="mt-1.5 text-xs text-red-400">{msg}</p>
    ) : null;
  };

  return (
    <div className="space-y-8">
      {/* Account info */}
      <section>
        <h2
          className="mb-5 text-xl leading-tight text-[#f3efe8]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
        >
          Account
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className={labelClass}>Username</p>
            <div className={`${inputClass} cursor-default opacity-70`}>{username}</div>
          </div>

          <div>
            <p className={labelClass}>Email</p>
            <div className={`${inputClass} cursor-default opacity-70`}>{email}</div>
          </div>
        </div>

        {isOAuth && (
          <p
            className="mt-4 text-xs leading-5 text-[#8e887f]"
            style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
          >
            Your account is connected via OAuth. Password management is handled by your identity
            provider.
          </p>
        )}
      </section>

      {/* Change password — only for credential users */}
      {!isOAuth && (
        <section className="border-t border-[#2b2b2c] pt-8">
          <h2
            className="mb-5 text-xl leading-tight text-[#f3efe8]"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
          >
            Change password
          </h2>

          <form ref={formRef} onSubmit={handleSubmit} className="max-w-md space-y-4">
            <div>
              <label htmlFor="currentPassword" className={labelClass}>
                Current password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                autoComplete="current-password"
                required
                disabled={isPending}
                className={inputClass}
              />
              {fieldError("currentPassword")}
            </div>

            <div>
              <label htmlFor="newPassword" className={labelClass}>
                New password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                className={inputClass}
              />
              {fieldError("newPassword")}
            </div>

            <div>
              <label htmlFor="confirmPassword" className={labelClass}>
                Confirm new password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                disabled={isPending}
                className={inputClass}
              />
              {fieldError("confirmPassword")}
            </div>

            {result && !result.success && result.errors._form && (
              <p className="text-xs text-red-400">{result.errors._form[0]}</p>
            )}

            {result?.success && (
              <p className="text-xs text-green-400">Password updated successfully.</p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="rounded-full border border-[#ece4d6] bg-[#ece4d6] px-5 py-2.5 text-sm text-[#171717] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
            >
              {isPending ? "Saving..." : "Update password"}
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
