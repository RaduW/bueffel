import { useState } from 'react'
import { applyTheme, loadAutoAdvance, loadTheme, saveAutoAdvance, saveTheme, type Theme } from '../core/storage.ts'
import { Modal } from './common/Modal.tsx'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// Settings for the whole app, opened from the home page: the theme and
// auto-advance. Statistics and history are reset in each exercise's own settings
export function AppSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [theme, setTheme] = useState(loadTheme);
  const [autoAdvance, setAutoAdvance] = useState(loadAutoAdvance);

  function changeTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    saveTheme(t);
  }

  function changeAutoAdvance(on: boolean) {
    setAutoAdvance(on);
    saveAutoAdvance(on);
  }

  return (
    <Modal open={open} onClose={onClose} labelledBy="app-settings-title">
      <h2 id="app-settings-title">Settings</h2>
      <fieldset>
        <legend>Appearance</legend>
        <div className="segmented" role="radiogroup" aria-label="Theme">
          {THEMES.map(t => (
            <label key={t.value}>
              <input type="radio" name="theme" value={t.value} checked={theme === t.value} onChange={() => changeTheme(t.value)} />
              {' '}{t.label}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset>
        <legend>Practice</legend>
        <label>
          <input type="checkbox" checked={autoAdvance} onChange={e => changeAutoAdvance(e.target.checked)} />
          Auto advance on correct answer
        </label>
      </fieldset>
      <div className="dialog-actions">
        <span></span>
        <button className="primary" data-autofocus onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
