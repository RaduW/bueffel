import { Modal } from './common/Modal.tsx'

interface Props {
  open: boolean
  onClose: () => void
}

export function AboutDialog({ open, onClose }: Props) {
  return (
    <Modal open={open} onClose={onClose} className="about-dialog" labelledBy="about-title">
      <div className="about-head">
        <img className="about-logo" src={import.meta.env.BASE_URL + 'favicon.svg'} alt="" />
        <div>
          <h2 id="about-title">Büffel</h2>
          <p className="hint"><em>büffeln</em> (German, informal): to cram, to study hard.</p>
        </div>
      </div>
      <div className="help-text">
        <p>
          Büffel is a small app for practising German grammar, one exercise at a time.
        </p>
        <p>
          <strong>Your data stays with you.</strong> Settings and results are saved only in this
          browser on this device. Nothing is sent anywhere, and there is no account or tracking.
        </p>
        <p>Works offline once installed.</p>
        <p className="hint">
          Version {__APP_VERSION__} · <a href="https://github.com/RaduW/bueffel" target="_blank" rel="noopener noreferrer">Source on GitHub</a>
          <br />
          Made by RaduW.
        </p>
      </div>
      <div className="dialog-actions">
        <span></span>
        <button className="primary" data-autofocus onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}
