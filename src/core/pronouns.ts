// Pronoun tables for the grammar pages. Plain data; the UI lays it out.

import type { Word } from './exercises.ts'
import { EIN_ENDING, type CaseIndex, type Gender } from './grammar.ts'

export interface Person {
  // Short label: "1 Sg", "3 Sg m", "Sie" …
  label: string
  // The personal pronoun in Nom, Akk, Dat, Gen
  personal: [string, string, string, string]
  // The possessive article that goes with it (declined like ein)
  possessive: string
}

export const PERSONS: Person[] = [
  { label: '1 Sg', personal: ['ich', 'mich', 'mir', 'meiner'], possessive: 'mein' },
  { label: '2 Sg', personal: ['du', 'dich', 'dir', 'deiner'], possessive: 'dein' },
  { label: '3 Sg m', personal: ['er', 'ihn', 'ihm', 'seiner'], possessive: 'sein' },
  { label: '3 Sg f', personal: ['sie', 'sie', 'ihr', 'ihrer'], possessive: 'ihr' },
  { label: '3 Sg n', personal: ['es', 'es', 'ihm', 'seiner'], possessive: 'sein' },
  { label: '1 Pl', personal: ['wir', 'uns', 'uns', 'unser'], possessive: 'unser' },
  { label: '2 Pl', personal: ['ihr', 'euch', 'euch', 'euer'], possessive: 'euer' },
  { label: '3 Pl', personal: ['sie', 'sie', 'ihnen', 'ihrer'], possessive: 'ihr' },
  { label: 'formal', personal: ['Sie', 'Sie', 'Ihnen', 'Ihrer'], possessive: 'Ihr' },
];

// Reflexive pronouns: the subject, then Akk and Dat. Only the 3rd person and
// Sie differ from the personal pronouns: sich
export const REFLEXIVE: { subject: string; akk: string; dat: string }[] = [
  { subject: 'ich', akk: 'mich', dat: 'mir' },
  { subject: 'du', akk: 'dich', dat: 'dir' },
  { subject: 'er / sie / es', akk: 'sich', dat: 'sich' },
  { subject: 'wir', akk: 'uns', dat: 'uns' },
  { subject: 'ihr', akk: 'euch', dat: 'euch' },
  { subject: 'sie / Sie', akk: 'sich', dat: 'sich' },
];

// mein, dein … take the endings of ein (and kein in the plural)
export function possessiveCell(stem: string, g: Gender, ci: CaseIndex): Word {
  const ending = EIN_ENDING[g][ci];
  // euer drops its second e before an ending: eure, euren …
  return [stem === 'euer' && ending ? 'eur' : stem, ending];
}

// Relative pronouns: like der/die/das, except Dat Pl and Gen. [stem, ending]
const RELATIVE_ENDING: Record<Gender, string[]> = {
  m: ['er', 'en', 'em', 'essen'],
  n: ['as', 'as', 'em', 'essen'],
  f: ['ie', 'ie', 'er', 'eren'],
  p: ['ie', 'ie', 'enen', 'eren'],
};

export function relativeCell(g: Gender, ci: CaseIndex): Word {
  return ['d', RELATIVE_ENDING[g][ci]];
}

// Question words per case: wer (people), was (things). Dat of was isn't used
export const QUESTION: { wer: string; was: string }[] = [
  { wer: 'wer', was: 'was' },
  { wer: 'wen', was: 'was' },
  { wer: 'wem', was: '–' },
  { wer: 'wessen', was: 'wessen' },
];
