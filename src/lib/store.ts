import { useSyncExternalStore } from 'react';

/** Tiny global store (no extra dependency). */
export type SkyMode = 'day' | 'dusk' | 'night';

type State = {
  soundOn: boolean;
  musicPlaying: boolean;
  skyMode: SkyMode;
  /** Brightness boost while the envelope opens (0..1). */
  glow: number;
  /** Hide every piece of UI chrome (screenshot mode). */
  cleanMode: boolean;
  opened: boolean;
};

let state: State = {
  soundOn: false,
  musicPlaying: false,
  skyMode: 'day',
  glow: 0,
  cleanMode: false,
  opened: false,
};
const listeners = new Set<() => void>();

export const store = {
  get: () => state,
  set(patch: Partial<State>) {
    let changed = false;
    for (const k in patch) {
      const key = k as keyof State;
      if (state[key] !== patch[key]) changed = true;
    }
    if (!changed) return;
    state = { ...state, ...patch };
    listeners.forEach((l) => l());
  },
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
};

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(store.subscribe, () => selector(state), () => selector(state));
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const isCoarsePointer = () =>
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

/** Safe localStorage helpers (private windows may throw). */
export const storage = {
  get<T>(key: string, fallback: T): T {
    try {
      const v = localStorage.getItem(key);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
};
