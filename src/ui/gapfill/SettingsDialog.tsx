import { HistoryField, useClearHistoryButton } from '../HistoryControls.tsx'
import { Modal } from '../Modal.tsx'

interface Props {
  open: boolean
  // Phone layout: history and reset buttons in the action row
  compact: boolean
  onClose: () => void
  // Resolves to the message to show, or null if cancelled
  onClearHistory: () => Promise<string | null>
  onResetStats: () => void
}

// A gapFill exercise's settings. No exercise options yet: Reset statistics
// and Clear history, for this exercise
export function SettingsDialog({ open, compact, onClose, onClearHistory, onResetStats }: Props) {
  const clearHistory = useClearHistoryButton(open, compact, onClearHistory);
  return (
    <Modal open={open} onClose={onClose} labelledBy="gapfill-settings-title">
      <h2 id="gapfill-settings-title">Settings</h2>
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
