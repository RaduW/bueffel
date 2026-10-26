// Results per combination of tags, the same for every exercise. A task reports
// one result per score group (a declension question: one; a sentence: one per
// noun phrase); every count in the app is a sum over these. Functions return
// new objects.

// What one score group of a finished task contributes
export interface ScoreResult {
  // e.g. { case: 'Dat', pattern: 'def.Art+adj+noun' }
  tags: Record<string, string>
  // No wrong pick in the group's gaps
  success: boolean
  // Wrong picks in the group's gaps
  mistakes: number
}

export interface ScoreEntry {
  tags: Record<string, string>
  attempts: number
  successes: number
  mistakes: number
}

export type Scoreboard = Record<string, ScoreEntry>

export interface Totals {
  attempts: number
  successes: number
  mistakes: number
}

// The same tags in any order give the same key
export function tagsKey(tags: Record<string, string>): string {
  return Object.keys(tags).sort().map(k => `${k}=${tags[k]}`).join('|');
}

export function withScores(board: Scoreboard, results: ScoreResult[]): Scoreboard {
  const next = { ...board };
  for (const r of results) {
    const key = tagsKey(r.tags);
    const e = next[key] ?? { tags: r.tags, attempts: 0, successes: 0, mistakes: 0 };
    next[key] = {
      ...e,
      attempts: e.attempts + 1,
      successes: e.successes + (r.success ? 1 : 0),
      mistakes: e.mistakes + r.mistakes,
    };
  }
  return next;
}

// Sum of the entries that match: every tag in `filter` has that value
export function totals(board: Scoreboard, filter: Record<string, string> = {}): Totals {
  const t = { attempts: 0, successes: 0, mistakes: 0 };
  for (const e of Object.values(board)) {
    if (Object.entries(filter).some(([k, v]) => e.tags[k] !== v)) continue;
    t.attempts += e.attempts;
    t.successes += e.successes;
    t.mistakes += e.mistakes;
  }
  return t;
}
