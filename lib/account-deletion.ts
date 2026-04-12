import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getStripeClient } from "@/lib/stripe";

const HARD_DELETE_DAYS = 30;

function hardDeleteDateFrom(now: Date) {
  const deadline = new Date(now);
  deadline.setDate(deadline.getDate() + HARD_DELETE_DAYS);
  return deadline;
}

export async function requestAccountDeletion(params: {
  userId: string;
  locale?: string;
  timezone?: string;
}) {
  const now = new Date();
  const scheduledHardDeleteAt = hardDeleteDateFrom(now);

  const user = await prisma.user.findUnique({
    where: { id: params.userId },
    include: { subscription: true },
  });

  if (!user || user.deletedAt) {
    throw new Error("ACCOUNT_NOT_FOUND");
  }

  // Billing safety: always cancel active Stripe subscriptions before account deletion.
  if (user.subscription?.stripeSubscriptionId) {
    const stripe = getStripeClient();
    try {
      await stripe.subscriptions.cancel(user.subscription.stripeSubscriptionId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!message.includes("No such subscription")) {
        throw error;
      }
    }
  }

  const tombstoneUsername = `deleted_${user.id.slice(0, 12)}_${randomUUID().slice(0, 6)}`;
  const tombstoneEmail = `deleted+${user.id}@deleted.local`;

  await prisma.$transaction(async (tx) => {
    await tx.accountDeletionAuditLog.create({
      data: {
        userId: user.id,
        event: "SOFT_DELETE_REQUESTED",
        metadata: {
          hadStripeSubscription: Boolean(user.subscription?.stripeSubscriptionId),
          hardDeleteInDays: HARD_DELETE_DAYS,
        },
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: {
        username: tombstoneUsername,
        email: tombstoneEmail,
        password: await bcrypt.hash(randomUUID(), 12),
        deletedAt: now,
        deletionRequestedAt: now,
        scheduledHardDeleteAt,
      },
    });

    await tx.subscription.updateMany({
      where: { userId: user.id },
      data: {
        plan: "FREE",
        status: "CANCELED",
        stripeSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      },
    });

    await tx.refreshToken.deleteMany({ where: { userId: user.id } });

    await tx.accountDeletionRequest.create({
      data: {
        userId: user.id,
        scheduledHardDeleteAt,
        cancellationCompleted: true,
        locale: params.locale,
        timezone: params.timezone,
      },
    });
  });

  return {
    scheduledHardDeleteAt,
  };
}

export async function runHardDeleteSweep(limit = 50) {
  const now = new Date();

  const dueUsers = await prisma.user.findMany({
    where: {
      deletedAt: { not: null },
      scheduledHardDeleteAt: { lte: now },
    },
    select: {
      id: true,
      subscription: {
        select: {
          stripeCustomerId: true,
        },
      },
    },
    take: limit,
  });

  let hardDeleted = 0;
  let failed = 0;

  for (const dueUser of dueUsers) {
    try {
      if (dueUser.subscription?.stripeCustomerId) {
        const stripe = getStripeClient();
        try {
          await stripe.customers.del(dueUser.subscription.stripeCustomerId);
        } catch (error) {
          const message = error instanceof Error ? error.message : "";
          if (!message.includes("No such customer")) {
            throw error;
          }
        }
      }

      await prisma.$transaction(async (tx) => {
        await tx.accountDeletionAuditLog.create({
          data: {
            userId: dueUser.id,
            event: "HARD_DELETE_EXECUTED",
            metadata: { executedAt: now.toISOString() },
          },
        });

        await tx.user.delete({ where: { id: dueUser.id } });

        await tx.accountDeletionRequest.updateMany({
          where: { userId: dueUser.id, status: "PENDING_HARD_DELETE" },
          data: {
            status: "HARD_DELETED",
            hardDeletedAt: now,
            failureReason: null,
          },
        });
      });

      hardDeleted += 1;
    } catch (error) {
      failed += 1;

      await prisma.accountDeletionAuditLog.create({
        data: {
          userId: dueUser.id,
          event: "HARD_DELETE_FAILED",
          metadata: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        },
      });

      await prisma.accountDeletionRequest.updateMany({
        where: { userId: dueUser.id, status: "PENDING_HARD_DELETE" },
        data: {
          status: "FAILED",
          failureReason: error instanceof Error ? error.message : "Unknown error",
        },
      });
    }
  }

  return {
    processed: dueUsers.length,
    hardDeleted,
    failed,
  };
}
