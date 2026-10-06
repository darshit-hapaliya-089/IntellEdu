/**
 * Date helpers for streaks and the daily-activity analytics chart.
 * All day keys are local-time ISO dates formatted as `YYYY-MM-DD`.
 */

export function toDayKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function todayKey(): string {
  return toDayKey(new Date());
}

export function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDayKey(d);
}

/** Returns the day key for `offsetDays` before today (0 = today). */
export function dayKeyOffset(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return toDayKey(d);
}

/** An ordered array of the last `count` day keys, oldest first, ending today. */
export function lastNDayKeys(count: number): string[] {
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    keys.push(dayKeyOffset(i));
  }
  return keys;
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** 3-letter weekday label for a `YYYY-MM-DD` key. */
export function weekdayLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return WEEKDAY_LABELS[date.getDay()];
}

/** Short human label such as `6 Oct`. */
export function shortDateLabel(dayKey: string): string {
  const [year, month, day] = dayKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${day} ${months[date.getMonth()]}`;
}

/** Formats an ISO timestamp as `5 min ago`, `2 h ago`, `3 d ago`. */
export function relativeTime(isoTimestamp: string): string {
  const then = new Date(isoTimestamp).getTime();
  const diffMs = Date.now() - then;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} min ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays} d ago`;

  const diffWeeks = Math.floor(diffDays / 7);
  return `${diffWeeks} w ago`;
}

/** `MM:SS` string from a count of seconds (never negative). */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
