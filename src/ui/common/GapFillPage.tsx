// The page for any gapFill exercise: an optional prompt, the sentence, the
// options (of the next gap, or of every gap at once), the result, and the
// scores. Everything exercise-specific comes from the GapFillExercise
// definition, plus optional components for the prompt and the help.
//
// Two layouts on one page: the wide one, and a compact one for phones (bigger
// tap targets, Skip / Next in a bar at the bottom). They differ only in where
// things are placed; switching between them keeps all state.

import { useEffect, useRef, useState, type ComponentType } from 'react'
import { isFinished, pick, scoreResults, startTask, totalMistakes, type GapFillState } from '../../core/gapfill/session.ts'
import { defaultValues, emptySelection } from '../../core/gapfill/settings.ts'
import type { GapFillExercise, SettingValues } from '../../core/gapfill/types.ts'
import { tally } from '../../core/stats.ts'
import { Header } from './Header.tsx'
import { HelpDialog } from './HelpDialog.tsx'
import { HelpIcon, SettingsIcon } from './icons.tsx'
import { ADVANCE_DELAY_MS, COMPACT_QUERY } from './layout.ts'
import { OptionRow } from './OptionRow.tsx'
import { ResultBanner } from './ResultBanner.tsx'
import { ScorePanel } from './ScorePanel.tsx'
import { Sentence } from './Sentence.tsx'
import { SettingsDialog } from './SettingsDialog.tsx'
import { StatsBar } from './StatsBar.tsx'
import { useExerciseProgress } from './useExerciseProgress.ts'
import { useMediaQuery } from './useMediaQuery.ts'

// What an exercise's own help dialog gets (in place of the help text)
export interface HelpProps {
  open: boolean
  compact: boolean
  settings: SettingValues
  onClose: () => void
}

// An exercise's own components
export interface PageParts<P> {
  // Shown above the sentence, from the task's prompt
  Prompt?: ComponentType<{ prompt: P }>
  // Opened by the help button, in place of the exercise's help text
  Help?: ComponentType<HelpProps>
}

interface Props<P> extends PageParts<P> {
  exercise: GapFillExercise<P>
  onFinish: () => void
}

export function GapFillPage<P>({ exercise, Prompt, Help, onFinish }: Props<P>) {
  const compact = useMediaQuery(COMPACT_QUERY);
  const allOptions = exercise.options === 'all';
  // Saved under the exercise's id, like every exercise's (useExerciseProgress)
  const { settings, setSettings, progress, addResults, resetStats, deleteHistory } =
    useExerciseProgress(exercise.id, defaultValues(exercise.settings));
  // The latest settings, for the timer and the key handler set up earlier
  const latestSettings = useRef(settings);
  latestSettings.current = settings;
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
    setState(startTask(exercise.next(latestSettings.current, latest.current.task as never)));
  }

  // The exercise's own message first, then an empty selection
  const problem = exercise.problem?.(settings) ?? emptySelection(exercise.settings, settings);

  function changeSettings(values: SettingValues) {
    setSettings(values);
    latestSettings.current = values;
    // Keep a task the user has already started; otherwise draw one for the new settings
    const s = latest.current;
    const ok = !exercise.problem?.(values) && !emptySelection(exercise.settings, values);
    if (ok && (!s.touched || isFinished(s))) nextTask();
  }

  function choose(index: number, opt: string) {
    const outcome = pick(latest.current, index, opt);
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
  // mistakes the task stays (with its explanations, if any) until Next
  useEffect(() => {
    if (!finished || !perfect) return;
    const timer = setTimeout(() => { if (!dialogOpen.current) nextTask(); }, ADVANCE_DELAY_MS);
    // nextTask only reads the latest state and settings (refs) and the fixed exercise
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

  const { gaps, prompt } = state.task;
  const row = (i: number) => (
    <OptionRow key={allOptions ? i : state.current} gap={gaps[i]} wrong={state.wrong[i]} solved={state.solved[i]} onChoose={opt => choose(i, opt)} />
  );
  const result = finished && (
    <ResultBanner mistakes={totalMistakes(state)} nextRef={nextButton} onNext={nextTask} label={compact ? 'Next' : 'Next ⏎'} />
  );
  const help = { open: helpOpen, compact, settings, onClose: () => setHelpOpen(false) };

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
      {Help ? <Help {...help} /> : <HelpDialog {...help} title={exercise.title} info={exercise.info} />}
      <SettingsDialog
        open={settingsOpen}
        defs={exercise.settings ?? []}
        values={settings}
        problem={problem}
        compact={compact}
        onChange={changeSettings}
        // The dialog stays open until the settings allow a task
        onClose={() => { if (!problem) setSettingsOpen(false); }}
        onClosed={() => setSettingsOpen(false)}
        onClearHistory={deleteHistory}
        onResetStats={() => { resetStats(); }}
      />
      <main>
        <section className="card gapfill">
          {Prompt && prompt !== undefined && <Prompt prompt={prompt as P} />}
          <Sentence state={state} highlightCurrent={!allOptions} />
          {allOptions
            ? gaps.map((g, i) => !g.given && row(i))
            : !finished && row(state.current)}
          {!compact && result}
          {!compact && !finished && (
            <div className="actions">
              <button onClick={nextTask}>Skip</button>
            </div>
          )}
        </section>
        <ScorePanel scores={progress.scores} columns={exercise.scoreColumns} label={exercise.scoreLabel} />
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
export function gapFillPage<P>(exercise: GapFillExercise<P>, parts: PageParts<P> = {}): ComponentType<{ onFinish: () => void }> {
  return function Page({ onFinish }) {
    return <GapFillPage exercise={exercise} {...parts} onFinish={onFinish} />;
  };
}
