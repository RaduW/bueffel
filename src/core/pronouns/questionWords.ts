// gapFill exercise: the question word for the marked part of an answer.
// "Ich helfe [dem Mann]." -> "{Wem} hilfst du?"

import { multiValue } from '../gapfill/settings.ts'
import type { GapFillExercise, GapFillTask, SettingDef, SettingValues } from '../gapfill/types.ts'
import { CASE_SHORT, CASES, type CaseId } from '../grammar.ts'
import { pick } from '../random.ts'
import type { ContextPrompt } from './context.ts'

// question: {} for the question word (capitalised at the start); answer:
// [before, marked, after]; about: a person or a thing
interface Item { question: string; answer: [string, string, string]; case: CaseId; about: 'person' | 'thing'; word: string }

const q = (question: string, answer: [string, string, string], caseId: CaseId, about: 'person' | 'thing', word: string): Item =>
  ({ question, answer, case: caseId, about, word });

const ITEMS: Item[] = [
  // Nominativ
  q('{} kommt heute?', ['', 'Mein Bruder', ' kommt heute.'], 'nom', 'person', 'wer'),
  q('{} hat angerufen?', ['', 'Die Lehrerin', ' hat angerufen.'], 'nom', 'person', 'wer'),
  q('{} wohnt hier?', ['Hier wohnt ', 'Herr Müller', '.'], 'nom', 'person', 'wer'),
  q('{} liegt auf dem Tisch?', ['', 'Ein Buch', ' liegt auf dem Tisch.'], 'nom', 'thing', 'was'),
  q('{} ist kaputt?', ['', 'Das Fahrrad', ' ist kaputt.'], 'nom', 'thing', 'was'),
  q('{} gefällt dir?', ['', 'Der neue Film', ' gefällt mir.'], 'nom', 'thing', 'was'),
  // Akkusativ
  q('{} siehst du?', ['Ich sehe ', 'den Lehrer', '.'], 'akk', 'person', 'wen'),
  q('{} besuchst du am Sonntag?', ['Ich besuche ', 'meine Oma', ' am Sonntag.'], 'akk', 'person', 'wen'),
  q('{} rufst du an?', ['Ich rufe ', 'meinen Freund', ' an.'], 'akk', 'person', 'wen'),
  q('Für {} ist das Geschenk?', ['Das Geschenk ist für ', 'meine Mutter', '.'], 'akk', 'person', 'wen'),
  q('{} kaufst du?', ['Ich kaufe ', 'einen Tisch', '.'], 'akk', 'thing', 'was'),
  q('{} trinkst du?', ['Ich trinke ', 'einen Kaffee', '.'], 'akk', 'thing', 'was'),
  q('{} suchst du?', ['Ich suche ', 'meinen Schlüssel', '.'], 'akk', 'thing', 'was'),
  // Dativ
  q('{} hilfst du?', ['Ich helfe ', 'dem Mann', '.'], 'dat', 'person', 'wem'),
  q('{} gehört das Auto?', ['Das Auto gehört ', 'meinem Vater', '.'], 'dat', 'person', 'wem'),
  q('{} gibst du das Buch?', ['Ich gebe das Buch ', 'meiner Schwester', '.'], 'dat', 'person', 'wem'),
  q('Mit {} sprichst du?', ['Ich spreche mit ', 'der Lehrerin', '.'], 'dat', 'person', 'wem'),
  q('{} gefällt der Film?', ['Der Film gefällt ', 'den Kindern', '.'], 'dat', 'person', 'wem'),
  q('Bei {} wohnst du?', ['Ich wohne bei ', 'meinen Eltern', '.'], 'dat', 'person', 'wem'),
  // Genitiv
  q('{} Auto ist das?', ['Das ist das Auto ', 'meines Vaters', '.'], 'gen', 'person', 'wessen'),
  q('{} Tasche liegt hier?', ['Hier liegt die Tasche ', 'der Lehrerin', '.'], 'gen', 'person', 'wessen'),
  q('{} Idee war das?', ['Das war die Idee ', 'meiner Freundin', '.'], 'gen', 'person', 'wessen'),
];

const WORDS = ['wer', 'wen', 'wem', 'wessen', 'was'];
// Shown under each option
const ENGLISH: Record<string, string> = { wer: 'who', wen: 'whom', wem: 'to whom', wessen: 'whose', was: 'what' };

const SETTINGS: SettingDef[] = [
  {
    id: 'cases', label: 'Cases', type: 'multi',
    options: CASES.map(c => ({ id: c.id, label: c.name })), default: CASES.map(c => c.id),
  },
];

function itemsFor(values: SettingValues): Item[] {
  const cases = multiValue(SETTINGS, values, 'cases');
  return ITEMS.filter(i => cases.includes(i.case));
}

const cap = (w: string) => w.charAt(0).toUpperCase() + w.slice(1);

function createTask(items: Item[]): GapFillTask<ContextPrompt> {
  const item = pick(items);
  const atStart = item.question.startsWith('{}');
  const shown = (w: string) => atStart ? cap(w) : w;
  return {
    key: item.question,
    template: item.question.replace('{}', '{__}'),
    gaps: [{
      label: 'Question word',
      options: WORDS.map(shown),
      answer: shown(item.word),
      optionNotes: Object.fromEntries(WORDS.map(w => [shown(w), ENGLISH[w]])),
      tone: item.case,
    }],
    scores: [{ tags: { case: CASE_SHORT[item.case], about: item.about }, gaps: [0] }],
    explanations: [{ gap: 0, text: CASE_SHORT[item.case], detail: item.about }],
    prompt: { label: 'Ask about the marked words', before: item.answer[0], marked: item.answer[1], after: item.answer[2] },
  };
}

export const questionWords: GapFillExercise<ContextPrompt> = {
  id: 'question-words',
  title: 'Question words',
  info: `The answer is shown with a part marked: choose the question word that asks for it. Wer (who), wen (whom), wem (to whom), wessen (whose) ask about people (Nom, Akk, Dat, Gen); was (what) asks about things (Nom and Akk).

Ich helfe dem Mann. → Wem hilfst du?`,
  scoreColumns: ['case', 'about'],
  settings: SETTINGS,
  problem: values => itemsFor(values).length ? null : 'Select at least one case.',
  next(values, previous) {
    let items = itemsFor(values);
    if (!items.length) items = ITEMS;
    let task = createTask(items);
    for (let tries = 0; task.key === previous?.key && tries < 20; tries++) task = createTask(items);
    return task;
  },
};
