import { NativeModule, requireNativeModule } from 'expo';

export type Phase = 'work' | 'break';

export type Session = {
  phase: Phase;
  /** Numer bieżącego cyklu (praca + przerwa), od 1. */
  cycle: number;
  workMs: number;
  breakMs: number;
  /** Kiedy kończy się bieżąca faza (gdy timer działa). */
  endsAt: number;
  /** Długość bieżącej fazy (po „Za 5 min” krótsza niż workMs). */
  phaseMs: number;
  /** Ile zostało z fazy w chwili pauzy; null = timer działa. */
  pausedLeft: number | null;
  startedAt: number;
  maxCycles: number | null;
  stopAt: number | null;
  notifyOnEnd: boolean;
};

export type Stats = { day: string; breaks: number; skipped: number };

export type TimerState = { session: Session | null; stats: Stats };

export type StartOptions = {
  workMs: number;
  breakMs: number;
  maxCycles: number | null;
  stopAt: number | null;
  notifyOnEnd: boolean;
};

export type TimerConfig = {
  sound: boolean;
  vibration: boolean;
  breakStartSound: string | null;
  breakEndSound: string | null;
  fullScreenBreak: boolean;
  pauseOnScreenOff: boolean;
};

/** Dźwięk z systemowego wyboru; uri = null oznacza domyślny dźwięk powiadomień. */
export type PickedSound = { uri: string | null; title: string | null };

type Events = {
  onChange: (state: TimerState) => void;
};

declare class ZerknijTimerModule extends NativeModule<Events> {
  getState(): TimerState;
  /** Przesuwa sesję o fazy, które już minęły. */
  sync(): TimerState;
  start(options: StartOptions): TimerState;
  togglePause(): TimerState;
  breakNow(): TimerState;
  skipBreak(): TimerState;
  /** „Za 5 min” – odkłada bieżącą przerwę. */
  snoozeBreak(): TimerState;
  stop(): TimerState;
  setConfig(config: TimerConfig): void;
  /** Czy aplikacja jest zwolniona z optymalizacji baterii. */
  isBackgroundUnrestricted(): boolean;
  /** Pokazuje systemowe okno zwolnienia z optymalizacji baterii. */
  requestBackgroundUnrestricted(): boolean;
  pickSound(currentUri: string | null): Promise<PickedSound | null>;
}

/** Natywny timer sesji (usługa pierwszoplanowa, alarmy, powiadomienia). Tylko Android. */
export default requireNativeModule<ZerknijTimerModule>('ZerknijTimer');
