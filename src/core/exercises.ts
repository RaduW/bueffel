import {
  ADJ_ENDING, DEF_ARTICLE, DEF_OPTIONS, EIN_ENDING, EIN_WORDS_PL, EIN_WORDS_SG, ENDING_OPTIONS,
  type CaseIndex, type Gender,
} from './grammar.ts'
import { nounForm, SAMPLE_NOUN, type Noun } from './nouns.ts'
import { pick } from './random.ts'

export interface Slot {
  label: string
  options: string[]
  answer: string
}

// A word for the summary tables, split into [stem, ending]
export type Word = [string, string]

export interface Exercise {
  id: string
  name: string
  adjective?: boolean
  build(noun: Noun, ci: CaseIndex, adj: string): Slot[]
  // One cell of the summary table, using the example nouns and 'alt'
  sample(g: Gender, ci: CaseIndex): Word[]
}

// Each exercise builds a list of slots: { label, options, answer }
export const EXERCISES: Exercise[] = [
  {
    id: 'def',
    name: 'Definite article + noun',
    build(noun, ci) {
      return [
        { label: 'Article', options: DEF_OPTIONS, answer: DEF_ARTICLE[noun.g][ci] },
        nounSlot(noun, ci),
      ];
    },
    sample(g, ci) {
      return [defWord(g, ci), sampleNoun(g, ci)];
    },
  },
  {
    id: 'indef',
    name: 'ein / kein / mein … + noun',
    build(noun, ci) {
      return [einSlot(noun, ci), nounSlot(noun, ci)];
    },
    sample(g, ci) {
      return [[g === 'p' ? 'kein' : '(k)ein', EIN_ENDING[g][ci]], sampleNoun(g, ci)];
    },
  },
  {
    id: 'strong',
    name: 'Adjective + noun (no article)',
    adjective: true,
    build(noun, ci, adj) {
      return [adjSlot(adj, ADJ_ENDING.strong[noun.g][ci]), nounSlot(noun, ci)];
    },
    sample(g, ci) {
      return [['alt', ADJ_ENDING.strong[g][ci]], sampleNoun(g, ci)];
    },
  },
  {
    id: 'weak',
    name: 'der + adjective + noun',
    adjective: true,
    build(noun, ci, adj) {
      return [
        { label: 'Article', options: DEF_OPTIONS, answer: DEF_ARTICLE[noun.g][ci] },
        adjSlot(adj, ADJ_ENDING.weak[noun.g][ci]),
        nounSlot(noun, ci),
      ];
    },
    sample(g, ci) {
      return [defWord(g, ci), ['alt', ADJ_ENDING.weak[g][ci]], sampleNoun(g, ci)];
    },
  },
  {
    id: 'mixed',
    name: 'ein / kein + adjective + noun',
    adjective: true,
    build(noun, ci, adj) {
      return [einSlot(noun, ci), adjSlot(adj, ADJ_ENDING.mixed[noun.g][ci]), nounSlot(noun, ci)];
    },
    sample(g, ci) {
      return [[g === 'p' ? 'kein' : 'ein', EIN_ENDING[g][ci]], ['alt', ADJ_ENDING.mixed[g][ci]], sampleNoun(g, ci)];
    },
  },
];

export function exerciseById(id: string): Exercise | undefined {
  return EXERCISES.find(e => e.id === id);
}

function nounSlot(noun: Noun, ci: CaseIndex): Slot {
  return { label: 'Noun', options: noun.opts, answer: nounForm(noun, ci) };
}

function einSlot(noun: Noun, ci: CaseIndex): Slot {
  const stem = pick(noun.g === 'p' ? EIN_WORDS_PL : EIN_WORDS_SG);
  return {
    label: 'Article',
    options: ENDING_OPTIONS.map(e => stem + e),
    answer: stem + EIN_ENDING[noun.g][ci],
  };
}

function adjSlot(adj: string, ending: string): Slot {
  return { label: 'Adjective', options: ENDING_OPTIONS.map(e => adj + e), answer: adj + ending };
}

// der / den / dem ... with everything after the d as the ending
function defWord(g: Gender, ci: CaseIndex): Word {
  return ['d', DEF_ARTICLE[g][ci].slice(1)];
}

function sampleNoun(g: Gender, ci: CaseIndex): Word {
  const noun = SAMPLE_NOUN[g];
  return [noun.w, nounForm(noun, ci).slice(noun.w.length)];
}
