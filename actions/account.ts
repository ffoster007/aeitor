"use server";

import { clearAuthCookies } from "@/lib/cookies";
import { ACCOUNT_DELETE_CONFIRMATION_TEXT } from "@/lib/account-deletion-constants";
import { requireUser } from "@/lib/session";
import {
  requestAccountDeletion,
} from "@/lib/account-deletion";
import type { ActionResult } from "@/types/actions";

export async function deleteAccountAction(formData: FormData): Promise<ActionResult> {
  let user;

  try {
    user = await requireUser();
  } catch {
    return { success: false, errors: { _form: ["Unauthorized"] } };
  }

  const confirmation = formData.get("confirmation");
  const locale = formData.get("locale");
  const timezone = formData.get("timezone");

  if (typeof confirmation !== "string" || confirmation !== ACCOUNT_DELETE_CONFIRMATION_TEXT) {
    return {
      success: false,
      errors: { confirmation: [`Please type \"${ACCOUNT_DELETE_CONFIRMATION_TEXT}\" to confirm.`] },
    };
  }

  try {
    await requestAccountDeletion({
      userId: user.sub,
      locale: typeof locale === "string" ? locale : undefined,
      timezone: typeof timezone === "string" ? timezone : undefined,
    });

    await clearAuthCookies();
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to delete account";
    return {
      success: false,
      errors: {
        _form: [
          message === "ACCOUNT_NOT_FOUND"
            ? "Account not found or already deleted."
            : "Could not process account deletion right now. Please try again.",
        ],
      },
    };
  }
}
