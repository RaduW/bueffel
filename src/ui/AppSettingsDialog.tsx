import { useState } from 'react'
import { applyTheme, loadTheme, saveTheme, type Theme } from '../core/storage.ts'
import { Modal } from './Modal.tsx'

const THEMES: { value: Theme; label: string }[] = [
  { value: 'system', label: 'Device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

// Settings for the whole app, opened from the home page: only the theme for
// now. Statistics and history are reset in each exercise's own settings
export function AppSettingsDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [theme, setTheme] = useState(loadTheme);

  function changeTheme(t: Theme) {
    setTheme(t);
    applyTheme(t);
    saveTheme(t);
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
      <div className="dialog-actions">
        <span></span>
        <button className="primary" data-autofocus onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
