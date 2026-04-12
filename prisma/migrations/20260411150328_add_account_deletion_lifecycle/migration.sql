-- CreateEnum
CREATE TYPE "AccountDeletionStatus" AS ENUM ('PENDING_HARD_DELETE', 'HARD_DELETED', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "deletion_requested_at" TIMESTAMP(3),
ADD COLUMN     "scheduled_hard_delete_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "account_deletion_requests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "status" "AccountDeletionStatus" NOT NULL DEFAULT 'PENDING_HARD_DELETE',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_hard_delete_at" TIMESTAMP(3) NOT NULL,
    "hard_deleted_at" TIMESTAMP(3),
    "cancellation_completed" BOOLEAN NOT NULL DEFAULT false,
    "refund_policy_version" TEXT NOT NULL DEFAULT '2026-04',
    "locale" TEXT,
    "timezone" TEXT,
    "failure_reason" TEXT,

    CONSTRAINT "account_deletion_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "account_deletion_audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_deletion_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "account_deletion_requests_user_id_idx" ON "account_deletion_requests"("user_id");

-- CreateIndex
CREATE INDEX "account_deletion_requests_status_scheduled_hard_delete_at_idx" ON "account_deletion_requests"("status", "scheduled_hard_delete_at");

-- CreateIndex
CREATE INDEX "account_deletion_audit_logs_user_id_created_at_idx" ON "account_deletion_audit_logs"("user_id", "created_at");
