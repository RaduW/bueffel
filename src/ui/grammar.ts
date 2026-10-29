// The grammar pages (tables, cheat sheets …): listed on the home page under
// Grammar, and linked from the help dialog of the exercises they belong to.
// Add new ones here.

import type { ComponentType } from 'react'
import { ConjunctionsSheet } from './grammar/ConjunctionsSheet.tsx'
import { DeclensionTables } from './grammar/DeclensionTables.tsx'
import { PronounTables } from './grammar/PronounTables.tsx'

// What a grammar page's content gets
export interface GrammarProps {
  compact: boolean
}

export interface GrammarPage {
  // URL hash: #/<route>
  route: string
  title: string
  Content: ComponentType<GrammarProps>
  // A wider page on desktop (e.g. for wide tables)
  wide?: boolean
}

export const DECLENSION_TABLES: GrammarPage = {
  route: 'grammar/declension-tables', title: 'Declension tables', Content: DeclensionTables, wide: true,
};

export const CONJUNCTIONS: GrammarPage = {
  route: 'grammar/conjunctions', title: 'Conjunctions & word order', Content: ConjunctionsSheet,
};

export const PRONOUNS: GrammarPage = {
  route: 'grammar/pronouns', title: 'Pronouns', Content: PronounTables, wide: true,
};

export const GRAMMAR_PAGES: GrammarPage[] = [DECLENSION_TABLES, PRONOUNS, CONJUNCTIONS];
