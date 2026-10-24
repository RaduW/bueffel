// Shows the home page, or the exercise named in the URL's hash
// (#/declension). An unknown hash shows the home page.

import { EXERCISE_PAGES } from './exercises.ts'
import { Home } from './Home.tsx'
import { navigate, useHashRoute } from './useHashRoute.ts'

export function App() {
  const route = useHashRoute();
  const page = EXERCISE_PAGES.find(p => p.route === route);
  if (!page) return <Home />;
  const Exercise = page.component;
  return <Exercise onFinish={() => navigate('')} />;
}
