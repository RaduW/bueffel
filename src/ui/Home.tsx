import { useState, type ReactNode } from 'react'
import { AboutDialog } from './AboutDialog.tsx'
import { AppSettingsDialog } from './AppSettingsDialog.tsx'
import { EXERCISE_PAGES } from './exercises.ts'
import { Header } from './common/Header.tsx'
import { BookIcon, SettingsIcon } from './common/icons.tsx'
import { GRAMMAR_PAGES } from './grammar.ts'
import { navigate } from './useHashRoute.ts'

// The start page: Practice (one card per exercise) and Grammar (one card per
// grammar page); a card shows only its title
export function Home() {
  const [aboutOpen, setAboutOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  return (
    <div className="app">
      <Header
        title={
          // The icon and the name open the About dialog
          <button className="title-button" title="About Büffel" onClick={() => setAboutOpen(true)}>
            <img className="logo" src={import.meta.env.BASE_URL + 'favicon.svg'} alt="" />
            Büffel
          </button>
        }
        iconSize={22}
        actions={
          // Settings for the whole app; each exercise has its own as well
          <button className="icon-button" title="Settings" aria-label="Settings" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon size={22} />
          </button>
        }
      />
      <AboutDialog open={aboutOpen} onClose={() => setAboutOpen(false)} />
      <AppSettingsDialog open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <main>
        <p className="tagline">German exercises and grammar.</p>
        <h2 className="home-section">Practice</h2>
        <ul className="exercise-list">
          {EXERCISE_PAGES.map(ex => <Card key={ex.route} route={ex.route}>{ex.title}</Card>)}
        </ul>
        <h2 className="home-section">Grammar</h2>
        <ul className="exercise-list">
          {GRAMMAR_PAGES.map(g => (
            <Card key={g.route} route={g.route}><BookIcon size={22} />{g.title}</Card>
          ))}
        </ul>
      </main>
    </div>
  );
}

function Card({ route, children }: { route: string; children: ReactNode }) {
  return (
    <li>
      <a className="exercise-card" href={'#/' + route} onClick={e => { e.preventDefault(); navigate(route); }}>
        {children}
      </a>
    </li>
  );
}
