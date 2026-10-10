import { useSyncExternalStore } from 'react';
import { PermissionsAndroid } from 'react-native';

import { dayKey, nextTimeOfDay } from '@/lib/format';

import Timer, { type Session, type Stats, type TimerState } from '../../modules/zerknij-timer';
import { settingsStore, type Settings } from './settings';

export type { Phase, Session } from '../../modules/zerknij-timer';

/*
 * Sesją zarządza natywny moduł (działa też w tle, gdy JS śpi). Tutaj trzymamy tylko kopię
 * jego stanu dla Reacta – aktualizowaną zdarzeniem onChange i wynikiem każdej akcji.
 */
let state: TimerState = Timer.getState();
const listeners = new Set<() => void>();

function setState(next: TimerState) {
  state = next;
  listeners.forEach((listener) => listener());
}

Timer.addListener('onChange', setState);

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const useTimerState = () => useSyncExternalStore(subscribe, () => state);

export const useSession = () => useTimerState().session;

export function useTodayStats(now: number): Stats {
  const { stats } = useTimerState();
  const day = dayKey(now);
  return stats.day === day ? stats : { day, breaks: 0, skipped: 0 };
}

export const timeLeft = (s: Session, now: number) => s.pausedLeft ?? Math.max(0, s.endsAt - now);
export const phaseLength = (s: Session) => (s.phase === 'work' ? s.workMs : s.breakMs);
export const isLastCycle = (s: Session) => s.maxCycles != null && s.cycle >= s.maxCycles;

export async function startSession() {
  // Bez zgody na powiadomienia timer działa, ale nie widać go w tle – pytamy przy pierwszym starcie.
  await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS).catch(() => null);
  const st = settingsStore.get();
  // Samsung usypia aplikacje w tle – raz prosimy o zwolnienie z optymalizacji baterii.
  if (!st.askedBackground && !Timer.isBackgroundUnrestricted()) {
    settingsStore.set({ ...st, askedBackground: true });
    Timer.requestBackgroundUnrestricted();
  }
  setState(
    Timer.start({
      workMs: st.workMin * 60_000,
      breakMs: st.breakSec * 1000,
      maxCycles: st.limitMode === 'count' ? st.limitCount : null,
      stopAt: st.limitMode === 'until' ? nextTimeOfDay(st.limitTime, Date.now()) : null,
      notifyOnEnd: st.limitMode !== 'none' && st.notifyOnEnd,
    }),
  );
}

export const togglePause = () => setState(Timer.togglePause());
export const breakNow = () => setState(Timer.breakNow());
export const skipBreak = () => setState(Timer.skipBreak());
export const stopSession = () => setState(Timer.stop());

/** Przesuwa sesję o fazy, które minęły (zmiany przyjdą zdarzeniem onChange). */
export const syncSession = () => {
  Timer.sync();
};

/* Ustawienia potrzebne w tle (dźwięki, wibracje, pełny ekran) przekazujemy do modułu natywnego. */
function pushConfig(s: Settings) {
  Timer.setConfig({
    sound: s.sound,
    vibration: s.vibration,
    breakStartSound: s.breakStartSound?.uri ?? null,
    breakEndSound: s.breakEndSound?.uri ?? null,
    fullScreenBreak: s.fullScreenBreak,
    pauseOnScreenOff: s.pauseOnScreenOff,
  });
}

pushConfig(settingsStore.get());
settingsStore.subscribe(() => pushConfig(settingsStore.get()));
