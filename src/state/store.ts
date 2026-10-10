import Storage from 'expo-sqlite/kv-store';
import { useSyncExternalStore } from 'react';

export type Store<T> = {
  get: () => T;
  set: (next: T | ((prev: T) => T)) => void;
  use: () => T;
};

/** Prosty store trzymany w pamięci i zapisywany synchronicznie w kv-store pod `key`. */
export function createStore<T>(key: string, load: (saved: unknown) => T): Store<T> {
  let state = load(read(key));
  const listeners = new Set<() => void>();

  const get = () => state;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return {
    get,
    set(next) {
      state = typeof next === 'function' ? (next as (prev: T) => T)(state) : next;
      Storage.setItemSync(key, JSON.stringify(state));
      listeners.forEach((listener) => listener());
    },
    use: () => useSyncExternalStore(subscribe, get),
  };
}

function read(key: string): unknown {
  try {
    const raw = Storage.getItemSync(key);
    return raw == null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}
