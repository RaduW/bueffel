import { useEffect, useState } from 'react'
import { clearHistory, recordResults } from '../core/history.ts'
import type { ScoreResult } from '../core/scores.ts'
import { emptyProgress, withResults } from '../core/stats.ts'
import { loadExercise, saveExercise } from '../core/storage.ts'

// An exercise's settings and statistics, kept in localStorage under its id,
// and its daily history (IndexedDB). The same for every exercise.
// defaults: the exercise's default settings; read once, when the page opens
export function useExerciseProgress<S extends object>(id: string, defaults: S) {
  const [initial] = useState(() => loadExercise(id, defaults));
  const [settings, setSettings] = useState(initial.settings);
  const [progress, setProgress] = useState(initial.progress);

  useEffect(() => saveExercise(id, { settings, progress }), [id, settings, progress]);

  // A task was finished: count its score groups, here and in today's history
  function addResults(results: ScoreResult[]) {
    setProgress(p => withResults(p, results));
    void recordResults(id, results);
  }

  // Returns false if the user cancelled
  function resetStats(): boolean {
    if (!confirm('Reset the statistics of this exercise?\n\nIts daily history is kept. To delete it, use Settings → Clear history.')) return false;
    setProgress(emptyProgress());
    return true;
  }

  // Only this deletes the exercise's long-term history (IndexedDB, see history.ts).
  // Returns the message to show, or null if the user cancelled
  async function deleteHistory(): Promise<string | null> {
    if (!confirm('Delete the whole daily history of this exercise?\n\nThis cannot be undone. The current statistics are kept.')) return null;
    try {
      await clearHistory(id);
      return 'History cleared.';
    } catch (e) {
      console.warn('Could not clear daily history', e);
      return 'Could not clear the history.';
    }
  }

  return { settings, setSettings, progress, addResults, resetStats, deleteHistory };
}
