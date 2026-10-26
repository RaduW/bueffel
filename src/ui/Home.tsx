import { useState } from 'react'
import { AboutDialog } from './AboutDialog.tsx'
import { AppSettingsDialog } from './AppSettingsDialog.tsx'
import { EXERCISE_PAGES } from './exercises.ts'
import { Header } from './common/Header.tsx'
import { SettingsIcon } from './common/icons.tsx'
import { navigate } from './useHashRoute.ts'

// The start page: one card per exercise, showing only its title
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
