// Shows the home page, or the exercise or grammar page named in the URL's hash
// (#/declension, #/grammar/declension-tables). An unknown hash shows the home page.

import { EXERCISE_PAGES } from './exercises.ts'
import { GRAMMAR_PAGES } from './grammar.ts'
import { GrammarPage } from './GrammarPage.tsx'
import { Home } from './Home.tsx'
import { goBack, navigate, useHashRoute } from './useHashRoute.ts'

export function App() {
  const route = useHashRoute();
  const grammar = GRAMMAR_PAGES.find(p => p.route === route);
  // Back to where it was opened from: the home page, or an exercise's help
  if (grammar) return <GrammarPage page={grammar} onBack={goBack} />;
  const page = EXERCISE_PAGES.find(p => p.route === route);
  if (!page) return <Home />;
  const Exercise = page.component;
  return <Exercise onFinish={() => navigate('')} />;
}
