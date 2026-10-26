// gapFill: a sentence (or phrase) is completed gap by gap, by picking each
// gap's word from a set of options. An exercise definition only provides tasks
// as plain data; answering and scoring are generic (session.ts).
//
// P: the task's prompt, data the page shows above the sentence with a
// component of the exercise's own (e.g. the case and noun to decline)

export interface GapFillExercise<P = unknown> {
  id: string
  title: string
  // Explains the exercise briefly; shown by the help button. Paragraphs are
  // separated by blank lines
  info?: string
  // 'current' (default): only the options of the next gap, filled in order;
  // 'all': the options of every gap at once, filled in any order
  options?: 'current' | 'all'
  // The tags the results table groups by, in this order; default: all tags
  scoreColumns?: string[]
  // How a tag value is shown in the results table (e.g. an id as a name); default: as is
  scoreLabel?(tag: string, value: string): string
  // What the learner can choose (cases, forms …), shown in the settings dialog
  settings?: SettingDef[]
  // Why no task can be made with these settings, or null if one can. The
  // settings dialog stays open until this is null
  problem?(settings: SettingValues): string | null
  // The next task to show. previous: the last task, to avoid repeating it.
  // Must return a task even for settings with a problem (e.g. by using the defaults)
  next(settings: SettingValues, previous?: GapFillTask<P>): GapFillTask<P>
}

export interface GapFillTask<P = unknown> {
  // Identifies the task, to avoid showing the same one twice in a row
  key: string
  // The sentence, with each gap in braces holding its hint:
  // "{D__} {alt__} {Mann__} sieht {d__} {klein__} {Hund__}."
  // Gaps are matched to `gaps` by position (and filled in this order, unless
  // the exercise shows all options at once)
  template: string
  gaps: Gap[]
  // What the task scores, e.g. one group per noun phrase. A group succeeds
  // when its gaps were all solved without a wrong pick
  scores: ScoreGroup[]
  // Shown when the task was finished with mistakes, each before its gap,
  // e.g. the case and gender of a noun phrase: { gap: 0, text: 'Nom', detail: 'm' }
  explanations?: Explanation[]
  // Shown above the sentence by the exercise's prompt component
  prompt?: P
}

export interface Explanation {
  // Index into the task's gaps
  gap: number
  // Shown in the gap's tone colour (e.g. the case)
  text: string
  // Follows the text, uncoloured (e.g. the gender)
  detail?: string
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
  // Shown filled in from the start, in its own colour; not asked and not scored
  // (e.g. a noun phrase in a case the learner didn't select)
  given?: boolean
  // Colours the gap once all gaps of its score group are filled (so the colour
  // doesn't give away the case while the phrase is being filled); the page
  // knows the colours of the four cases: 'nom', 'akk', 'dat', 'gen'
  tone?: string
}

export interface ScoreGroup {
  // e.g. { case: 'Nom', pattern: 'def.Art+adj+noun' }
  tags: Record<string, string>
  // Indexes into the task's gaps
  gaps: number[]
}

export interface SettingOption { id: string; label: string }

// One setting in the exercise's settings dialog. 'multi': any number of the
// options, at least one; 'choice': exactly one
export type SettingDef =
  | { id: string; label: string; type: 'boolean'; default: boolean }
  | { id: string; label: string; type: 'choice'; options: SettingOption[]; default: string }
  | { id: string; label: string; type: 'multi'; options: SettingOption[]; default: string[] }

export type SettingValues = Record<string, boolean | string | string[]>
