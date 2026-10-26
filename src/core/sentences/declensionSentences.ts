// gapFill exercise: declension in whole sentences, from "declination-exercises.md".
// Each noun phrase takes one of five forms (see PATTERNS), in any of the four cases.

import { choiceValue, multiValue } from '../gapfill/settings.ts'
import type { Explanation, Gap, GapFillExercise, GapFillTask, ScoreGroup, SettingDef, SettingValues } from '../gapfill/types.ts'
import { capitalize, hintFor } from '../gapfill/template.ts'
import {
  ADJ_ENDING, CASE_SHORT, CASES, caseIndex, DEF_ARTICLE, DEF_OPTIONS, EIN_ENDING, EIN_WORDS_PL, EIN_WORDS_SG, ENDING_OPTIONS, GENDER_LABEL, GENDER_SHORT, GENDERS,
  type CaseId, type CaseIndex, type Gender,
} from '../grammar.ts'
import { nounForm, type Noun } from '../nouns.ts'
import { pick } from '../random.ts'

// What a noun can be in a sentence. person: people (buy, give, help …);
// animal: can see, wait, lie somewhere; place: you can go through it;
// furniture: something can stand next to it; surface: something can sit or
// lie on it; portable: can be bought, given, laid down; vehicle: stands outside
type Tag = 'person' | 'animal' | 'thing' | 'place' | 'furniture' | 'surface' | 'portable' | 'vehicle'
// adjectives: when only some fit this noun (otherwise by person or thing)
type SentenceNoun = Noun & { tags: Tag[]; adjectives?: string[] }

// The building blocks of "declination-exercises.md", without n-nouns for now.
// opts must contain every form of the noun (all four cases)
const NOUNS: SentenceNoun[] = [
  { w: 'Mann', g: 'm', gen: 'Mannes', opts: ['Mann', 'Mannen', 'Mannes'], tags: ['person'] },
  { w: 'Freund', g: 'm', gen: 'Freundes', opts: ['Freund', 'Freunden', 'Freundes'], tags: ['person'] },
  { w: 'Hund', g: 'm', gen: 'Hundes', opts: ['Hund', 'Hunden', 'Hundes'], tags: ['animal'] },
  { w: 'Tisch', g: 'm', gen: 'Tisches', opts: ['Tisch', 'Tischen', 'Tisches'], tags: ['thing', 'furniture', 'surface'] },
  { w: 'Stuhl', g: 'm', gen: 'Stuhles', opts: ['Stuhl', 'Stuhlen', 'Stuhles'], tags: ['thing', 'furniture', 'surface', 'portable'] },
  { w: 'Park', g: 'm', gen: 'Parks', opts: ['Park', 'Parken', 'Parks'], tags: ['place'] },
  { w: 'Kind', g: 'n', gen: 'Kindes', opts: ['Kind', 'Kinden', 'Kindes'], tags: ['person'], adjectives: ['klein', 'groß', 'nett'] },
  { w: 'Haus', g: 'n', gen: 'Hauses', opts: ['Haus', 'Hausen', 'Hauses'], tags: ['thing', 'place'] },
  { w: 'Buch', g: 'n', gen: 'Buches', opts: ['Buch', 'Buchen', 'Buches'], tags: ['thing', 'portable'] },
  { w: 'Auto', g: 'n', gen: 'Autos', opts: ['Auto', 'Auton', 'Autos'], tags: ['thing', 'vehicle'] },
  { w: 'Bett', g: 'n', gen: 'Bettes', opts: ['Bett', 'Betten', 'Bettes'], tags: ['thing', 'furniture', 'surface'] },
  { w: 'Sofa', g: 'n', gen: 'Sofas', opts: ['Sofa', 'Sofan', 'Sofas'], tags: ['thing', 'furniture', 'surface'] },
  { w: 'Frau', g: 'f', opts: ['Frau', 'Frauen', 'Fraus'], tags: ['person'] },
  { w: 'Katze', g: 'f', opts: ['Katze', 'Katzen', 'Katzes'], tags: ['animal'] },
  { w: 'Lampe', g: 'f', opts: ['Lampe', 'Lampen', 'Lampes'], tags: ['thing', 'furniture', 'portable'] },
  { w: 'Stadt', g: 'f', opts: ['Stadt', 'Stadten', 'Stadts'], tags: ['place'] },
  { w: 'Leute', g: 'p', dat: 'Leuten', opts: ['Leute', 'Leuten', 'Leutes'], tags: ['person'] },
  { w: 'Freunde', g: 'p', dat: 'Freunden', opts: ['Freunde', 'Freunden', 'Freundes'], tags: ['person'] },
  { w: 'Kinder', g: 'p', dat: 'Kindern', opts: ['Kinder', 'Kindern', 'Kinders'], tags: ['person'], adjectives: ['klein', 'groß', 'nett'] },
  { w: 'Bücher', g: 'p', dat: 'Büchern', opts: ['Bücher', 'Büchern', 'Büchers'], tags: ['thing', 'portable'] },
  // More plurals, for the form without an article (plural only)
  { w: 'Hunde', g: 'p', dat: 'Hunden', opts: ['Hunde', 'Hunden', 'Hundes'], tags: ['animal'] },
  { w: 'Katzen', g: 'p', dat: 'Katzen', opts: ['Katzen', 'Katze', 'Katzens'], tags: ['animal'] },
  { w: 'Tische', g: 'p', dat: 'Tischen', opts: ['Tische', 'Tischen', 'Tisches'], tags: ['thing', 'furniture', 'surface'] },
  { w: 'Stühle', g: 'p', dat: 'Stühlen', opts: ['Stühle', 'Stühlen', 'Stühles'], tags: ['thing', 'furniture', 'surface', 'portable'] },
  { w: 'Lampen', g: 'p', dat: 'Lampen', opts: ['Lampen', 'Lampe', 'Lampens'], tags: ['thing', 'furniture', 'portable'] },
  { w: 'Häuser', g: 'p', dat: 'Häusern', opts: ['Häuser', 'Häusern', 'Häusers'], tags: ['thing', 'place'] },
];

