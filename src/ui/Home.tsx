import { EXERCISE_PAGES } from './exercises.ts'
import { Header } from './Header.tsx'
import { navigate } from './useHashRoute.ts'

// The start page: one card per exercise, showing only its title
export function Home() {
  return (
    <div className="app">
      <Header
        title={
          <>
            <img className="logo" src={import.meta.env.BASE_URL + 'favicon.svg'} alt="" />
            Büffel
          </>
        }
        iconSize={22}
      />
      <main>
        <p className="tagline">German exercises. Pick one to start.</p>
        <ul className="exercise-list">
          {EXERCISE_PAGES.map(ex => (
            <li key={ex.route}>
              <a className="exercise-card" href={'#/' + ex.route} onClick={e => { e.preventDefault(); navigate(ex.route); }}>
                {ex.title}
              </a>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
