// gapFill exercise: replace a noun phrase with its personal pronoun.
// Built from the sentences of "Declension in sentences": the sentence is shown
// with one noun phrase marked, and below it again with a gap in its place:
// "Ich helfe dem alten Mann." -> "Ich helfe {ihm}."

import { multiValue } from '../gapfill/settings.ts'
import { capitalize } from '../gapfill/template.ts'
import type { GapFillExercise, GapFillTask, SettingDef, SettingValues } from '../gapfill/types.ts'
import { CASE_SHORT, CASES, caseIndex, GENDER_LABEL, GENDER_LETTER, GENDERS, type CaseId, type Gender } from '../grammar.ts'
import { pick } from '../random.ts'
import {
  FRAMES, NOUNS, PATTERNS, PERSON_ADJECTIVES, phraseGaps, THING_ADJECTIVES,
  type Frame, type Phrase, type SentenceNoun,
} from '../sentences/declensionSentences.ts'
import type { ContextPrompt } from './context.ts'

// The 3rd person pronoun for a noun of each gender: Nom, Akk, Dat
const PRONOUN: Record<Gender, [string, string, string]> = {
  m: ['er', 'ihn', 'ihm'],
  n: ['es', 'es', 'ihm'],
  f: ['sie', 'sie', 'ihr'],
  p: ['sie', 'sie', 'ihnen'],
};
const OPTIONS = ['er', 'ihn', 'ihm', 'es', 'sie', 'ihr', 'ihnen'];

// After a preposition a thing becomes da(r)- + preposition (darauf, damit …),
// not a pronoun: only people and animals are replaced there
const PREPOSITIONS = new Set(['für', 'ohne', 'durch', 'mit', 'neben', 'auf', 'wegen', 'vor']);
// Phrases that don't make sense as a pronoun: "Das ist er."
const SKIP_FRAMES = new Set(['das-ist']);

const living = (n: SentenceNoun) => n.tags.includes('person') || n.tags.includes('animal');

// The word in front of phrase i of the frame
function wordBefore(frame: Frame, i: number): string {
  const before = frame.text.split('{}')[i].trim().split(/\s+/);
  return before[before.length - 1]?.toLowerCase() ?? '';
}

// The nouns phrase i can take to be replaced (none: it can't be)
function replaceable(frame: Frame, i: number, genders: string[]): SentenceNoun[] {
  const ph = frame.phrases[i];
  if (SKIP_FRAMES.has(frame.id) || ph.case === 'gen') return [];
  const afterPreposition = PREPOSITIONS.has(wordBefore(frame, i));
  return nounsFor(ph, []).filter(n => genders.includes(n.g) && (!afterPreposition || living(n)));
}

function nounsFor(ph: Phrase, used: string[]): SentenceNoun[] {
  return NOUNS.filter(n => n.tags.some(t => ph.tags.includes(t)) && !(ph.singular && n.g === 'p') && !used.includes(n.w));
}

// A noun phrase in full, in a random form: "dem alten Mann"
function phraseText(ph: Phrase, noun: SentenceNoun): string {
  const patterns = PATTERNS.filter(p => !p.pluralOnly || noun.g === 'p');
  const pattern = pick(patterns);
  const adj = pick(noun.adjectives ?? (living(noun) ? PERSON_ADJECTIVES : THING_ADJECTIVES));
  const einWord = pick(noun.g === 'p' ? ['kein', 'mein', 'dein', 'unser'] : ['ein', 'kein', 'mein', 'dein', 'unser']);
  return phraseGaps(noun, adj, einWord, pattern, caseIndex(ph.case), false).map(g => g.answer).join(' ');
}

interface Choice { cases: string[]; genders: string[]; showGender: boolean }

const SETTINGS: SettingDef[] = [
  {
    id: 'cases', label: 'Cases', type: 'multi',
    options: CASES.slice(0, 3).map(c => ({ id: c.id, label: c.name })), default: ['nom', 'akk', 'dat'],
  },
  {
    id: 'genders', label: 'Gender / number', type: 'multi',
    options: GENDERS.map(g => ({ id: g, label: GENDER_LABEL[g] })), default: [...GENDERS],
  },
  { id: 'showGender', label: "Show the noun's gender (M, F, n, Pl)", type: 'boolean', default: true },
];