// Adjectives that make sense for people and animals, and for everything else
const PERSON_ADJECTIVES = ['alt', 'jung', 'klein', 'groß', 'nett'];
const THING_ADJECTIVES = ['alt', 'neu', 'klein', 'groß', 'schön'];

// A sentence with one noun phrase per {}: its case, and which nouns fit
// (any of the tags). singular: the verb or the sentence needs a singular noun
interface Phrase { case: CaseId; tags: Tag[]; singular?: boolean }
interface Frame { id: string; text: string; phrases: Phrase[] }

const p = (caseId: CaseId, tags: Tag[], singular = false): Phrase => ({ case: caseId, tags, singular });
const PEOPLE: Tag[] = ['person'];
const LIVING: Tag[] = ['person', 'animal'];
const ANYTHING: Tag[] = ['person', 'animal', 'thing', 'place'];
// Singular subjects, so the verb stays the same: someone who acts (buys,
// gives, helps …), or any person or animal (sees, waits …)
const SUBJECT = p('nom', PEOPLE, true);
const CREATURE = p('nom', LIVING, true);

// From "declination-exercises.md". Left out for now: sentences that need
// ein/kein (5, 9), a fixed gender (44), contractions such as beim, vom, im
// (17, 18, 41, 49, 50, 57), or special nouns (25, 26)
const FRAMES: Frame[] = [
  // One gap: Nominativ
  { id: 'wartet', text: '{} wartet vor der Tür.', phrases: [CREATURE] },
  { id: 'das-ist', text: 'Das ist {}.', phrases: [p('nom', ANYTHING, true)] },
  { id: 'wohnt', text: 'Hier wohnt {}.', phrases: [SUBJECT] },
  { id: 'gefaellt-mir', text: '{} gefällt mir sehr.', phrases: [p('nom', ['thing', 'place'], true)] },
  // One gap: Akkusativ
  { id: 'ich-sehe', text: 'Ich sehe {}.', phrases: [p('akk', ANYTHING)] },
  { id: 'wir-suchen', text: 'Wir suchen {}.', phrases: [p('akk', ANYTHING)] },
  { id: 'sie-kauft', text: 'Sie kauft {}.', phrases: [p('akk', ['thing'])] },
  { id: 'fuer', text: 'Das Geschenk ist für {}.', phrases: [p('akk', LIVING)] },
  { id: 'ohne', text: 'Ohne {} gehe ich nicht.', phrases: [p('akk', ['person', 'animal', 'portable'])] },
  { id: 'durch', text: 'Wir gehen durch {}.', phrases: [p('akk', ['place'])] },
  // One gap: Dativ
  { id: 'ich-helfe', text: 'Ich helfe {}.', phrases: [p('dat', LIVING)] },
  { id: 'gehoert-buch', text: 'Das Buch gehört {}.', phrases: [p('dat', PEOPLE)] },
  { id: 'apfel', text: 'Ich gebe {} einen Apfel.', phrases: [p('dat', LIVING)] },
  { id: 'spreche-mit', text: 'Ich spreche mit {}.', phrases: [p('dat', PEOPLE)] },
  // One gap: two-way prepositions
  { id: 'stelle-neben', text: 'Ich stelle die Tasche neben {}.', phrases: [p('akk', ['furniture'])] },
  { id: 'steht-neben', text: 'Die Tasche steht neben {}.', phrases: [p('dat', ['furniture'])] },
  { id: 'springt-auf', text: 'Die Katze springt auf {}.', phrases: [p('akk', ['surface'])] },
  { id: 'sitzt-auf', text: 'Die Katze sitzt auf {}.', phrases: [p('dat', ['surface'])] },
  // One gap: Genitiv
  { id: 'auto-des', text: 'Das ist das Auto {}.', phrases: [p('gen', PEOPLE)] },
  { id: 'name', text: 'Der Name {} ist schwer.', phrases: [p('gen', ['person', 'animal', 'place'])] },
  // Two gaps: Nom + Akk
  { id: 'sieht', text: '{} sieht {}.', phrases: [CREATURE, p('akk', ANYTHING)] },
  { id: 'kauft', text: '{} kauft {}.', phrases: [SUBJECT, p('akk', ['thing'])] },
  { id: 'sucht', text: '{} sucht {}.', phrases: [CREATURE, p('akk', ANYTHING)] },
  { id: 'braucht', text: '{} braucht {}.', phrases: [CREATURE, p('akk', ['thing'])] },
  { id: 'liebt', text: '{} liebt {}.', phrases: [CREATURE, p('akk', ANYTHING)] },
  // Two gaps: Nom + Dat
  { id: 'hilft', text: '{} hilft {}.', phrases: [SUBJECT, p('dat', LIVING)] },
  { id: 'gehoert', text: '{} gehört {}.', phrases: [p('nom', ['thing'], true), p('dat', LIVING)] },
  { id: 'gefaellt', text: '{} gefällt {}.', phrases: [p('nom', ['thing', 'place'], true), p('dat', LIVING)] },
  { id: 'antwortet', text: '{} antwortet {}.', phrases: [SUBJECT, p('dat', PEOPLE)] },
  { id: 'dankt', text: '{} dankt {}.', phrases: [SUBJECT, p('dat', PEOPLE)] },
  // Two gaps: Dat + Akk, fixed subject
  { id: 'ich-gebe', text: 'Ich gebe {} {}.', phrases: [p('dat', LIVING), p('akk', ['portable'])] },
  { id: 'sie-schenkt', text: 'Sie schenkt {} {}.', phrases: [p('dat', PEOPLE), p('akk', ['portable'])] },
  { id: 'er-zeigt', text: 'Er zeigt {} {}.', phrases: [p('dat', PEOPLE), p('akk', ['thing', 'place'])] },
  // Two gaps: Nom + preposition
  { id: 'geschenk-fuer', text: '{} kauft ein Geschenk für {}.', phrases: [SUBJECT, p('akk', PEOPLE)] },
  { id: 'spricht-mit', text: '{} spricht mit {}.', phrases: [SUBJECT, p('dat', PEOPLE)] },
  // Two gaps: Nom + Gen
  { id: 'vor-dem-haus', text: '{} steht vor dem Haus {}.', phrases: [p('nom', ['person', 'animal', 'vehicle'], true), p('gen', PEOPLE)] },
  { id: 'wegen', text: 'Wegen {} kommt {} nicht.', phrases: [p('gen', LIVING), CREATURE] },
  // Two gaps: Nom + two-way preposition
  { id: 'legt-buch-auf', text: '{} legt das Buch auf {}.', phrases: [SUBJECT, p('akk', ['surface'])] },
  { id: 'liegt-auf', text: '{} liegt auf {}.', phrases: [p('nom', ['animal', 'portable'], true), p('dat', ['surface'])] },
  // Three gaps
  { id: 'gibt', text: '{} gibt {} {}.', phrases: [SUBJECT, p('dat', LIVING), p('akk', ['portable'])] },
  { id: 'zeigt', text: '{} zeigt {} {}.', phrases: [SUBJECT, p('dat', PEOPLE), p('akk', ['thing', 'place'])] },
  { id: 'schenkt', text: '{} schenkt {} {}.', phrases: [SUBJECT, p('dat', PEOPLE), p('akk', ['portable'])] },
  { id: 'stellt-neben', text: '{} stellt {} neben {}.', phrases: [SUBJECT, p('akk', ['portable']), p('akk', ['furniture'])] },
  { id: 'legt-auf', text: '{} legt {} auf {}.', phrases: [SUBJECT, p('akk', ['portable']), p('akk', ['surface'])] },
];

