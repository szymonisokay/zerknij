/** Polska odmiana: plural(2, 'sekunda', 'sekundy', 'sekund') → 'sekundy'. */
export function plural(n: number, one: string, few: string, many: string) {
  if (n === 1) return one;
  const mod10 = n % 10;
  const mod100 = n % 100;
  return mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? few : many;
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Sekundy → "m:ss", np. 872 → "14:32", 20 → "0:20". */
export function clock(totalSec: number) {
  const sec = Math.max(0, Math.round(totalSec));
  return `${Math.floor(sec / 60)}:${pad(sec % 60)}`;
}

/** Długość przerwy: 20 → "20 s", 60 → "1 min", 90 → "1 min 30 s". */
export function breakLabel(sec: number) {
  if (sec < 60) return `${sec} s`;
  const min = Math.floor(sec / 60);
  const rest = sec % 60;
  return rest ? `${min} min ${rest} s` : `${min} min`;
}

/** Minuty → "45 min" albo "2 h 02 min". */
export function durationLabel(totalMin: number) {
  const min = Math.round(totalMin);
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${pad(min % 60)} min`;
}

/** Godzina z daty: "12:44". */
export function timeOfDay(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** Najbliższe wystąpienie godziny "HH:MM" po `from` (dziś albo jutro). */
export function nextTimeOfDay(time: string, from: number) {
  const [h, m] = time.split(':').map(Number);
  const date = new Date(from);
  date.setHours(h, m, 0, 0);
  if (date.getTime() <= from) date.setDate(date.getDate() + 1);
  return date.getTime();
}

/** Klucz dnia w czasie lokalnym: "2026-10-10". */
export function dayKey(time: number) {
  const date = new Date(time);
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
