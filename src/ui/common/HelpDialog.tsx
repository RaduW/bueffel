import { Modal } from './Modal.tsx'

interface Props {
  open: boolean
  title: string
  // Paragraphs separated by blank lines
  info?: string
  onClose: () => void
}

export function HelpDialog({ open, title, info, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="help-title">
      <h2 id="help-title">{title}</h2>
      <div className="help-text">
        {(info ?? '').split(/\n\s*\n/).map((p, i) => <p key={i}>{p.trim()}</p>)}
      </div>
      <div className="dialog-actions">
        <span></span>
        <button className="primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