// The forms a noun phrase can take; id is also its score tag. Without an article,
// countable nouns take adjective + noun only in the plural (alte Leute, not
// *alter Mann*), so that form never picks a singular noun
interface Pattern { id: string; article: 'def' | 'ein' | 'none'; adjective: boolean; pluralOnly?: boolean }

const PATTERNS: Pattern[] = [
  { id: 'def.Art+noun', article: 'def', adjective: false },
  { id: 'ein-word+noun', article: 'ein', adjective: false },
  { id: 'adj+noun', article: 'none', adjective: true, pluralOnly: true },
  { id: 'def.Art+adj+noun', article: 'def', adjective: true },
  { id: 'ein-word+adj+noun', article: 'ein', adjective: true },
];

// After der/die/das the adjective takes the weak endings, after ein/kein/mein
// the mixed ones, and without an article the strong ones
const ADJ_TABLE = { def: ADJ_ENDING.weak, ein: ADJ_ENDING.mixed, none: ADJ_ENDING.strong };

// Shown after each noun: ♂ maskulin, ♀ feminin, ⚲ neutrum, ⚤ Plural. U+FE0E asks
// for the plain text symbol, not the coloured emoji some phones show for ♂ and ♀
const GENDER_SIGN: Record<Gender, string> = { m: '♂\uFE0E', f: '♀\uFE0E', n: '⚲\uFE0E', p: '⚤\uFE0E' };

