import { EXERCISES } from '../../core/exercises.ts'
import { CASES, GENDER_LABEL, GENDERS } from '../../core/grammar.ts'
import { NOUN_POOLS } from '../../core/nouns.ts'
import type { Settings } from '../../core/settings.ts'
import { HistoryField, useClearHistoryButton } from '../HistoryControls.tsx'
import { Modal } from '../Modal.tsx'

interface Props {
  open: boolean
  settings: Settings
  // Why the settings allow no question, shown in the dialog
  problem: string | null
  // Phone layout: history and reset buttons in the action row
  compact: boolean
  onChange: (s: Settings) => void
  onClose: () => void
  onClosed: () => void
  // Resolves to the message to show, or null if cancelled
  onClearHistory: () => Promise<string | null>
  onResetStats: () => void
}

type Item = { id: string; label: string }

const EXERCISE_ITEMS: Item[] = EXERCISES.map(e => ({ id: e.id, label: e.name }));
const POOL_ITEMS: Item[] = Object.entries(NOUN_POOLS).map(([id, p]) => ({ id, label: p.label }));
const GENDER_ITEMS: Item[] = GENDERS.map(g => ({ id: g, label: GENDER_LABEL[g] }));
const CASE_ITEMS: Item[] = CASES.map(c => ({ id: c.id, label: c.name }));

export function SettingsDialog(props: Props) {
  const { open, settings, problem, compact, onChange, onClose, onClosed, onClearHistory, onResetStats } = props;
  const clearHistory = useClearHistoryButton(open, compact, onClearHistory);

  return (
    <Modal open={open} onClose={onClose} onClosed={onClosed} labelledBy="settings-title">
      <h2 id="settings-title">Settings</h2>
      <Checkboxes legend="Exercises" items={EXERCISE_ITEMS} selected={settings.exercises}
        onChange={exercises => onChange({ ...settings, exercises })} />
      <Checkboxes legend="Nouns" items={POOL_ITEMS} selected={settings.pools}
        onChange={pools => onChange({ ...settings, pools })} />
      <Checkboxes legend="Gender / number" id="gender-list" items={GENDER_ITEMS} selected={settings.genders}
        onChange={genders => onChange({ ...settings, genders })} />
      <Checkboxes legend="Cases" id="case-list" items={CASE_ITEMS} selected={settings.cases}
        onChange={cases => onChange({ ...settings, cases })} />
      {!compact && <HistoryField {...clearHistory} />}

      {problem && <p className="error">{problem}</p>}

      <div className="dialog-actions">
        {compact ? (
          <>
            {clearHistory.button}
            <button className="danger" onClick={onResetStats}>Reset statistics</button>
          </>
        ) : <span></span>}
        <button id="close-settings" className="primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

// A group of checkboxes; reports the selection in the order of the items
function Checkboxes({ legend, id, items, selected, onChange }: {
  legend: string
  id?: string
  items: Item[]
  selected: string[]
  onChange: (selected: string[]) => void
}) {
  function toggle(itemId: string, checked: boolean) {
    const set = new Set(selected);
    if (checked) set.add(itemId);
    else set.delete(itemId);
    onChange(items.map(i => i.id).filter(i => set.has(i)));
  }

  return (
    <fieldset>
      <legend>{legend}</legend>
      <div id={id}>
        {items.map(item => (
          <label key={item.id}>
            <input type="checkbox" checked={selected.includes(item.id)} onChange={e => toggle(item.id, e.target.checked)} />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
