// The declension exercise. Owns settings, stats and the current question;
// the components below it only display them and report clicks.
//
// Two layouts on one page: the wide one, and a compact one for phones (bigger
// tap targets, Skip / Next in a bar at the bottom). They differ only in where
// things are placed; switching between them keeps all state.

import { useEffect, useRef, useState } from 'react'
import { CASES } from '../../core/grammar.ts'
import { clearHistory, recordResult, type DayCounts } from '../../core/history.ts'
import { answer, createQuestion, type Question } from '../../core/question.ts'
import { settingsProblem, type Settings } from '../../core/settings.ts'
import { emptyStats, withFinished, withShown, withStreakBroken } from '../../core/stats.ts'
import { loadState, saveState } from '../../core/storage.ts'
import { Breakdown } from './Breakdown.tsx'
import { Header } from '../Header.tsx'
import { QuestionCard } from './QuestionCard.tsx'
import { ResultBanner } from './ResultBanner.tsx'
import { SettingsDialog } from './SettingsDialog.tsx'
import { TablesDialog } from './TablesDialog.tsx'
import { HelpIcon, SettingsIcon } from '../icons.tsx'
import { StatsBar } from '../StatsBar.tsx'
import { useMediaQuery } from '../useMediaQuery.ts'

// Phones in portrait, narrow windows, and phones in landscape (short and touch)
const COMPACT_QUERY = '(max-width: 640px), (pointer: coarse) and (max-height: 500px)';

// Pause after a solved question before moving on by itself
const ADVANCE_DELAY_MS = 1000;

export function Declension({ onFinish }: { onFinish: () => void }) {
  const compact = useMediaQuery(COMPACT_QUERY);
  // Read when the exercise opens; saved again whenever settings or stats change
  const [initial] = useState(loadState);
  const [settings, setSettings] = useState(initial.settings);
  const [stats, setStats] = useState(initial.stats);
  const [question, setQuestionState] = useState(() => createQuestion(initial.settings));
  // The latest question, also between a click and the next render, so that two
  // clicks in a row never both act on the same version
  const latest = useRef(question);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tablesOpen, setTablesOpen] = useState(false);
  const nextButton = useRef<HTMLButtonElement>(null);

  // Read by the auto-advance timer when it fires, not when it is started
  const dialogOpen = useRef(false);
  dialogOpen.current = settingsOpen || tablesOpen;

  useEffect(() => saveState({ settings, stats }), [settings, stats]);

  function setQuestion(q: Question | null) {
    latest.current = q;
    setQuestionState(q);
  }

  function newQuestion() {
    setQuestion(createQuestion(settings, latest.current?.key));
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
    if (!latest.current) return;
    const outcome = answer(latest.current, slotIndex, opt);
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
    const q = latest.current;
    if (q && q.touched && !q.finished) setStats(withStreakBroken);
    newQuestion();
  }

  // Back to the home page. Leaving a started question counts like Skip
  function finish() {
    const q = latest.current;
    if (q && q.touched && !q.finished) saveState({ settings, stats: withStreakBroken(stats) });
    onFinish();
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
    const q = latest.current;
    if (!q || !q.touched || q.finished) setQuestion(createQuestion(s, q?.key));
  }

  const problem = settingsProblem(settings);

  const result = question?.finished && (
    <ResultBanner mistakes={question.mistakes} nextRef={nextButton} onNext={newQuestion} label={compact ? 'Next' : 'Next ⏎'} />
  );

  return (
    <div className={compact ? 'app compact' : 'app'}>
      <Header
        title="Deklination"
        iconSize={compact ? 24 : 22}
        onBack={finish}
        backLabel="Finish and go back to the exercises"
        actions={
          <>
            <button className="icon-button" title="Declension tables" aria-label="Declension tables" onClick={() => setTablesOpen(true)}>
              <HelpIcon size={compact ? 24 : 22} />
            </button>
            <button className="icon-button" title="Settings" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon size={compact ? 24 : 22} />
            </button>
          </>
        }
      >
        <StatsBar stats={stats} />
      </Header>
      <TablesDialog
        open={tablesOpen}
        exerciseIds={settings.exercises}
        compact={compact}
        onClose={() => setTablesOpen(false)}
      />
      <SettingsDialog
        open={settingsOpen}
        settings={settings}
        problem={problem}
        compact={compact}
        onChange={changeSettings}
        // The dialog stays open until the settings allow at least one question
        onClose={() => { if (!problem) setSettingsOpen(false); }}
        onClosed={() => setSettingsOpen(false)}
        onClearHistory={deleteHistory}
        onResetStats={resetStats}
      />
      <main>
        {question && (
          <QuestionCard question={question} onChoose={choose}>
            {!compact && result}
          </QuestionCard>
        )}
        {!compact && <Breakdown stats={stats} onSkip={skip} onReset={resetStats} />}
      </main>
      {compact && (
        // Thumb-reach bar: Skip while answering, result + Next once solved
        <nav className="bottom-bar">
          {result || <button id="skip" onClick={skip}>Skip</button>}
        </nav>
      )}
    </div>
  );
}

// Add to today's record in the long-term history (IndexedDB, see history.ts)
function record(q: Question, delta: Partial<DayCounts>) {
  void recordResult({ exercise: q.exercise.id, caseId: CASES[q.ci].id, gender: q.noun.g, delta });
}