// The gaps of one noun phrase, in the pattern's form: (article) (adjective) noun.
// einWord: which of ein/kein/mein … to use, for the ein-word patterns
function phraseGaps(noun: SentenceNoun, adj: string, einWord: string, pattern: Pattern, ci: CaseIndex): Gap[] {
  const gaps: Gap[] = [];
  if (pattern.article === 'def') {
    gaps.push({ label: 'Article', options: DEF_OPTIONS, answer: DEF_ARTICLE[noun.g][ci] });
  } else if (pattern.article === 'ein') {
    gaps.push({ label: 'Article', options: ENDING_OPTIONS.map(e => einWord + e), answer: einWord + EIN_ENDING[noun.g][ci] });
  }
  if (pattern.adjective) {
    const table = ADJ_TABLE[pattern.article];
    gaps.push({ label: 'Adjective', options: ENDING_OPTIONS.map(e => adj + e), answer: adj + table[noun.g][ci] });
  }
  // The gender is given: the exercise is about the endings, not about guessing it
  gaps.push({ label: 'Noun', options: noun.opts, answer: nounForm(noun, ci), note: GENDER_SIGN[noun.g] });
  return gaps;
}

// The first word of a sentence: options and answer start with a capital
function capitalized(gap: Gap): Gap {
  return { ...gap, options: gap.options.map(capitalize), answer: capitalize(gap.answer) };
}

const SETTINGS: SettingDef[] = [
  {
    id: 'cases', label: 'Cases', type: 'multi',
    options: CASES.map(c => ({ id: c.id, label: c.name })), default: CASES.map(c => c.id),
  },
  {
    id: 'patterns', label: 'Forms', type: 'multi',
    options: [
      { id: 'def.Art+noun', label: 'der Mann' },
      { id: 'ein-word+noun', label: 'einen Mann' },
      { id: 'adj+noun', label: 'alte Leute' },
      { id: 'def.Art+adj+noun', label: 'dem alten Mann' },
      { id: 'ein-word+adj+noun', label: 'einem alten Mann' },
    ],
    default: PATTERNS.map(p => p.id),
  },
  {
    id: 'genders', label: 'Gender / number', type: 'multi',
    options: GENDERS.map(g => ({ id: g, label: GENDER_LABEL[g] })), default: [...GENDERS],
  },
  {
    id: 'lengths', label: 'Noun phrases per sentence', type: 'multi',
    options: [{ id: '1', label: 'One' }, { id: '2', label: 'Two' }, { id: '3', label: 'Three' }],
    default: ['1', '2', '3'],
  },
  {
    id: 'einWords', label: 'ein-words', type: 'choice',
    options: [{ id: 'ein-kein', label: 'ein, kein' }, { id: 'all', label: 'Also mein, dein …' }],
    default: 'all',
  },
];

