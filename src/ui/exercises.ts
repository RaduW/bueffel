// The exercises offered on the home page. Add new ones here.

import type { ComponentType } from 'react'
import { wordOrder } from '../core/conjunctions/wordOrder.ts'
import { declension } from '../core/declension/declension.ts'
import { personForms } from '../core/pronouns/personForms.ts'
import { questionWords } from '../core/pronouns/questionWords.ts'
import { replaceNoun } from '../core/pronouns/replaceNoun.ts'
import { declensionSentences } from '../core/sentences/declensionSentences.ts'
import { gapFillPage } from './common/GapFillPage.tsx'
import { DeclensionPrompt } from './declension/DeclensionPrompt.tsx'
import { CONJUNCTIONS, DECLENSION_TABLES, PRONOUNS } from './grammar.ts'
import { ContextPrompt } from './pronouns/ContextPrompt.tsx'

export interface ExercisePage {
  // URL hash: #/<route>
  route: string
  // The only text on the exercise's card on the home page
  title: string
  // Rendered while the exercise is open; onFinish returns to the home page
  component: ComponentType<{ onFinish: () => void }>
}

export const EXERCISE_PAGES: ExercisePage[] = [
  { route: 'declension', title: declension.title, component: gapFillPage(declension, {
    Prompt: DeclensionPrompt,
    grammar: [DECLENSION_TABLES],
  }) },
  { route: 'sentences', title: declensionSentences.title, component: gapFillPage(declensionSentences, {
    grammar: [DECLENSION_TABLES],
  }) },
  { route: 'word-order', title: wordOrder.title, component: gapFillPage(wordOrder, {
    grammar: [CONJUNCTIONS],
  }) },
  { route: 'pronouns-replace', title: replaceNoun.title, component: gapFillPage(replaceNoun, {
    Prompt: ContextPrompt,
    grammar: [PRONOUNS],
  }) },
  { route: 'pronouns-persons', title: personForms.title, component: gapFillPage(personForms, {
    grammar: [PRONOUNS],
  }) },
  { route: 'question-words', title: questionWords.title, component: gapFillPage(questionWords, {
    Prompt: ContextPrompt,
    grammar: [PRONOUNS],
  }) },
];
