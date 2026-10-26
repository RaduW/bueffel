// The grammar pages (tables, cheat sheets …): listed on the home page under
// Grammar, and linked from the help dialog of the exercises they belong to.
// Add new ones here.

import type { ComponentType } from 'react'
import { DeclensionTables } from './grammar/DeclensionTables.tsx'

// What a grammar page's content gets
export interface GrammarProps {
  compact: boolean
}

export interface GrammarPage {
  // URL hash: #/<route>
  route: string
  title: string
  Content: ComponentType<GrammarProps>
}

export const DECLENSION_TABLES: GrammarPage = {
  route: 'grammar/declension-tables', title: 'Declension tables', Content: DeclensionTables,
};

export const GRAMMAR_PAGES: GrammarPage[] = [DECLENSION_TABLES];
