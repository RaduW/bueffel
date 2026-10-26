// An exercise's running statistics: the scoreboard and the current streak.
// The header tally is derived from them. Functions return new objects.

import { totals, withScores, type ScoreResult, type Scoreboard } from './scores.ts'

export interface Progress {
  scores: Scoreboard
  // Score groups in a row without a mistake
  streak: number
}

// The numbers in the header
export interface Tally {
  shown: number
  perfect: number
  streak: number
}

export function emptyProgress(): Progress {
  return { scores: {}, streak: 0 };
}

// Add the results of a finished task. The streak follows the groups in order,
// so a mistake in a sentence's second phrase ends it after the first
export function withResults(p: Progress, results: ScoreResult[]): Progress {
  let streak = p.streak;
  for (const r of results) streak = r.success ? streak + 1 : 0;
  return { scores: withScores(p.scores, results), streak };
}

export function tally(p: Progress): Tally {
  const t = totals(p.scores);
  return { shown: t.attempts, perfect: t.successes, streak: p.streak };
}

export function pct(perfect: number, shown: number): string {
  return shown ? Math.round((perfect / shown) * 100) + '%' : '–';
}
