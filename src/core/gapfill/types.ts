// gapFill: a sentence is completed one gap at a time, by picking each gap's
// word from a set of options. An exercise definition only provides tasks as
// plain data; moving from gap to gap and scoring are generic (session.ts).

export interface GapFillExercise {
  id: string
  title: string
  // Explains the exercise; shown by the help button. Paragraphs are separated by blank lines
  info: string
  // Not used yet: what the learner will be able to choose (cases, patterns …)
  settings?: SettingDef[]
  // The next task to show. previous: the last task, to avoid repeating it
  next(settings: SettingValues, previous?: GapFillTask): GapFillTask
}

export interface GapFillTask {
  // Identifies the task, to avoid showing the same one twice in a row
  key: string
  // The sentence, with each gap in braces holding its hint:
  // "{D__} {alt__} {Mann__} sieht {d__} {klein__} {Hund__}."
  // Gaps are filled in this order, and matched to `gaps` by position
  template: string
  gaps: Gap[]
  // What the task scores, e.g. one group per noun phrase. A group succeeds
  // when its gaps were all solved without a wrong pick
  scores: ScoreGroup[]
  // Shown when the task was finished with mistakes, each before its gap,
  // e.g. the case of a noun phrase: { gap: 0, text: 'Nom m' }
  explanations?: Explanation[]
}

export interface Explanation {
  // Index into the task's gaps
  gap: number
  text: string
}

export interface Gap {
  answer: string
  // The choices shown for this gap, including the answer
  options: string[]
  // Optional caption for the options, e.g. "Article"
  label?: string
  // Always shown in brackets after the gap, not part of the sentence,
  // e.g. the noun's gender: 'm'
  note?: string
}

export interface ScoreGroup {
  // e.g. { case: 'Nom', pattern: 'def.Art+adj+noun' }
  tags: Record<string, string>
  // Indexes into the task's gaps
  gaps: number[]
}

// Reserved for the exercise settings, not defined in detail yet
export type SettingDef =
  | { id: string; label: string; type: 'boolean'; default: boolean }
  | { id: string; label: string; type: 'choice'; options: { id: string; label: string }[]; default: string }

export type SettingValues = Record<string, boolean | string | string[]>
