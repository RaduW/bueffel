// gapFill exercise: decline one noun phrase. The prompt gives the case, the
// noun with its gender and (for some exercises) the adjective; the options of
// every word are shown at once.

import { exerciseById, EXERCISES, type Exercise } from '../exercises.ts'
import { hintFor } from '../gapfill/template.ts'
import { multiValue } from '../gapfill/settings.ts'
import type { GapFillExercise, GapFillTask, SettingDef, SettingValues } from '../gapfill/types.ts'
import {
  ADJECTIVES, CASE_SHORT, CASES, caseIndex, GENDER_LABEL, GENDER_SHORT, GENDERS,
  type CaseId, type Gender,
} from '../grammar.ts'
import { NOUN_POOLS, type Noun } from '../nouns.ts'
import { pick } from '../random.ts'

// What the prompt above the phrase shows
export interface DeclensionPrompt {
  caseId: CaseId
  // The exercise's name, e.g. "der + adjective + noun"
  exercise: string
  noun: string
  gender: Gender
  adjective: string | null
}

// The settings, as the generator uses them
interface Settings {
  exercises: string[]
  pools: string[]
  genders: string[]
  cases: string[]
}

const SETTINGS: SettingDef[] = [
  {
    id: 'exercises', label: 'Exercises', type: 'multi',
    options: EXERCISES.map(e => ({ id: e.id, label: e.name })), default: ['def'],
  },
  {
    id: 'pools', label: 'Nouns', type: 'multi',
    options: Object.entries(NOUN_POOLS).map(([id, p]) => ({ id, label: p.label })), default: ['core'],
  },
  {
    id: 'genders', label: 'Gender / number', type: 'multi',
    options: GENDERS.map(g => ({ id: g, label: GENDER_LABEL[g] })), default: [...GENDERS],
  },
  {
    id: 'cases', label: 'Cases', type: 'multi',
    options: CASES.map(c => ({ id: c.id, label: c.name })), default: CASES.map(c => c.id),
  },
];

// The values as saved, for checking them (an empty selection is a problem)
function rawSettings(values: SettingValues): Settings {
  const list = (id: string) => (Array.isArray(values[id]) ? values[id] : []) as string[];
  return { exercises: list('exercises'), pools: list('pools'), genders: list('genders'), cases: list('cases') };
}

// Nouns from the selected groups that have one of the selected genders
function availableNouns(s: Settings): Noun[] {
  return s.pools.flatMap(p => NOUN_POOLS[p]?.nouns ?? []).filter(n => s.genders.includes(n.g));
}

// Why no question can be drawn with these settings, or null if one can
function settingsProblem(s: Settings): string | null {
  if (!s.exercises.length) return 'Select at least one exercise.';
  if (!s.pools.length) return 'Select at least one noun group.';
  if (!s.genders.length) return 'Select at least one gender or Plural.';
  if (!s.cases.length) return 'Select at least one case.';
  if (!availableNouns(s).length) return 'The selected noun groups have no nouns of the selected genders (the n-nouns are all masculine).';
  return null;
}

function createTask(s: Settings): GapFillTask<DeclensionPrompt> {
  const exercises = s.exercises.map(exerciseById).filter((e): e is Exercise => !!e);
  const exercise = pick(exercises.length ? exercises : EXERCISES);
  const noun = pick(availableNouns(s));
  const caseId = pick(s.cases) as CaseId;
  const adj = pick(ADJECTIVES);

  // One gap per word; the case colour shows once the whole phrase is filled
  const gaps = exercise.build(noun, caseIndex(caseId), adj)
    .map(slot => ({ label: slot.label, options: slot.options, answer: slot.answer, tone: caseId }));
  return {
    key: `${exercise.id}|${noun.w}|${caseId}`,
    template: gaps.map(g => `{${hintFor(g.options)}}`).join(' '),
    gaps,
    // A question is one score group, tagged with its exercise, case and gender
    scores: [{
      tags: { exercise: exercise.id, case: CASE_SHORT[caseId], gender: GENDER_SHORT[noun.g] },
      gaps: gaps.map((_, i) => i),
    }],
    prompt: { caseId, exercise: exercise.name, noun: noun.w, gender: noun.g, adjective: exercise.adjective ? adj : null },
  };
}

export const declension: GapFillExercise<DeclensionPrompt> = {
  id: 'declension',
  title: 'Declension practice',
  options: 'all',
  scoreColumns: ['exercise'],
  scoreLabel: (tag, value) => tag === 'exercise' ? exerciseById(value)?.name ?? value : value,
  settings: SETTINGS,
  problem: values => settingsProblem(rawSettings(values)),
  next(values, previous) {
    const valid = (id: string) => multiValue(SETTINGS, values, id);
    let s: Settings = { exercises: valid('exercises'), pools: valid('pools'), genders: valid('genders'), cases: valid('cases') };
    // Settings that allow no question (the dialog doesn't let them be kept): the defaults
    if (settingsProblem(s)) s = rawSettings(Object.fromEntries(SETTINGS.map(d => [d.id, d.default])));
    let task = createTask(s);
    for (let tries = 0; task.key === previous?.key && tries < 20; tries++) task = createTask(s);
    return task;
  },
};

// The selected exercises, for the declension tables
export function selectedExercises(values: SettingValues): string[] {
  return multiValue(SETTINGS, values, 'exercises');
}

