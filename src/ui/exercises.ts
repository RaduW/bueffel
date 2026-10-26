// The exercises offered on the home page. Add new ones here.

import type { ComponentType } from 'react'
import { declension } from '../core/declension/declension.ts'
import { declensionSentences } from '../core/sentences/declensionSentences.ts'
import { gapFillPage } from './common/GapFillPage.tsx'
import { DeclensionPrompt } from './declension/DeclensionPrompt.tsx'
import { DeclensionHelp } from './declension/TablesDialog.tsx'

export interface ExercisePage {
  // URL hash: #/<route>
  route: string
  // The only text on the exercise's card on the home page
  title: string
  // Rendered while the exercise is open; onFinish returns to the home page
  component: ComponentType<{ onFinish: () => void }>
}

export const EXERCISE_PAGES: ExercisePage[] = [
  { route: 'declension', title: declension.title, component: gapFillPage(declension, { Prompt: DeclensionPrompt, Help: DeclensionHelp }) },
  { route: 'sentences', title: declensionSentences.title, component: gapFillPage(declensionSentences) },
];
