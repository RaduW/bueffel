import { useEffect, useRef, type ReactNode } from 'react'

interface Props {
  open: boolean
  // Escape or a click on the backdrop; the owner decides whether to close
  onClose: () => void
  // The browser closed the dialog by itself (it may ignore a refused Escape)
  onClosed?: () => void
  className?: string
  labelledBy: string
  children: ReactNode
}

// A native <dialog>, shown as a modal while open is true
export function Modal({ open, onClose, onClosed, className, labelledBy, children }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current!;
    if (open && !dialog.open) {
      dialog.showModal();
      // Opening focuses the first button, which can scroll a long dialog; start at the top
      dialog.scrollTop = 0;
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      className={className}
      aria-labelledby={labelledBy}
      onCancel={e => { e.preventDefault(); onClose(); }}
      onClose={() => { if (open) (onClosed ?? onClose)(); }}
      onClick={e => {
        // Clicks on the backdrop target the dialog itself, outside its box
        if (e.target !== ref.current) return;
        const r = ref.current.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!inside) onClose();
      }}
    >
      {children}
    </dialog>
  );
}
