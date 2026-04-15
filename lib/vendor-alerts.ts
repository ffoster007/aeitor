export const NOTICE_PERIOD_OPTIONS = [7, 14, 30, 45, 60, 90] as const;

export const DEFAULT_ALERT_DAYS = [...NOTICE_PERIOD_OPTIONS].sort((a, b) => b - a);

export function normalizeAlertDays(alertDays: number[] | null | undefined) {
  const normalized = (alertDays ?? [])
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && NOTICE_PERIOD_OPTIONS.includes(value as (typeof NOTICE_PERIOD_OPTIONS)[number]));

  return [...new Set(normalized)].sort((a, b) => b - a);
}