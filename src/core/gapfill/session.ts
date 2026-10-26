// Working through one task: which gaps are solved, wrong picks, and the scores
// at the end. Functions return new objects, so they can back React state directly.

import type { ScoreResult } from '../scores.ts'
import { parseTemplate, type Segment } from './template.ts'
import type { Explanation, GapFillTask } from './types.ts'

export interface GapFillState {
  task: GapFillTask
  segments: Segment[]
  // Per gap: solved (given gaps count as solved from the start)
  solved: boolean[]
  // Per gap: options already tried and found wrong
  wrong: string[][]
  // Wrong picks per gap
  mistakes: number[]
  // The first gap still to solve, in order; equal to the number of gaps once
  // all are solved. With options shown one gap at a time, the one being filled
  current: number
  // Set by the first pick
  touched: boolean
}

export function startTask(task: GapFillTask): GapFillState {
  const segments = parseTemplate(task.template);
  const gaps = segments.filter(s => s.kind === 'gap').length;
  if (gaps !== task.gaps.length) {
    throw new Error(`Task ${task.key}: template has ${gaps} gaps, but ${task.gaps.length} are defined`);
  }
  const solved = task.gaps.map(g => !!g.given);
  return {
    task, segments, solved,
    wrong: task.gaps.map(() => []),
    mistakes: task.gaps.map(() => 0),
    current: firstOpen(solved),
    touched: false,
  };
}

function firstOpen(solved: boolean[]): number {
  const i = solved.indexOf(false);
  return i < 0 ? solved.length : i;
}

export function isFinished(s: GapFillState): boolean {
  return s.current >= s.task.gaps.length;
}

export function totalMistakes(s: GapFillState): number {
  return s.mistakes.reduce((a, b) => a + b, 0);
}

// A gap shows its answer: solved, or given from the start
export function isFilled(s: GapFillState, index: number): boolean {
  return !!s.solved[index];
}

// A filled gap whose score group is complete: every gap of the group is
// filled. Its tone (e.g. the case) can show now without giving it away for
// the group's remaining gaps. A gap in no group: once filled
export function isGroupComplete(s: GapFillState, index: number): boolean {
  const groups = s.task.scores.filter(g => g.gaps.includes(index));
  return isFilled(s, index) && groups.every(g => g.gaps.every(i => isFilled(s, i)));
}

export interface PickOutcome {
  state: GapFillState
  result: 'correct' | 'wrong' | 'ignored'
  // This pick solved the last gap
  finished: boolean
}

// Pick option opt for gap `index`. Picking for a solved (or given) gap,
// repeating a wrong option, or an option the gap doesn't have is ignored.
export function pick(s: GapFillState, index: number, opt: string): PickOutcome {
  const gap = s.task.gaps[index];
  if (!gap || s.solved[index] || s.wrong[index].includes(opt) || !gap.options.includes(opt)) {
    return { state: s, result: 'ignored', finished: false };
  }
  if (opt === gap.answer) {
    const solved = s.solved.map((v, i) => v || i === index);
    const state = { ...s, solved, current: firstOpen(solved), touched: true };
    return { state, result: 'correct', finished: isFinished(state) };
  }
  const wrong = s.wrong.map((w, i) => i === index ? [...w, opt] : w);
  const mistakes = s.mistakes.map((m, i) => i === index ? m + 1 : m);
  return { state: { ...s, wrong, mistakes, touched: true }, result: 'wrong', finished: false };
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