// The settings as the generator uses them
interface Choice {
  cases: string[]
  patterns: Pattern[]
  genders: string[]
  lengths: number[]
  einWordsSg: string[]
  einWordsPl: string[]
}

function readChoice(values: SettingValues): Choice {
  const all = choiceValue(SETTINGS, values, 'einWords') === 'all';
  const patterns = multiValue(SETTINGS, values, 'patterns');
  return {
    cases: multiValue(SETTINGS, values, 'cases'),
    patterns: PATTERNS.filter(p => patterns.includes(p.id)),
    genders: multiValue(SETTINGS, values, 'genders'),
    lengths: multiValue(SETTINGS, values, 'lengths').map(Number),
    einWordsSg: all ? EIN_WORDS_SG : ['ein', 'kein'],
    // No plural of "ein"
    einWordsPl: all ? EIN_WORDS_PL : ['kein'],
  };
}

// Every setting allows everything: used for the phrases that are given
const ANY: Choice = readChoice({});

// The nouns and forms the phrase can take with these settings, avoiding nouns
// already used. No forms if no noun fits
function candidates(phrase: Phrase, c: Choice, used: string[]): { nouns: SentenceNoun[]; patterns: Pattern[] } {
  const nouns = NOUNS.filter(n =>
    n.tags.some(t => phrase.tags.includes(t)) && !(phrase.singular && n.g === 'p')
    && c.genders.includes(n.g) && !used.includes(n.w));
  const patterns = c.patterns.filter(p => p.pluralOnly ? nouns.some(n => n.g === 'p') : nouns.length > 0);
  return { nouns, patterns };
}

// Asked (in a selected case, and some noun and form fit), or given
function asked(phrase: Phrase, c: Choice): boolean {
  return c.cases.includes(phrase.case) && candidates(phrase, c, []).patterns.length > 0;
}

// Frames of a selected length with at least one phrase to ask
function framesFor(c: Choice): Frame[] {
  return FRAMES.filter(f => c.lengths.includes(f.phrases.length) && f.phrases.some(ph => asked(ph, c)));
}

// A random pattern and noun that fit the phrase, or null if none is left
function choose(phrase: Phrase, c: Choice, used: string[]): { pattern: Pattern; noun: SentenceNoun } | null {
  const { nouns, patterns } = candidates(phrase, c, used);
  if (!patterns.length) return null;
  const pattern = pick(patterns);
  const noun = pick(pattern.pluralOnly ? nouns.filter(n => n.g === 'p') : nouns);
  return { pattern, noun };
}

