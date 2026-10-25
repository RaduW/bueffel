// Running totals of score results, one entry per combination of tags.
// Kept in memory only for now. Functions return new objects.

import type { ScoreResult } from './session.ts'

export interface ScoreEntry {
  tags: Record<string, string>
  attempts: number
  successes: number
}

export type Scoreboard = Record<string, ScoreEntry>

// The same tags in any order give the same key
export function tagsKey(tags: Record<string, string>): string {
  return Object.keys(tags).sort().map(k => `${k}=${tags[k]}`).join('|');
}

export function withResults(board: Scoreboard, results: ScoreResult[]): Scoreboard {
  const next = { ...board };
  for (const r of results) {
    const key = tagsKey(r.tags);
    const e = next[key] ?? { tags: r.tags, attempts: 0, successes: 0 };
    next[key] = { ...e, attempts: e.attempts + 1, successes: e.successes + (r.success ? 1 : 0) };
  }
  return next;
}
