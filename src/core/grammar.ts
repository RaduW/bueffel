// Declension data (from "German Declination.md")

export type Gender = 'm' | 'n' | 'f' | 'p'
export type CaseIndex = 0 | 1 | 2 | 3
export type Table = Record<Gender, string[]>

// Case order everywhere: Nom, Akk, Dat, Gen
export const CASES = [
  { id: 'nom', name: 'Nominativ', question: 'Wer? Was?' },
  { id: 'akk', name: 'Akkusativ', question: 'Wen? Was?' },
  { id: 'dat', name: 'Dativ', question: 'Wem?' },
  { id: 'gen', name: 'Genitiv', question: 'Wessen?' },
] as const;

export type CaseId = (typeof CASES)[number]['id']

export function caseIndex(id: string): CaseIndex {
  return CASES.findIndex(c => c.id === id) as CaseIndex;
}

export const GENDER_LABEL: Record<Gender, string> = { m: 'maskulin', n: 'neutrum', f: 'feminin', p: 'Plural' };

// Short names, used in score tags and explanations: "Dat", "pl"
export const CASE_SHORT: Record<CaseId, string> = { nom: 'Nom', akk: 'Akk', dat: 'Dat', gen: 'Gen' };
export const GENDER_SHORT: Record<Gender, string> = { m: 'm', n: 'n', f: 'f', p: 'pl' };
export const GENDER_HEADER: Record<Gender, string> = { m: 'Maskulin', n: 'Neutrum', f: 'Feminin', p: 'Plural' };
export const GENDERS = Object.keys(GENDER_LABEL) as Gender[];

export const DEF_ARTICLE: Table = {
  m: ['der', 'den', 'dem', 'des'],
  n: ['das', 'das', 'dem', 'des'],
  f: ['die', 'die', 'der', 'der'],
  p: ['die', 'die', 'den', 'der'],
};
export const DEF_OPTIONS = ['der', 'die', 'das', 'den', 'dem', 'des'];

// Endings for ein / kein / mein ...
export const EIN_ENDING: Table = {
  m: ['', 'en', 'em', 'es'],
  n: ['', '', 'em', 'es'],
  f: ['e', 'e', 'er', 'er'],
  p: ['e', 'e', 'en', 'er'],
};

export const ADJ_ENDING: Record<'strong' | 'weak' | 'mixed', Table> = {
  strong: {
    m: ['er', 'en', 'em', 'en'],
    n: ['es', 'es', 'em', 'en'],
    f: ['e', 'e', 'er', 'er'],
    p: ['e', 'e', 'en', 'er'],
  },
  weak: {
    m: ['e', 'en', 'en', 'en'],
    n: ['e', 'e', 'en', 'en'],
    f: ['e', 'e', 'en', 'en'],
    p: ['en', 'en', 'en', 'en'],
  },
  mixed: {
    m: ['er', 'en', 'en', 'en'],
    n: ['es', 'es', 'en', 'en'],
    f: ['e', 'e', 'en', 'en'],
    p: ['en', 'en', 'en', 'en'],
  },
};
export const ENDING_OPTIONS = ['', 'e', 'en', 'em', 'er', 'es'];

// ein has no plural, so plural questions use kein / possessives only
export const EIN_WORDS_SG = ['ein', 'kein', 'mein', 'dein', 'sein', 'ihr', 'unser'];
export const EIN_WORDS_PL = ['kein', 'mein', 'dein', 'sein', 'ihr', 'unser'];

export const ADJECTIVES = ['alt', 'jung', 'klein', 'groß', 'neu', 'gut', 'schön', 'nett'];