// A sentence for these settings. Phrases in a case that isn't selected (or
// that no selected noun or form fits) are given: filled in, not scored. Null
// if, in the end, nothing is left to ask (the nouns for it went to other phrases)
function createTask(c: Choice, frames: Frame[]): GapFillTask | null {
  const frame = pick(frames);
  const gaps: Gap[] = [];
  const scores: ScoreGroup[] = [];
  const explanations: Explanation[] = [];
  // The hints of each phrase's gaps, to put in place of its {}
  const phraseHints: string[] = [];
  const keyParts = [frame.id];

  // Nouns for the asked phrases first, so the given ones don't take them
  const isAsked = frame.phrases.map(ph => asked(ph, c));
  const used: string[] = [];
  const chosen = frame.phrases.map(() => null as ReturnType<typeof choose>);
  for (const askedPass of [true, false]) {
    for (const [i, phrase] of frame.phrases.entries()) {
      if (isAsked[i] !== askedPass || chosen[i]) continue;
      let ch = askedPass ? choose(phrase, c, used) : null;
      if (!ch) {
        // Given: any noun and form; a noun used twice only if nothing else fits
        isAsked[i] = false;
        ch = choose(phrase, ANY, used) ?? choose(phrase, ANY, [])!;
      }
      chosen[i] = ch;
      used.push(ch.noun.w);
    }
  }
  if (!isAsked.some(Boolean)) return null;

  for (const [i, phrase] of frame.phrases.entries()) {
    const { pattern, noun } = chosen[i]!;
    const living = noun.tags.includes('person') || noun.tags.includes('animal');
    const adj = pick(noun.adjectives ?? (living ? PERSON_ADJECTIVES : THING_ADJECTIVES));
    const einWord = pick(noun.g === 'p' ? c.einWordsPl : c.einWordsSg);
    const ci = caseIndex(phrase.case);
    keyParts.push(pattern.id, einWord, adj, noun.w);

    let pg = phraseGaps(noun, adj, einWord, pattern, ci)
      .map((g): Gap => isAsked[i] ? { ...g, tone: phrase.case } : { ...g, given: true });
    if (i === 0 && frame.text.startsWith('{}')) pg = [capitalized(pg[0]), ...pg.slice(1)];
    const first = gaps.length;
    gaps.push(...pg);
    // A given gap's braces hold its answer, an asked one's a hint that rules out no option
    phraseHints.push(pg.map(g => `{${g.given ? g.answer : hintFor(g.options)}}`).join(' '));
    if (!isAsked[i]) continue;
    scores.push({ tags: { case: CASE_SHORT[phrase.case], pattern: pattern.id }, gaps: pg.map((_, k) => first + k) });
    // "Akk m", "Dat pl" … before the phrase, shown after mistakes
    explanations.push({ gap: first, text: CASE_SHORT[phrase.case], detail: GENDER_SHORT[noun.g] });
  }

  // Each {} of the frame becomes its phrase's gaps
  let n = 0;
  const template = frame.text.replace(/\{\}/g, () => phraseHints[n++]);

  return { key: keyParts.join('|'), template, gaps, scores, explanations };
}

export const declensionSentences: GapFillExercise = {
  id: 'declension-sentences',
  title: 'Declension in sentences',
  info: `Complete the sentence, one word at a time. Each gap shows the start of the word; choose the right ending from the options below the sentence. After each noun, its gender is given in brackets: ♂\uFE0E maskulin, ♀\uFE0E feminin, ⚲\uFE0E neutrum, ⚤\uFE0E Plural (male and female). A wrong choice turns red: try again until you find the right one. Then the options move on to the next word.

The sentences have one, two or three noun phrases, in any of the four cases. Each noun phrase takes one of five forms:
der Mann (definite article + noun), einen Mann (ein, kein, mein … + noun), alte Leute (adjective + noun, only in the plural), dem alten Mann (definite article + adjective + noun), einem alten Mann (ein, kein, mein … + adjective + noun).

Two questions help every time: which case does the word's place in the sentence need, and does the article already show it? After der, die, das … the adjective only takes -e or -en. After ein, kein, mein … it does too, except where the article has no ending (ein alter Mann, ein kleines Kind). Without an article, the adjective shows the case itself.

If you made a mistake, the sentence stays when it's complete, with the case and gender of each noun phrase written in front of it, e.g. (Akk m) or (Dat pl); click Next (or press Enter) to go on. Without mistakes, the next sentence comes by itself.

In the settings (gear icon) you choose the cases, forms, genders, how many noun phrases a sentence has, and which ein-words appear. A noun phrase that doesn't fit your choice (e.g. a Nominativ subject when you practise only Dativ) is filled in already, in its own colour, and not counted. Once a noun phrase is complete, its words take the colour of its case: Nominativ blue, Akkusativ orange, Dativ green, Genitiv purple.

Your results are counted per case and form, separately for each noun phrase: a phrase counts as a success when all its words were right at the first try. Skipped sentences are not counted.`,
  settings: SETTINGS,
  problem(values) {
    return framesFor(readChoice(values)).length ? null
      : 'No sentence fits this combination. Select more cases, forms, genders or sentence lengths.';
  },
  next(values, previous) {
    let c = readChoice(values);
    let frames = framesFor(c);
    // Settings that allow no sentence (the dialog doesn't let them be kept): the defaults
    if (!frames.length) { c = ANY; frames = framesFor(c); }
    let task: GapFillTask | null = null;
    for (let tries = 0; tries < 50 && (!task || task.key === previous?.key); tries++) task = createTask(c, frames) ?? task;
    return task ?? createTask(ANY, framesFor(ANY))!;
  },
};
