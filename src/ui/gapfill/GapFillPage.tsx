// The page for any gapFill exercise: the sentence, the options for the current
// gap, the result, and the scores. Everything exercise-specific comes from
// the GapFillExercise definition.

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { isFinished, pick, scoreResults, startTask, totalMistakes, type GapFillState } from '../../core/gapfill/session.ts'
import type { GapFillExercise, SettingValues } from '../../core/gapfill/types.ts'
import { tally } from '../../core/stats.ts'
import { ResultBanner } from '../declension/ResultBanner.tsx'
import { Header } from '../Header.tsx'
import { HelpIcon, SettingsIcon } from '../icons.tsx'
import { StatsBar } from '../StatsBar.tsx'
import { ADVANCE_DELAY_MS, COMPACT_QUERY } from '../layout.ts'
import { useExerciseProgress } from '../useExerciseProgress.ts'
import { useMediaQuery } from '../useMediaQuery.ts'
import { HelpDialog } from './HelpDialog.tsx'
import { OptionRow } from './OptionRow.tsx'
import { ScorePanel } from './ScorePanel.tsx'
import { Sentence } from './Sentence.tsx'
import { SettingsDialog } from './SettingsDialog.tsx'

// No exercise settings yet
const NO_SETTINGS: SettingValues = {};

interface Props {
  exercise: GapFillExercise
  onFinish: () => void
}

export function GapFillPage({ exercise, onFinish }: Props) {
  const compact = useMediaQuery(COMPACT_QUERY);
  // Saved under the exercise's id, like every exercise's (useExerciseProgress)
  const { settings, progress, addResults, resetStats, deleteHistory } = useExerciseProgress(exercise.id, NO_SETTINGS);
  const [state, setStateValue] = useState(() => startTask(exercise.next(settings)));
  // The latest state, also between a click and the next render, so that two
  // clicks in a row never both act on the same version
  const latest = useRef(state);
  const [helpOpen, setHelpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const nextButton = useRef<HTMLButtonElement>(null);

  // Read by the auto-advance timer when it fires, not when it is started
  const dialogOpen = useRef(false);
  dialogOpen.current = helpOpen || settingsOpen;

  function setState(s: GapFillState) {
    latest.current = s;
    setStateValue(s);
  }

  // Skipping (or Next) draws a new task; an unfinished task is not scored
  function nextTask() {
    setState(startTask(exercise.next(settings, latest.current.task)));
  }

  function choose(opt: string) {
    const outcome = pick(latest.current, opt);
    if (outcome.result === 'ignored') return;
    setState(outcome.state);
    if (outcome.finished) {
      // Only finished tasks count: a skipped one changes nothing, not even the streak
      addResults(scoreResults(outcome.state));
    }
  }

  const finished = isFinished(state);
  const perfect = totalMistakes(state) === 0;

  // Move on by itself shortly after a task is solved without mistakes; Next
  // still works for skipping the wait. Not behind an open dialog. After
  // mistakes the task stays, with its explanations, until Next
  useEffect(() => {
    if (!finished || !perfect) return;
    const timer = setTimeout(() => { if (!dialogOpen.current) nextTask(); }, ADVANCE_DELAY_MS);
    // nextTask only reads the latest state (a ref) and the fixed exercise
    return () => clearTimeout(timer);
  }, [state, finished, perfect]);

  // Enter moves on from a solved task (on the Next button, the click does it)
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' && !dialogOpen.current && isFinished(latest.current) && document.activeElement !== nextButton.current) {
        nextTask();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const gap = state.task.gaps[state.current];
  const result = finished && (
    <ResultBanner mistakes={totalMistakes(state)} nextRef={nextButton} onNext={nextTask} label={compact ? 'Next' : 'Next ⏎'} />
  );

  return (
    <div className={compact ? 'app compact' : 'app'}>
      <Header
        title={exercise.title}
        iconSize={compact ? 24 : 22}
        onBack={onFinish}
        backLabel="Finish and go back to the exercises"
        actions={
          <>
            <button className="icon-button" title="Help" aria-label="Help" onClick={() => setHelpOpen(true)}>
              <HelpIcon size={compact ? 24 : 22} />
            </button>
            <button className="icon-button" title="Settings" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
              <SettingsIcon size={compact ? 24 : 22} />
            </button>
          </>
        }
      >
        <StatsBar stats={tally(progress)} />
      </Header>
      <HelpDialog open={helpOpen} title={exercise.title} info={exercise.info} onClose={() => setHelpOpen(false)} />
      <SettingsDialog
        open={settingsOpen}
        compact={compact}
        onClose={() => setSettingsOpen(false)}
        onClearHistory={deleteHistory}
        onResetStats={() => { resetStats(); }}
      />
      <main>
        <section className="card gapfill">
          <Sentence state={state} />
          {gap && <OptionRow key={state.current} gap={gap} wrong={state.wrong} onChoose={choose} />}
          {!compact && result}
          {!compact && !finished && (
            <div className="actions">
              <button onClick={nextTask}>Skip</button>
            </div>
          )}
        </section>
        <ScorePanel scores={progress.scores} />
      </main>
      {compact && (
        // Thumb-reach bar: Skip while answering, result + Next once solved
        <nav className="bottom-bar">
          {result || <button id="skip" onClick={nextTask}>Skip</button>}
        </nav>
      )}
    </div>
  );
}

// A page component for the exercise list (src/ui/exercises.ts)
export function gapFillPage(exercise: GapFillExercise): ComponentType<{ onFinish: () => void }> {
  return function Page({ onFinish }) {
    return <GapFillPage exercise={exercise} onFinish={onFinish} />;
  };
}
