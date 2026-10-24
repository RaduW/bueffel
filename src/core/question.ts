// Drawing a question and answering it. Functions return new objects instead of
// changing the ones passed in, so they can back React state directly.

import { exerciseById, EXERCISES, type Exercise, type Slot } from './exercises.ts'
import { ADJECTIVES, caseIndex, type CaseIndex } from './grammar.ts'
import type { Noun } from './nouns.ts'
import { pick } from './random.ts'
import { availableNouns, settingsProblem, type Settings } from './settings.ts'

export interface SlotState extends Slot {
  solved: boolean
  // Options already tried and found wrong
  wrong: string[]
}

export interface Question {
  // Identifies exercise, noun and case, to avoid drawing the same one twice in a row
  key: string
  exercise: Exercise
  noun: Noun
  ci: CaseIndex
  adj: string | null
  slots: SlotState[]
  mistakes: number
  // Set by the first answer: a question counts as shown once the user starts it
  touched: boolean
  finished: boolean
}

// A random question for these settings, or null if they allow none.
// previousKey: the last question's key, which is avoided if possible
export function createQuestion(s: Settings, previousKey = ''): Question | null {
  if (settingsProblem(s)) return null;

  const exercises = s.exercises.map(exerciseById).filter((e): e is Exercise => !!e);
  const nouns = availableNouns(s);
  let exercise: Exercise, noun: Noun, ci: CaseIndex, adj: string, key: string;
  let tries = 0;
  do {
    exercise = pick(exercises.length ? exercises : EXERCISES);
    noun = pick(nouns);
    ci = caseIndex(pick(s.cases));
    adj = pick(ADJECTIVES);
    key = `${exercise.id}|${noun.w}|${ci}`;
  } while (key === previousKey && ++tries < 20);

  return {
    key, exercise, noun, ci,
    adj: exercise.adjective ? adj : null,
    slots: exercise.build(noun, ci, adj).map(sl => ({ ...sl, solved: false, wrong: [] })),
    mistakes: 0,
    touched: false,
    finished: false,
  };
}

export interface AnswerOutcome {
  question: Question
  result: 'correct' | 'wrong' | 'ignored'
  // This answer was the first one given to the question
  started: boolean
  // This answer solved the last open slot
  finished: boolean
}

// Choose option opt for slot slotIndex. Repeating a wrong option, or answering a
// solved slot or a finished question, is ignored.
export function answer(q: Question, slotIndex: number, opt: string): AnswerOutcome {
  const slot = q.slots[slotIndex];
  if (!slot || slot.solved || q.finished || slot.wrong.includes(opt)) {
    return { question: q, result: 'ignored', started: false, finished: false };
  }

  const correct = opt === slot.answer;
  const slots = q.slots.map((sl, i) => i !== slotIndex ? sl
    : correct ? { ...sl, solved: true }
    : { ...sl, wrong: [...sl.wrong, opt] });
  const finished = slots.every(sl => sl.solved);
  return {
    question: {
      ...q,
      slots,
      mistakes: q.mistakes + (correct ? 0 : 1),
      touched: true,
      finished,
    },
    result: correct ? 'correct' : 'wrong',
    started: !q.touched,
    finished,
  };
}
