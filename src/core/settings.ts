import { CASES, GENDERS } from './grammar.ts'
import { NOUN_POOLS, type Noun } from './nouns.ts'

export interface Settings {
  exercises: string[]
  pools: string[]
  genders: string[]
  cases: string[]
}

export function defaultSettings(): Settings {
  return { exercises: ['def'], pools: ['core'], genders: [...GENDERS], cases: CASES.map(c => c.id) };
}

// Nouns from the selected groups that have one of the selected genders
export function availableNouns(s: Settings): Noun[] {
  return s.pools.flatMap(p => NOUN_POOLS[p]?.nouns ?? []).filter(n => s.genders.includes(n.g));
}

// Why no question can be drawn with these settings, or null if one can
export function settingsProblem(s: Settings): string | null {
  if (!s.exercises.length) return 'Select at least one exercise.';
  if (!s.pools.length) return 'Select at least one noun group.';
  if (!s.genders.length) return 'Select at least one gender or Plural.';
  if (!s.cases.length) return 'Select at least one case.';
  if (!availableNouns(s).length) return 'The selected noun groups have no nouns of the selected genders (the n-nouns are all masculine).';
  return null;
}
