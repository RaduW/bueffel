// The running statistics shown in the app. Functions return new objects.

export interface Counts {
  shown: number
  perfect: number
}

export interface Stats extends Counts {
  streak: number
  byExercise: Record<string, Counts>
}

export function emptyStats(): Stats {
  return { shown: 0, perfect: 0, streak: 0, byExercise: {} };
}

export function exerciseCounts(st: Stats, exerciseId: string): Counts {
  return st.byExercise[exerciseId] ?? { shown: 0, perfect: 0 };
}

function addToExercise(st: Stats, exerciseId: string, delta: Partial<Counts>): Record<string, Counts> {
  const c = exerciseCounts(st, exerciseId);
  return {
    ...st.byExercise,
    [exerciseId]: { shown: c.shown + (delta.shown ?? 0), perfect: c.perfect + (delta.perfect ?? 0) },
  };
}

// A question was started
export function withShown(st: Stats, exerciseId: string): Stats {
  return { ...st, shown: st.shown + 1, byExercise: addToExercise(st, exerciseId, { shown: 1 }) };
}

// A question was finished; perfect if it had no mistakes
export function withFinished(st: Stats, exerciseId: string, perfect: boolean): Stats {
  if (!perfect) return { ...st, streak: 0 };
  return {
    ...st,
    perfect: st.perfect + 1,
    streak: st.streak + 1,
    byExercise: addToExercise(st, exerciseId, { perfect: 1 }),
  };
}

// A started question was skipped
export function withStreakBroken(st: Stats): Stats {
  return { ...st, streak: 0 };
}

export function pct(perfect: number, shown: number): string {
  return shown ? Math.round((perfect / shown) * 100) + '%' : '–';
}
