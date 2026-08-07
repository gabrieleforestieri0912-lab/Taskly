// Pure calendar/recurrence helpers shared by the list, calendar and the tests.
// All date math runs in UTC so results are deterministic and timezone-stable.

const dayMs = 86400000;

const pad = (n: number) => String(n).padStart(2, "0");

function fmtIso(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m, d));
  return `${dt.getUTCFullYear()}-${pad(dt.getUTCMonth() + 1)}-${pad(dt.getUTCDate())}`;
}

function fromIso(date: string): [number, number, number] {
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return [NaN, NaN, NaN];
  return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
}

function lastDayOfMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
}

/** Advance to (y, m, d) clamping d to the target month length (e.g. Feb 29 → Feb 28). */
function advanceTo(y: number, m: number, d: number): string {
  const last = lastDayOfMonth(y, m);
  return fmtIso(y, m, Math.min(d, last));
}

/**
 * Advances a YYYY-MM-DD deadline to its next occurrence.
 * Returns the input unchanged when the date is missing/invalid or when no
 * recurrence is set. Used to roll a recurring task to the next occurrence and
 * reopen it (ItemList).
 */
export function nextDeadline(
  deadline: string | null | undefined,
  recurrence: string,
): string | null | undefined {
  if (!deadline || !recurrence) return deadline;
  const [y, m, d] = fromIso(deadline);
  if (!Number.isFinite(y)) return deadline;
  if (recurrence === "giornaliero") return fmtIso(y, m, d + 1);
  if (recurrence === "settimanale") return fmtIso(y, m, d + 7);
  if (recurrence === "mensile") return advanceTo(y, m + 1, d);
  if (recurrence === "annuale") return advanceTo(y + 1, m, d);
  return deadline;
}

/**
 * Whether a task falls on a given YYYY-MM-DD, expanding recurring tasks.
 * - no recurrence: only the exact date.
 * - never repeats before its start date.
 * - daily: every day from start.
 * - weekly: every 7 days from start.
 * - monthly: same day-of-month as the start date.
 */
export function isTaskOnDay(
  task: { date?: string; recurrence?: string } | null | undefined,
  dateStr: string,
): boolean {
  if (!task || !task.date) return false;
  if (!task.recurrence) return task.date === dateStr;
  if (dateStr < task.date) return false;
  const start = new Date(task.date + "T00:00:00Z").getTime();
  const d = new Date(dateStr + "T00:00:00Z").getTime();
  const dayDiff = Math.round((d - start) / dayMs);
  if (task.recurrence === "daily") return true;
  if (task.recurrence === "weekly") return dayDiff % 7 === 0;
  if (task.recurrence === "monthly") {
    return Number(dateStr.slice(8, 10)) === Number(task.date.slice(8, 10));
  }
  return task.date === dateStr;
}

/** Whole days between two YYYY-MM-DD strings (b - a). */
export function daysBetween(a: string, b: string): number {
  return Math.round(
    (new Date(b + "T00:00:00Z").getTime() -
      new Date(a + "T00:00:00Z").getTime()) /
      dayMs,
  );
}