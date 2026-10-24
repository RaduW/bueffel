import type { CaseIndex, Gender } from './grammar.ts'

export interface Noun {
  w: string
  g: Gender
  gen?: string
  dat?: string
  obl?: string
  opts: string[]
}

// g: gender (p = plural), gen: Genitiv singular (m/n), dat: Dativ plural,
// obl: n-noun form for Akk/Dat/Gen, opts: noun forms offered as choices
export const NOUN_POOLS: Record<string, { label: string; nouns: Noun[] }> = {
  core: {
    label: 'Mann, Kind, Frau, Leute',
    nouns: [
      { w: 'Mann', g: 'm', gen: 'Mannes', opts: ['Mann', 'Mannen', 'Mannes'] },
      { w: 'Kind', g: 'n', gen: 'Kindes', opts: ['Kind', 'Kinden', 'Kindes'] },
      { w: 'Frau', g: 'f', opts: ['Frau', 'Frauen', 'Fraus'] },
      { w: 'Leute', g: 'p', dat: 'Leuten', opts: ['Leute', 'Leuten', 'Leutes'] },
    ],
  },
  more: {
    label: 'More nouns',
    nouns: [
      { w: 'Tisch', g: 'm', gen: 'Tisches', opts: ['Tisch', 'Tischen', 'Tisches'] },
      { w: 'Vater', g: 'm', gen: 'Vaters', opts: ['Vater', 'Vatern', 'Vaters'] },
      { w: 'Hund', g: 'm', gen: 'Hundes', opts: ['Hund', 'Hunden', 'Hundes'] },
      { w: 'Lehrer', g: 'm', gen: 'Lehrers', opts: ['Lehrer', 'Lehrern', 'Lehrers'] },
      { w: 'Haus', g: 'n', gen: 'Hauses', opts: ['Haus', 'Hausen', 'Hauses'] },
      { w: 'Buch', g: 'n', gen: 'Buches', opts: ['Buch', 'Buchen', 'Buches'] },
      { w: 'Fenster', g: 'n', gen: 'Fensters', opts: ['Fenster', 'Fenstern', 'Fensters'] },
      { w: 'Auto', g: 'n', gen: 'Autos', opts: ['Auto', 'Auton', 'Autos'] },
      { w: 'Stadt', g: 'f', opts: ['Stadt', 'Stadten', 'Stadts'] },
      { w: 'Lampe', g: 'f', opts: ['Lampe', 'Lampen', 'Lampes'] },
      { w: 'Tür', g: 'f', opts: ['Tür', 'Türen', 'Türs'] },
      { w: 'Kinder', g: 'p', dat: 'Kindern', opts: ['Kinder', 'Kindern', 'Kinders'] },
      { w: 'Männer', g: 'p', dat: 'Männern', opts: ['Männer', 'Männern', 'Männers'] },
      { w: 'Bücher', g: 'p', dat: 'Büchern', opts: ['Bücher', 'Büchern', 'Büchers'] },
      { w: 'Tische', g: 'p', dat: 'Tischen', opts: ['Tische', 'Tischen', 'Tisches'] },
    ],
  },
  nnoun: {
    label: 'n-nouns (Junge, Student …)',
    nouns: [
      { w: 'Junge', g: 'm', obl: 'Jungen', opts: ['Junge', 'Jungen', 'Junges'] },
      { w: 'Kollege', g: 'm', obl: 'Kollegen', opts: ['Kollege', 'Kollegen', 'Kolleges'] },
      { w: 'Student', g: 'm', obl: 'Studenten', opts: ['Student', 'Studenten', 'Studentes'] },
      { w: 'Mensch', g: 'm', obl: 'Menschen', opts: ['Mensch', 'Menschen', 'Mensches'] },
    ],
  },
};

// The example nouns of the summary tables: Mann, Kind, Frau, Leute
export const SAMPLE_NOUN = Object.fromEntries(NOUN_POOLS.core.nouns.map(n => [n.g, n])) as Record<Gender, Noun>;

export function nounForm(noun: Noun, ci: CaseIndex): string {
  if (noun.obl) return ci === 0 ? noun.w : noun.obl;
  if (noun.g === 'p') return ci === 2 ? noun.dat! : noun.w;
  if (noun.g === 'f') return noun.w;
  return ci === 3 ? noun.gen! : noun.w;
}
