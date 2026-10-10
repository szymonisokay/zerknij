import { dayKey, nextTimeOfDay } from '@/lib/format';

import { settingsStore } from './settings';
import { createStore } from './store';

export type Phase = 'work' | 'break';

export type Session = {
  phase: Phase;
  /** Numer bieżącego cyklu (praca + przerwa), od 1. */
  cycle: number;
  workMs: number;
  breakMs: number;
  /** Kiedy kończy się bieżąca faza (gdy timer działa). */
  endsAt: number;
  /** Ile zostało z fazy w chwili pauzy; null = timer działa. */
  pausedLeft: number | null;
  startedAt: number;
  maxCycles: number | null;
  stopAt: number | null;
  notifyOnEnd: boolean;
};

export type SessionEvent = 'breakStart' | 'breakEnd' | 'end';

export const sessionStore = createStore<Session | null>('session', (saved) => (saved as Session) ?? null);
export const useSession = sessionStore.use;

/** Bieżący czas zaokrąglony do pełnej sekundy – dzięki temu odliczanie zmienia się równo z zegarem. */
export const nowSec = () => Math.round(Date.now() / 1000) * 1000;

export const timeLeft = (s: Session, now: number) => s.pausedLeft ?? Math.max(0, s.endsAt - now);
export const phaseLength = (s: Session) => (s.phase === 'work' ? s.workMs : s.breakMs);
export const isLastCycle = (s: Session) => s.maxCycles != null && s.cycle >= s.maxCycles;

export function startSession(now = nowSec()) {
  const st = settingsStore.get();
  const workMs = st.workMin * 60_000;
  sessionStore.set({
    phase: 'work',
    cycle: 1,
    workMs,
    breakMs: st.breakSec * 1000,
    endsAt: now + workMs,
    pausedLeft: null,
    startedAt: now,
    maxCycles: st.limitMode === 'count' ? st.limitCount : null,
    stopAt: st.limitMode === 'until' ? nextTimeOfDay(st.limitTime, now) : null,
    notifyOnEnd: st.limitMode !== 'none' && st.notifyOnEnd,
  });
}

export function stopSession() {
  sessionStore.set(null);
}

export function togglePause(now = nowSec()) {
  sessionStore.set((s) => {
    if (!s) return s;
    return s.pausedLeft == null
      ? { ...s, pausedLeft: Math.max(0, s.endsAt - now) }
      : { ...s, endsAt: now + s.pausedLeft, pausedLeft: null };
  });
}

/** „Przerwa teraz” – kończy pracę przed czasem. */
export function breakNow(now = nowSec()) {
  sessionStore.set((s) =>
    s?.phase === 'work' ? { ...s, phase: 'break', endsAt: now + s.breakMs, pausedLeft: null } : s,
  );
}

/** „Pomiń przerwę” – od razu następny cykl pracy (albo koniec sesji, jeśli to był ostatni). */
export function skipBreak(now = nowSec()) {
  const s = sessionStore.get();
  if (s?.phase !== 'break') return;
  bumpStat('skipped', now);
  sessionStore.set(nextCycle(s, now));
}

/**
 * Przesuwa sesję o wszystkie fazy, które minęły do `now` (także gdy aplikacja była w tle).
 * Zwraca zdarzenia, żeby ekran mógł zawibrować.
 */
export function advance(now = Date.now()): SessionEvent[] {
  let s = sessionStore.get();
  if (!s) return [];
  const events: SessionEvent[] = [];

  while (s) {
    if (s.stopAt != null && now >= s.stopAt && (s.pausedLeft != null || s.stopAt <= s.endsAt)) {
      s = null;
      events.push('end');
    } else if (s.pausedLeft == null && now >= s.endsAt) {
      if (s.phase === 'work') {
        s = { ...s, phase: 'break', endsAt: s.endsAt + s.breakMs };
        events.push('breakStart');
      } else {
        bumpStat('breaks', s.endsAt);
        s = nextCycle(s, s.endsAt);
        events.push(s ? 'breakEnd' : 'end');
      }
    } else {
      break;
    }
  }

  if (events.length) sessionStore.set(s);
  return events;
}

function nextCycle(s: Session, at: number): Session | null {
  if (isLastCycle(s)) return null;
  return { ...s, phase: 'work', cycle: s.cycle + 1, endsAt: at + s.workMs, pausedLeft: null };
}

/* ───────────── Statystyki dzienne ───────────── */

type Stats = { day: string; breaks: number; skipped: number };

const statsStore = createStore<Stats>(
  'stats',
  (saved) => (saved as Stats) ?? { day: '', breaks: 0, skipped: 0 },
);

function bumpStat(field: 'breaks' | 'skipped', at: number) {
  const day = dayKey(at);
  statsStore.set((prev) => {
    const base = prev.day === day ? prev : { day, breaks: 0, skipped: 0 };
    return { ...base, [field]: base[field] + 1 };
  });
}

export function useTodayStats(now: number): Stats {
  const stats = statsStore.use();
  const day = dayKey(now);
  return stats.day === day ? stats : { day, breaks: 0, skipped: 0 };
}
