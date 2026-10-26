import type { GrammarPage } from '../grammar.ts'
import { Modal } from './Modal.tsx'

interface Props {
  open: boolean
  title: string
  // Paragraphs separated by blank lines
  info?: string
  // Grammar pages that go with the exercise: links to the pages themselves
  // (user's choice: no copy in the dialog)
  grammar?: GrammarPage[]
  onClose: () => void
}

// An exercise's help: a short explanation, then links to its grammar pages
export function HelpDialog({ open, title, info, grammar = [], onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} labelledBy="help-title">
      <h2 id="help-title">{title}</h2>
      <div className="help-text">
        {(info ?? '').split(/\n\s*\n/).filter(p => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
      </div>
      {grammar.length > 0 && (
        <fieldset>
          <legend>Grammar</legend>
          <ul className="grammar-links">
            {grammar.map(g => <li key={g.route}><a href={'#/' + g.route}>› {g.title}</a></li>)}
          </ul>
        </fieldset>
      )}
      <div className="dialog-actions">
        <span></span>
        <button className="primary" data-autofocus onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
}