function readChoice(values: SettingValues): Choice {
  return {
    cases: multiValue(SETTINGS, values, 'cases'),
    genders: multiValue(SETTINGS, values, 'genders'),
    showGender: values.showGender !== false,
  };
}

// The phrases that can be replaced with these settings, as [frame, phrase index]
function targets(c: Choice): [Frame, number][] {
  return FRAMES.flatMap(f => f.phrases.map((_, i) => [f, i] as [Frame, number]))
    .filter(([f, i]) => c.cases.includes(f.phrases[i].case) && replaceable(f, i, c.genders).length > 0);
}

function createTask(c: Choice, all: [Frame, number][]): GapFillTask<ContextPrompt> {
  const [frame, target] = pick(all);
  const ph = frame.phrases[target];
  const noun = pick(replaceable(frame, target, c.genders));
  const used = [noun.w];
  const texts = frame.phrases.map((p, i) => {
    if (i === target) return phraseText(p, noun);
    const n = pick(nounsFor(p, used).length ? nounsFor(p, used) : nounsFor(p, []));
    used.push(n.w);
    return phraseText(p, n);
  });
  const parts = frame.text.split('{}');
  const startsWithPhrase = parts[0] === '';
  const cap = (t: string, i: number) => i === 0 && startsWithPhrase ? capitalize(t) : t;

  // The original sentence, with the target marked
  let before = parts[0], after = '';
  frame.phrases.forEach((_, i) => {
    const text = cap(texts[i], i) + parts[i + 1];
    if (i < target) before += text;
    else if (i > target) after += text;
    else after = parts[i + 1];
  });
  const prompt: ContextPrompt = {
    label: 'Replace the marked words with a pronoun',
    before, marked: cap(texts[target], target), after,
    note: c.showGender ? GENDER_LETTER[noun.g] : undefined,
  };

  // The sentence again, the target as a gap. An Akk pronoun goes before a Dat
  // noun phrase right in front of it: "Ich gebe dem Kind das Buch" -> "Ich gebe es dem Kind"
  const order = frame.phrases.map((_, i) => i);
  if (ph.case === 'akk' && target > 0 && frame.phrases[target - 1].case === 'dat' && parts[target].trim() === '') {
    [order[target - 1], order[target]] = [order[target], order[target - 1]];
  }
  const atStart = startsWithPhrase && order[0] === target;
  // Only Nom, Akk and Dat are asked
  const answer = PRONOUN[noun.g][caseIndex(ph.case) as 0 | 1 | 2];
  const options = atStart ? OPTIONS.map(capitalize) : OPTIONS;
  let template = parts[0];
  order.forEach((pi, slot) => {
    template += pi === target ? '{__}' : (slot === 0 && startsWithPhrase ? capitalize(texts[pi]) : texts[pi]);
    template += parts[slot + 1];
  });

  return {
    key: `${frame.id}|${target}|${noun.w}`,
    template,
    gaps: [{ label: 'Pronoun', options, answer: atStart ? capitalize(answer) : answer, tone: ph.case }],
    scores: [{ tags: { case: CASE_SHORT[ph.case as CaseId], gender: GENDER_LETTER[noun.g] }, gaps: [0] }],
    explanations: [{ gap: 0, text: CASE_SHORT[ph.case as CaseId], detail: GENDER_LETTER[noun.g] }],
    prompt,
  };
}

export const replaceNoun: GapFillExercise<ContextPrompt> = {
  id: 'pronouns-replace',
  title: 'Pronouns: replace the noun',
  info: `Replace the marked noun phrase with a pronoun: er, ihn, ihm for a masculine noun, es, ihm for a neuter one, sie, ihr for a feminine one, sie, ihnen in the plural. The pronoun takes the noun's gender (der Tisch → er) and the case the noun had.

After a preposition only people and animals are replaced here (mit ihm); for things German uses damit, darauf …`,
  scoreColumns: ['case', 'gender'],
  settings: SETTINGS,
  problem: values => targets(readChoice(values)).length ? null : 'No sentence fits this combination. Select more cases or genders.',
  next(values, previous) {
    let c = readChoice(values);
    let all = targets(c);
    if (!all.length) { c = readChoice({}); all = targets(c); }
    let task = createTask(c, all);
    for (let tries = 0; task.key === previous?.key && tries < 20; tries++) task = createTask(c, all);
    return task;
  },
};
