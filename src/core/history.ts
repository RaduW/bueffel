// Long-term per-day results in IndexedDB.
//
// The numbers shown in the app come from localStorage (see storage.ts); this is a
// separate, permanent log that "Reset statistics" does not touch; only
// Settings → Clear history deletes it. Nothing reads it yet, it's kept for
// showing progress over time later.
//
// Database "bueffel-history", object store "days", one record per local
// calendar day, keyed by date:
//
//   {
//     date: '2026-10-18',
//     total:      { shown, perfect, mistakes },
//     byExercise: { def: { shown, perfect, mistakes }, ... },
//     byCase:     { nom: {...}, akk: {...}, dat: {...}, gen: {...} },
//     byGender:   { m: {...}, n: {...}, f: {...}, p: {...} },
//   }
//
// shown    = questions started (first answer clicked)
// perfect  = questions solved without a wrong click
// mistakes = wrong clicks

const DB_NAME = 'bueffel-history';
const DB_VERSION = 1;
const STORE = 'days';

export interface DayCounts {
  shown: number
  perfect: number
  mistakes: number
}

export interface DayRecord {
  date: string
  total: DayCounts
  byExercise: Record<string, DayCounts>
  byCase: Record<string, DayCounts>
  byGender: Record<string, DayCounts>
}

// What a question contributes to the day's record
export interface ResultEvent {
  exercise: string
  caseId: string
  gender: string
  delta: Partial<DayCounts>
}

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'date' });
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

function emptyDay(date: string): DayRecord {
  return { date, total: zero(), byExercise: {}, byCase: {}, byGender: {} };
}

function zero(): DayCounts {
  return { shown: 0, perfect: 0, mistakes: 0 };
}

function add(target: DayCounts, delta: Partial<DayCounts>) {
  target.shown += delta.shown ?? 0;
  target.perfect += delta.perfect ?? 0;
  target.mistakes += delta.mistakes ?? 0;
}

// Read-modify-write inside one transaction, so rapid clicks can't lose updates
export async function recordResult(event: ResultEvent): Promise<void> {
  void requestPersistentStorage();
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      const store = tx.objectStore(STORE);
      const date = today();
      const get = store.get(date);
      get.onsuccess = () => {
        const day: DayRecord = get.result ?? emptyDay(date);
        add(day.total, event.delta);
        add((day.byExercise[event.exercise] ??= zero()), event.delta);
        add((day.byCase[event.caseId] ??= zero()), event.delta);
        add((day.byGender[event.gender] ??= zero()), event.delta);
        store.put(day);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } catch (e) {
    // IndexedDB unavailable (e.g. some private modes): the app keeps working
    console.warn('Could not save daily history', e);
  }
}

// Delete every day's record (Settings → Clear history)
export async function clearHistory(): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
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
