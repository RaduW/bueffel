// The whole app. Owns settings, stats and the current question; the
// components below it only display them and report clicks.
//
// variant: 'desktop' (index.html) or 'mobile' (mobile.html). The two share all
// logic and differ only in where things are placed.

import { useEffect, useRef, useState } from 'react'
import { CASES } from '../core/grammar.ts'
import { clearHistory, recordResult, type DayCounts } from '../core/history.ts'
import { answer, createQuestion, type Question } from '../core/question.ts'
import { settingsProblem, type Settings } from '../core/settings.ts'
import { emptyStats, withFinished, withShown, withStreakBroken } from '../core/stats.ts'
import { loadState, saveState } from '../core/storage.ts'
import { Breakdown } from './Breakdown.tsx'
import { Header } from './Header.tsx'
import { QuestionCard } from './QuestionCard.tsx'
import { ResultBanner } from './ResultBanner.tsx'
import { SettingsDialog } from './SettingsDialog.tsx'
import { TablesDialog } from './TablesDialog.tsx'

export type Variant = 'desktop' | 'mobile'

// Pause after a solved question before moving on by itself
const ADVANCE_DELAY_MS = 1000;

// Read once at startup; saved again whenever settings or stats change
const initial = loadState();

export function App({ variant }: { variant: Variant }) {
  const [settings, setSettings] = useState(initial.settings);
  const [stats, setStats] = useState(initial.stats);
  const [question, setQuestion] = useState(() => createQuestion(initial.settings));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(false);
  const nextButton = useRef<HTMLButtonElement>(null);

  // Read by the auto-advance timer when it fires, not when it is started
  const dialogOpen = useRef(false);
  dialogOpen.current = settingsOpen || tablesOpen;

  useEffect(() => saveState({ settings, stats }), [settings, stats]);

  function newQuestion() {
    setQuestion(createQuestion(settings, question?.key));
  }

  // Move on by itself shortly after a question is solved; Next still works for
  // skipping the wait. Don't swap the question behind an open dialog
  useEffect(() => {
    if (!question?.finished) return;
    const timer = setTimeout(() => {
      if (!dialogOpen.current) setQuestion(createQuestion(settings, question.key));
    }, ADVANCE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [question, settings]);

  // Enter moves on from a solved question (on the Next button, the click does it)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !dialogOpen.current && question?.finished && document.activeElement !== nextButton.current) {
        setQuestion(createQuestion(settings, question.key));
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [question, settings]);

  function choose(slotIndex: number, opt: string) {
    if (!question) return;
    const outcome = answer(question, slotIndex, opt);
    if (outcome.result === 'ignored') return;
    const q = outcome.question;
    setQuestion(q);

    // A question counts as shown once the user starts answering it,
    // so reloading the page or changing settings doesn't inflate the count
    if (outcome.started) {
      setStats(st => withShown(st, q.exercise.id));
      record(q, { shown: 1 });
    }
    if (outcome.result === 'wrong') record(q, { mistakes: 1 });
    if (outcome.finished) {
      const perfect = q.mistakes === 0;
      setStats(st => withFinished(st, q.exercise.id, perfect));
      if (perfect) record(q, { perfect: 1 });
    }
  }

  function skip() {
    if (question && question.touched && !question.finished) setStats(withStreakBroken);
    newQuestion();
  }

  function resetStats() {
    if (!confirm('Reset the current statistics?\n\nYour daily history is kept. To delete it, use Settings → Clear history.')) return;
    setStats(emptyStats());
    newQuestion();
  }

  // Only this deletes the long-term history (IndexedDB, see history.ts).
  // Returns the message to show, or null if the user cancelled
  async function deleteHistory(): Promise<string | null> {
    if (!confirm('Delete the whole daily history?\n\nThis cannot be undone. The current statistics are kept.')) return null;
    try {
      await clearHistory();
      return 'History cleared.';
    } catch (e) {
      console.warn('Could not clear daily history', e);
      return 'Could not clear the history.';
    }
  }

  function changeSettings(s: Settings) {
    setSettings(s);
    // Keep a question the user has already started; otherwise draw a new one
    if (!question || !question.touched || question.finished) setQuestion(createQuestion(s, question?.key));
  }

  const problem = settingsProblem(settings);

  const header = (
    <Header
      stats={stats}
      iconSize={variant === 'mobile' ? 24 : 22}
      onOpenTables={() => setTablesOpen(true)}
      onOpenSettings={() => setSettingsOpen(true)}
    />
  );

  const dialogs = (
    <>
      <TablesDialog
        open={tablesOpen}
        exerciseIds={settings.exercises}
        variant={variant}
        onClose={() => setTablesOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        problem={problem}
        variant={variant}
        onChange={changeSettings}
        // The dialog stays open until the settings allow at least one question
        onClose={() => { if (!problem) setSettingsOpen(false); }}
        onClosed={() => setSettingsOpen(false)}
        onClearHistory={deleteHistory}
        onResetStats={resetStats}
      />
    </>
  );

  const result = question?.finished && (
    <ResultBanner mistakes={question.mistakes} nextRef={nextButton} onNext={newQuestion} label={variant === 'mobile' ? 'Next' : 'Next ⏎'} />
  );

  const card = question && (
    <QuestionCard question={question} onChoose={choose}>
      {variant === 'desktop' && result}
    </QuestionCard>
  );

  if (variant === 'mobile') {
    return (
      <>
        {header}
        {dialogs}
        <main>{card}</main>
        {/* Thumb-reach bar: Skip while answering, result + Next once solved */}
        <nav className="bottom-bar">
          {result || <button id="skip" onClick={skip}>Skip</button>}
        </nav>
      </>
    );
  }

  return (
    <main>
      {header}
      {dialogs}
      {card}
      <Breakdown stats={stats} onSkip={skip} onReset={resetStats} />
    </main>
  );
}

// Add to today's record in the long-term history (IndexedDB, see history.ts)
function record(q: Question, delta: Partial<DayCounts>) {
  void recordResult({ exercise: q.exercise.id, caseId: CASES[q.ci].id, gender: q.noun.g, delta });
}
