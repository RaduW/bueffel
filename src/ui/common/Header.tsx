import type { ReactNode } from 'react'
import { BackIcon } from './icons.tsx'

interface Props {
  title: ReactNode
  iconSize: number
  // Shows a back button before the title
  onBack?: () => void
  backLabel?: string
  // Icon buttons after the title
  actions?: ReactNode
  // Below the title row in the compact layout, beside it in the wide one
  children?: ReactNode
}

export function Header({ title, iconSize, onBack, backLabel = 'Back', actions, children }: Props) {
  return (
    <header>
      <div className="title">
        {onBack && (
          <button className="icon-button back" title={backLabel} aria-label={backLabel} onClick={onBack}>
            <BackIcon size={iconSize} />
          </button>
        )}
        <h1>{title}</h1>
        {actions}
      </div>
      {children}
    </header>
  );
}
