// Long-term per-day results in IndexedDB.
//
// The numbers shown in the app come from localStorage (see storage.ts); this is a
// separate, permanent log that "Reset statistics" does not touch; only
// Settings → Clear history deletes it (for that exercise). Nothing reads it
// yet, it's kept for showing progress over time later.
//
// Database "bueffel-history", object store "results", one record per local
// calendar day and exercise, keyed by [date, exercise]:
//
//   {
//     date: '2026-10-26',
//     exercise: 'declension-sentences',
//     scores: { 'case=Dat|pattern=def.Art+noun': { tags, attempts, successes, mistakes }, ... },
//   }
//
// scores has the same shape as the exercise's scoreboard (scores.ts), so the
// day's totals are the sum over its entries.

import { withScores, type ScoreResult, type Scoreboard } from './scores.ts'

const DB_NAME = 'bueffel-history';
// Version 1 had a "days" store with declension-only fields; it is dropped
const DB_VERSION = 2;
const STORE = 'results';

export interface DayRecord {
  date: string
  exercise: string
  scores: Scoreboard
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (db.objectStoreNames.contains('days')) db.deleteObjectStore('days');
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: ['date', 'exercise'] }).createIndex('exercise', 'exercise');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Local calendar date, so a day matches the learner's day, not UTC
function today(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Runs fn in one readwrite transaction and resolves when it has completed
async function write(fn: (store: IDBObjectStore) => void): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    fn(tx.objectStore(STORE));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

// Add a finished task's results to today's record for the exercise.
// Read-modify-write inside one transaction, so rapid clicks can't lose updates
export async function recordResults(exercise: string, results: ScoreResult[]): Promise<void> {
  void requestPersistentStorage();
  try {
    await write(store => {
      const date = today();
      const get = store.get([date, exercise]);
      get.onsuccess = () => {
        const day: DayRecord = get.result ?? { date, exercise, scores: {} };
        store.put({ ...day, scores: withScores(day.scores, results) });
      };
    });
  } catch (e) {
    // IndexedDB unavailable (e.g. some private modes): the app keeps working
    console.warn('Could not save daily history', e);
  }
}

// Delete every day's record of one exercise (its Settings → Clear history)
export async function clearHistory(exercise: string): Promise<void> {
  await write(store => {
    const req = store.index('exercise').openKeyCursor(IDBKeyRange.only(exercise));
    req.onsuccess = () => {
      const cursor = req.result;
      if (!cursor) return;
      store.delete(cursor.primaryKey);
      cursor.continue();
    };
  });
}

// Ask the browser not to evict our storage under disk pressure. Chrome and
// Safari decide silently; Firefox asks the user once. Data is kept either way,
// just not guaranteed if the device runs out of space.
let persistRequested = false;

async function requestPersistentStorage() {
  if (persistRequested) return;
  persistRequested = true;
  try {
    if (navigator.storage && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch { /* not supported */ }
}
