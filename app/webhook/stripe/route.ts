import { POST as stripeWebhookPost } from "@/app/api/stripe/webhook/route";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const POST = stripeWebhookPost;
