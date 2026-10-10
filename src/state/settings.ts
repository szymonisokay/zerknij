import { createStore } from './store';

export type LimitMode = 'none' | 'count' | 'until';

export type Settings = {
  workMin: number;
  breakSec: number;
  sound: boolean;
  vibration: boolean;
  breakStartSound: string | null;
  breakEndSound: string | null;
  fullScreenBreak: boolean;
  keepAwakeOnBreak: boolean;
  limitMode: LimitMode;
  limitCount: number;
  /** "HH:MM" */
  limitTime: string;
  notifyOnEnd: boolean;
  pauseOnScreenOff: boolean;
};

export const WORK_MIN = { min: 1, max: 90, step: 1 };
export const BREAK_SEC = { min: 5, max: 300, step: 5 };
export const LIMIT_COUNT = { min: 1, max: 99 };

export const PRESETS = [
  { workMin: 20, breakSec: 20 },
  { workMin: 25, breakSec: 30 },
  { workMin: 45, breakSec: 60 },
] as const;

const defaults: Settings = {
  workMin: 20,
  breakSec: 20,
  sound: true,
  vibration: true,
  breakStartSound: null,
  breakEndSound: null,
  fullScreenBreak: true,
  keepAwakeOnBreak: false,
  limitMode: 'none',
  limitCount: 6,
  limitTime: '17:00',
  notifyOnEnd: true,
  pauseOnScreenOff: false,
};

export const settingsStore = createStore<Settings>('settings', (saved) => ({
  ...defaults,
  ...(saved as Partial<Settings>),
}));

export const useSettings = settingsStore.use;

export function updateSettings(patch: Partial<Settings>) {
  settingsStore.set((prev) => ({ ...prev, ...patch }));
}
