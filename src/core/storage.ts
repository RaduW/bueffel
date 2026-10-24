// Settings, statistics and preferences in localStorage. Every access is guarded:
// storage can be unavailable (private mode, blocked site data) and the app
// then works for the current visit only.

import { defaultSettings, type Settings } from './settings.ts'
import { emptyStats, type Stats } from './stats.ts'

export interface State {
  settings: Settings
  stats: Stats
}

// The keys carry the app's name: other apps on the same origin
// (e.g. raduw.github.io) share this storage
const STATE_KEY = 'bueffel-state-v1';
const THEME_KEY = 'bueffel-theme';
export const VIEW_KEY = 'bueffel-view';

export function defaultState(): State {
  return { settings: defaultSettings(), stats: emptyStats() };
}

export function loadState(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(STATE_KEY) ?? 'null');
    if (saved && saved.settings && saved.stats) return saved;
  } catch { /* ignore corrupt or blocked storage */ }
  return defaultState();
}

export function saveState(state: State) {
  try {
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  } catch { /* storage unavailable: stats live for this session only */ }
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

export function saveView(view: string) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch { /* storage unavailable: the link still works for this visit */ }
}
