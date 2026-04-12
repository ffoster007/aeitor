"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { changePasswordAction } from "@/actions/auth";
import { deleteAccountAction } from "@/actions/account";
import { ACCOUNT_DELETE_CONFIRMATION_TEXT } from "@/lib/account-deletion-constants";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ActionResult } from "@/types/actions";

interface AccountSettingsProps {
  username: string;
  email: string;
  isOAuth: boolean;
}

export function AccountSettings({
  username,
  email,
  isOAuth,
}: AccountSettingsProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [result, setResult] = useState<ActionResult | null>(null);
  const [deleteResult, setDeleteResult] = useState<ActionResult | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [locale, setLocale] = useState("en");
  const [timezone, setTimezone] = useState("UTC");
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  useEffect(() => {
    if (typeof navigator !== "undefined") {
      setLocale(navigator.language || "en");
    }

    try {
      setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC");
    } catch {
      setTimezone("UTC");
    }
  }, []);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(async () => {
      const res = await changePasswordAction(formData);
      setResult(res);
      if (res.success) {
        formRef.current?.reset();
      }
    });
  }

  function handleDeleteAccount(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    formData.set("locale", locale);
    formData.set("timezone", timezone);

    startDeleteTransition(async () => {
      const res = await deleteAccountAction(formData);
      setDeleteResult(res);

      if (res.success) {
        setDeleteOpen(false);
        router.push("/auth/signin?deleted=1");
        router.refresh();
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

      <section className="border-t border-[#4b2424] pt-8">
        <h2
          className="mb-2 text-xl leading-tight text-[#ffb3b3]"
          style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
        >
          Danger zone
        </h2>
        <p
          className="max-w-2xl text-sm leading-6 text-[#d8b2b2]"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Deleting your account starts a two-step process: immediate soft deletion now, then
          permanent hard deletion within 30 days. Active subscriptions are canceled before account
          deletion is finalized.
        </p>

        <button
          type="button"
          onClick={() => {
            setDeleteResult(null);
            setDeleteOpen(true);
          }}
          className="mt-4 rounded-full border border-[#a94444] bg-[#351919] px-5 py-2.5 text-sm text-[#ffd8d8] transition-opacity hover:opacity-90 cursor-pointer"
          style={{ fontFamily: "'Helvetica Neue', sans-serif" }}
        >
          Delete account
        </button>

        <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
          <DialogContent className="max-w-xl border-[#4a2d2d] bg-[#1b1616] text-[#f9eded]">
            <DialogHeader className="space-y-3">
              <DialogTitle
                className="text-2xl text-[#ffd9d9]"
                style={{ fontFamily: "'Georgia', 'Times New Roman', serif", fontWeight: 400 }}
              >
                Confirm account deletion
              </DialogTitle>
              <DialogDescription className="text-sm leading-6 text-[#d9b9b9]">
                This action is irreversible after the hard-delete deadline.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 text-sm text-[#e8cfcf]">
              <p className="text-xs uppercase tracking-[0.2em] text-[#caa0a0]">Data impacted</p>
              <ul className="space-y-1 text-sm">
                <li>- Profile data (username, email, credentials)</li>
                <li>- Vendors, alerts, and related contract metadata</li>
                <li>- Sessions and auth tokens</li>
                <li>- Billing linkage and subscription access</li>
              </ul>
              <p className="text-xs leading-5 text-[#cfa9a9]">
                Refund policy: subscription cancellation does not automatically issue a refund.
                If you were charged recently, contact support with your charge ID for manual review.
              </p>
              <p className="text-xs leading-5 text-[#cfa9a9]">
                GDPR note: deletion requests are hard-deleted within 30 days with an audit trail.
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <div>
                <label htmlFor="confirmation" className={labelClass}>
                  Type {ACCOUNT_DELETE_CONFIRMATION_TEXT} to confirm
                </label>
                <input
                  id="confirmation"
                  name="confirmation"
                  type="text"
                  required
                  disabled={isDeleting}
                  className={inputClass}
                />
                {!deleteResult?.success && deleteResult?.errors.confirmation?.[0] && (
                  <p className="mt-1.5 text-xs text-red-400">{deleteResult.errors.confirmation[0]}</p>
                )}
              </div>

              {!deleteResult?.success && deleteResult?.errors._form?.[0] && (
                <p className="text-xs text-red-400">{deleteResult.errors._form[0]}</p>
              )}

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDeleteOpen(false)}
                  className="rounded-full border border-[#4a3a3a] px-4 py-2 text-xs text-[#c9b7b7] hover:bg-[#272020] cursor-pointer "
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isDeleting}
                  className="rounded-full border border-[#b65151] bg-[#7a2d2d] px-4 py-2 text-xs text-[#ffe3e3] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  {isDeleting ? "Deleting..." : "Permanently delete"}
                </button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </section>
    </div>
  );
}
