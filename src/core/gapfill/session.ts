// Working through one task: the current gap, wrong picks, and the scores at
// the end. Functions return new objects, so they can back React state directly.

import type { ScoreResult } from '../scores.ts'
import { parseTemplate, type Segment } from './template.ts'
import type { Explanation, GapFillTask } from './types.ts'

export interface GapFillState {
  task: GapFillTask
  segments: Segment[]
  // The gap being filled; equal to the number of gaps once all are solved.
  // Given gaps are never current
  current: number
  // Options already tried and found wrong, for the current gap
  wrong: string[]
  // Wrong picks per gap
  mistakes: number[]
  // Set by the first pick
  touched: boolean
}

export function startTask(task: GapFillTask): GapFillState {
  const segments = parseTemplate(task.template);
  const gaps = segments.filter(s => s.kind === 'gap').length;
  if (gaps !== task.gaps.length) {
    throw new Error(`Task ${task.key}: template has ${gaps} gaps, but ${task.gaps.length} are defined`);
  }
  return { task, segments, current: nextAsked(task, 0), wrong: [], mistakes: task.gaps.map(() => 0), touched: false };
}

// The first gap from `from` on that is asked (not given)
function nextAsked(task: GapFillTask, from: number): number {
  let i = from;
  while (i < task.gaps.length && task.gaps[i].given) i++;
  return i;
}

// A gap shows its answer: solved, or given from the start
export function isFilled(s: GapFillState, index: number): boolean {
  return index < s.current || !!s.task.gaps[index]?.given;
}

// A filled gap whose score group is complete: every gap of the group is
// filled. Its tone (e.g. the case) can show now without giving it away for
// the group's remaining gaps. A gap in no group: once filled
export function isGroupComplete(s: GapFillState, index: number): boolean {
  const groups = s.task.scores.filter(g => g.gaps.includes(index));
  return isFilled(s, index) && groups.every(g => g.gaps.every(i => isFilled(s, i)));
}

export function isFinished(s: GapFillState): boolean {
  return s.current >= s.task.gaps.length;
}

export function totalMistakes(s: GapFillState): number {
  return s.mistakes.reduce((a, b) => a + b, 0);
}

export interface PickOutcome {
  state: GapFillState
  result: 'correct' | 'wrong' | 'ignored'
  // This pick solved the last gap
  finished: boolean
}

// Pick option opt for the current gap. Repeating a wrong option, or picking
// after the task is finished, is ignored.
export function pick(s: GapFillState, opt: string): PickOutcome {
  const gap = s.task.gaps[s.current];
  if (!gap || s.wrong.includes(opt) || !gap.options.includes(opt)) {
    return { state: s, result: 'ignored', finished: false };
  }
  if (opt === gap.answer) {
    const state = { ...s, current: nextAsked(s.task, s.current + 1), wrong: [], touched: true };
    return { state, result: 'correct', finished: isFinished(state) };
  }
  const mistakes = s.mistakes.map((m, i) => i === s.current ? m + 1 : m);
  return { state: { ...s, wrong: [...s.wrong, opt], mistakes, touched: true }, result: 'wrong', finished: false };
}

// The explanations to show before each gap, once a task is finished with
// mistakes; nothing otherwise
export function explanationsByGap(s: GapFillState): Map<number, Explanation[]> {
  const byGap = new Map<number, Explanation[]>();
  if (!isFinished(s) || totalMistakes(s) === 0) return byGap;
  for (const e of s.task.explanations ?? []) byGap.set(e.gap, [...(byGap.get(e.gap) ?? []), e]);
  return byGap;
}

// One result per score group of a finished task
export function scoreResults(s: GapFillState): ScoreResult[] {
  return s.task.scores.map(g => {
    const mistakes = g.gaps.reduce((sum, i) => sum + s.mistakes[i], 0);
    return { tags: g.tags, success: mistakes === 0, mistakes };
  });
}
