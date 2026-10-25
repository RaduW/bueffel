// Working through one task: the current gap, wrong picks, and the scores at
// the end. Functions return new objects, so they can back React state directly.

import { parseTemplate, type Segment } from './template.ts'
import type { GapFillTask } from './types.ts'

export interface GapFillState {
  task: GapFillTask
  segments: Segment[]
  // The gap being filled; equal to the number of gaps once all are solved
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
  return { task, segments, current: 0, wrong: [], mistakes: task.gaps.map(() => 0), touched: false };
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
    const state = { ...s, current: s.current + 1, wrong: [], touched: true };
    return { state, result: 'correct', finished: isFinished(state) };
  }
  const mistakes = s.mistakes.map((m, i) => i === s.current ? m + 1 : m);
  return { state: { ...s, wrong: [...s.wrong, opt], mistakes, touched: true }, result: 'wrong', finished: false };
}

export interface ScoreResult {
  tags: Record<string, string>
  success: boolean
}

// The explanations to show before each gap, once a task is finished with
// mistakes; nothing otherwise
export function explanationsByGap(s: GapFillState): Map<number, string[]> {
  const byGap = new Map<number, string[]>();
  if (!isFinished(s) || totalMistakes(s) === 0) return byGap;
  for (const e of s.task.explanations ?? []) byGap.set(e.gap, [...(byGap.get(e.gap) ?? []), e.text]);
  return byGap;
}

// One result per score group of a finished task
export function scoreResults(s: GapFillState): ScoreResult[] {
  return s.task.scores.map(g => ({ tags: g.tags, success: g.gaps.every(i => s.mistakes[i] === 0) }));
}
