// The exercises offered on the home page. Add new ones here.

import type { ComponentType } from 'react'
import { Declension } from './declension/Declension.tsx'

export interface ExercisePage {
  // URL hash: #/<route>
  route: string
  // The only text on the exercise's card on the home page
  title: string
  // Rendered while the exercise is open; onFinish returns to the home page
  component: ComponentType<{ onFinish: () => void }>
}

export const EXERCISE_PAGES: ExercisePage[] = [
  { route: 'declension', title: 'Declination practice', component: Declension },
];
