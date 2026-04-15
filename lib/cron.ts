export function isAuthorizedCronRequest(req: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return false;
  }

  const legacySecret = req.headers.get("x-cron-secret");
  if (legacySecret === cronSecret) {
    return true;
  }

  const authorization = req.headers.get("authorization");
  return authorization === `Bearer ${cronSecret}`;
}