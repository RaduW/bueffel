import type { SettingDef, SettingValues } from '../../core/gapfill/types.ts'
import { HistoryField, useClearHistoryButton } from './HistoryControls.tsx'
import { Modal } from './Modal.tsx'

interface Props {
  open: boolean
  // The exercise's settings, drawn from their definitions
  defs: SettingDef[]
  values: SettingValues
  // Why no task can be made with these values, shown in the dialog
  problem: string | null
  // Phone layout: history and reset buttons in the action row
  compact: boolean
  onChange: (values: SettingValues) => void
  onClose: () => void
  onClosed: () => void
  // Resolves to the message to show, or null if cancelled
  onClearHistory: () => Promise<string | null>
  onResetStats: () => void
}

// A gapFill exercise's settings: its own options, then Reset statistics and
// Clear history for this exercise
export function SettingsDialog(props: Props) {
  const { open, defs, values, problem, compact, onChange, onClose, onClosed, onClearHistory, onResetStats } = props;
  const clearHistory = useClearHistoryButton(open, compact, onClearHistory);
  return (
    <Modal open={open} onClose={onClose} onClosed={onClosed} labelledBy="gapfill-settings-title">
      <h2 id="gapfill-settings-title">Settings</h2>
      {defs.map(d => (
        <Setting key={d.id} def={d} value={values[d.id]} onChange={v => onChange({ ...values, [d.id]: v })} />
      ))}
      {!compact && (
        <>
          <fieldset>
            <legend>Statistics</legend>
            <p className="hint">The numbers at the top and the results table.</p>
            <div className="button-row"><button className="danger" onClick={onResetStats}>Reset statistics</button></div>
          </fieldset>
          <HistoryField {...clearHistory} />
        </>
      )}

      {problem && <p className="error">{problem}</p>}

      <div className="dialog-actions">
        {compact ? (
          <>
            {clearHistory.button}
            <button className="danger" onClick={onResetStats}>Reset statistics</button>
          </>
        ) : <span></span>}
        <button className="primary" data-autofocus onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}

type Value = SettingValues[string] | undefined

// One setting: checkboxes ('multi'), radio buttons ('choice') or one checkbox
function Setting({ def, value, onChange }: { def: SettingDef; value: Value; onChange: (v: SettingValues[string]) => void }) {
  if (def.type === 'boolean') {
    return (
      <fieldset>
        <label>
          <input type="checkbox" checked={value === true} onChange={e => onChange(e.target.checked)} />
          {def.label}
        </label>
      </fieldset>
    );
  }
  if (def.type === 'choice') {
    return (
      <fieldset>
        <legend>{def.label}</legend>
        <div className="segmented" role="radiogroup" aria-label={def.label}>
          {def.options.map(o => (
            <label key={o.id}>
              <input type="radio" name={def.id} value={o.id} checked={value === o.id} onChange={() => onChange(o.id)} />
              {' '}{o.label}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  const selected = Array.isArray(value) ? value : [];
  const options = def.options;
  // Reports the selection in the order of the options
  function toggle(id: string, checked: boolean) {
    const set = new Set(selected);
    if (checked) set.add(id);
    else set.delete(id);
    onChange(options.map(o => o.id).filter(o => set.has(o)));
  }
  return (
    <fieldset>
      <legend>{def.label}</legend>
      <div className="inline-options">
        {def.options.map(o => (
          <label key={o.id}>
            <input type="checkbox" checked={selected.includes(o.id)} onChange={e => toggle(o.id, e.target.checked)} />
            {o.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
