import { pct, type Stats } from '../core/stats.ts'
import { HelpIcon, SettingsIcon } from './icons.tsx'

interface Props {
  stats: Stats
  iconSize: number
  onOpenTables: () => void
  onOpenSettings: () => void
}

export function Header({ stats, iconSize, onOpenTables, onOpenSettings }: Props) {
  return (
    <header>
      <div className="title">
        <h1>Büffel</h1>
        <button className="icon-button" title="Declension tables" aria-label="Declension tables" onClick={onOpenTables}>
          <HelpIcon size={iconSize} />
        </button>
        <button className="icon-button" title="Settings" aria-label="Settings" onClick={onOpenSettings}>
          <SettingsIcon size={iconSize} />
        </button>
      </div>
      <div className="stats">
        <div><span id="stat-shown">{stats.shown}</span><small>shown</small></div>
        <div><span id="stat-perfect">{stats.perfect}</span><small>success</small></div>
        <div><span id="stat-errors">{stats.shown - stats.perfect}</span><small>errors</small></div>
        <div><span id="stat-rate">{pct(stats.perfect, stats.shown)}</span><small>accuracy</small></div>
        <div><span id="stat-streak">{stats.streak}</span><small>streak</small></div>
      </div>
    </header>
  );
}
