// Run: npm test   — checks the anniversary maths.
import assert from 'node:assert/strict';
import { computeTogether, parseLocalDate, addMonthsClamped } from '../src/lib/dates.ts';

const d = (s: string) => parseLocalDate(s)!;
let n = 0;
const t = (name: string, fn: () => void) => {
  fn();
  n++;
  console.log('✓', name);
};

t('parses valid dates and rejects invalid ones', () => {
  assert.equal(d('2026-02-28').getDate(), 28);
  assert.equal(parseLocalDate('2026-02-30'), null);
  assert.equal(parseLocalDate('hello'), null);
  assert.equal(parseLocalDate(null), null);
});

t('same day = 0 months, 0 days', () => {
  const r = computeTogether(d('2026-05-10'), d('2026-05-10'))!;
  assert.equal(r.months, 0);
  assert.equal(r.days, 0);
  assert.equal(r.isMonthiversaryToday, false);
});

t('exact monthiversary', () => {
  const r = computeTogether(d('2026-01-17'), d('2026-11-17'))!;
  assert.equal(r.months, 10);
  assert.equal(r.days, 0);
  assert.equal(r.daysToNext, 0);
  assert.equal(r.isMonthiversaryToday, true);
  assert.equal(r.totalDays, 304);
});

t('day before monthiversary', () => {
  const r = computeTogether(d('2026-01-17'), d('2026-11-16'))!;
  assert.equal(r.months, 9);
  assert.equal(r.days, 30);
  assert.equal(r.daysToNext, 1);
});

t('month-end clamping (Jan 31 → Feb 28)', () => {
  assert.equal(addMonthsClamped(d('2026-01-31'), 1).getDate(), 28);
  const r = computeTogether(d('2026-01-31'), d('2026-02-28'))!;
  assert.equal(r.months, 1);
  assert.equal(r.days, 0);
  const r2 = computeTogether(d('2026-01-31'), d('2026-03-30'))!;
  assert.equal(r2.months, 1);
  assert.equal(r2.days, 30);
  assert.equal(r2.daysToNext, 1);
});

t('crosses a year boundary', () => {
  const r = computeTogether(d('2025-12-05'), d('2026-02-07'))!;
  assert.equal(r.months, 2);
  assert.equal(r.days, 2);
});

t('future start date returns null', () => {
  assert.equal(computeTogether(d('2027-01-01'), d('2026-11-17')), null);
});

console.log(`\n${n} date tests passed.`);
