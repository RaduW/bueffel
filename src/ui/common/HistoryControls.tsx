import { useEffect, useState, type ReactNode } from 'react'

// Clear history in an exercise's settings dialog. Returns the button and the
// message to show next to it; in the compact layout the message replaces the
// button's label for a moment instead.
// onClearHistory resolves to the message, or null if the user cancelled
export function useClearHistoryButton(open: boolean, compact: boolean, onClearHistory: () => Promise<string | null>) {
  const [message, setMessage] = useState('');

  // Start without the previous message each time the dialog opens
  useEffect(() => {
    if (open) setMessage('');
  }, [open]);

  useEffect(() => {
    if (!compact || !message) return;
    const timer = setTimeout(() => setMessage(''), 2000);
    return () => clearTimeout(timer);
  }, [compact, message]);

  async function clear() {
    const m = await onClearHistory();
    if (m) setMessage(m);
  }

  const button = compact && message
    ? <button className="danger" disabled>{message.replace(/\.$/, '')}</button>
    : <button className="danger" onClick={clear}>Clear history</button>;
  return { button, message };
}

// The History section of a settings dialog (wide layout)
export function HistoryField({ button, message }: { button: ReactNode; message: string }) {
  return (
    <fieldset>
      <legend>History</legend>
      <p className="hint">A permanent log of this exercise's results per day, for tracking progress. <em>Reset statistics</em> doesn't touch it.</p>
      <div id="history-row">
        {button}
        <span className="hint" role="status">{message}</span>
      </div>
    </fieldset>
  );
}
