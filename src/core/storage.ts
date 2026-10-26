// Settings and statistics in localStorage, one key per exercise, plus the theme.
// Every access is guarded: storage can be unavailable (private mode, blocked
// site data) and the app then works for the current visit only.

import { emptyProgress, type Progress } from './stats.ts'

export interface Saved<S> {
  settings: S
  progress: Progress
}

// The keys carry the app's name: other apps on the same origin
// (e.g. raduw.github.io) share this storage
const exerciseKey = (id: string) => `bueffel-ex-${id}-v1`;
const THEME_KEY = 'bueffel-theme';
// Earlier versions; dropped, not migrated
const OLD_KEYS = ['bueffel-state-v1'];

// defaults: the exercise's default settings, also filling settings added since the last save
export function loadExercise<S extends object>(id: string, defaults: S): Saved<S> {
  try {
    for (const k of OLD_KEYS) localStorage.removeItem(k);
    const saved = JSON.parse(localStorage.getItem(exerciseKey(id)) ?? 'null');
    if (saved?.settings && saved.progress?.scores) {
      return { settings: { ...defaults, ...saved.settings }, progress: { ...emptyProgress(), ...saved.progress } };
    }
  } catch { /* ignore corrupt or blocked storage */ }
  return { settings: defaults, progress: emptyProgress() };
}

export function saveExercise<S>(id: string, saved: Saved<S>) {
  try {
    localStorage.setItem(exerciseKey(id), JSON.stringify(saved));
  } catch { /* storage unavailable: stats live for this session only */ }
}

// A small per-device preference (e.g. which tables a grammar page shows),
// stored as JSON under bueffel-<name>
export function loadPref<T>(name: string, fallback: T): T {
  try {
    const v = localStorage.getItem('bueffel-' + name);
    return v === null ? fallback : JSON.parse(v);
  } catch {
    return fallback;
  }
}

export function savePref(name: string, value: unknown) {
  try {
    localStorage.setItem('bueffel-' + name, JSON.stringify(value));
  } catch { /* storage unavailable: kept for this visit only */ }
}

// App-wide: move on by itself after a task solved without mistakes (on by default)
const AUTO_ADVANCE_PREF = 'auto-advance';

export function loadAutoAdvance(): boolean {
  return loadPref<boolean>(AUTO_ADVANCE_PREF, true) !== false;
}

export function saveAutoAdvance(on: boolean) {
  savePref(AUTO_ADVANCE_PREF, on);
}

// 'system' follows the device's light/dark setting; 'light' and 'dark' override it
export type Theme = 'system' | 'light' | 'dark'

export function loadTheme(): Theme {
  try {
    const t = localStorage.getItem(THEME_KEY);
    return t === 'light' || t === 'dark' ? t : 'system';
  } catch {
    return 'system';
  }
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch { /* storage unavailable: theme lasts for this visit only */ }
}

export function applyTheme(theme: Theme) {
  if (theme === 'light' || theme === 'dark') document.documentElement.dataset.theme = theme;
  else delete document.documentElement.dataset.theme;
}
