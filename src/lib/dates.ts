/** Date maths for the anniversary counter. All dates are local calendar days. */

export type Together = {
  start: Date;
  months: number;
  /** Days since the last monthiversary. */
  days: number;
  totalDays: number;
  /** Days until the next monthiversary (0 = today is a monthiversary). */
  daysToNext: number;
  nextDate: Date;
  isMonthiversaryToday: boolean;
};

/** Parse 'YYYY-MM-DD' as a local date (not UTC). Returns null when invalid. */
export function parseLocalDate(input: string | null | undefined): Date | null {
  if (!input) return null;
  const m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(input.trim());
  if (!m) return null;
  const y = +m[1];
  const mo = +m[2] - 1;
  const d = +m[3];
  const date = new Date(y, mo, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo || date.getDate() !== d) return null;
  return date;
}

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** The monthiversary `n` months after `start`, clamping e.g. Jan 31 → Feb 28. */
export function addMonthsClamped(start: Date, n: number): Date {
  const y = start.getFullYear();
  const m = start.getMonth() + n;
  const lastDay = new Date(y, m + 1, 0).getDate();
  return new Date(y, m, Math.min(start.getDate(), lastDay));
}

const dayDiff = (a: Date, b: Date) =>
  Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86_400_000);

export function computeTogether(start: Date, now: Date = new Date()): Together | null {
  const today = startOfDay(now);
  const s = startOfDay(start);
  if (s.getTime() > today.getTime()) return null;
  let months = (today.getFullYear() - s.getFullYear()) * 12 + (today.getMonth() - s.getMonth());
  while (months > 0 && addMonthsClamped(s, months).getTime() > today.getTime()) months--;
  const last = addMonthsClamped(s, months);
  const next = addMonthsClamped(s, months + 1);
  const days = dayDiff(last, today);
  return {
    start: s,
    months,
    days,
    totalDays: dayDiff(s, today),
    daysToNext: days === 0 ? 0 : dayDiff(today, next),
    nextDate: days === 0 ? last : next,
    isMonthiversaryToday: days === 0 && months > 0,
  };
}

export function formatLongDate(d: Date): string {
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
}
