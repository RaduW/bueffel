import { pct, type Stats } from '../core/stats.ts'

// The tally in the header: questions shown, successes, errors, accuracy, streak
export function StatsBar({ stats }: { stats: Pick<Stats, 'shown' | 'perfect' | 'streak'> }) {
  return (
    <div className="stats">
      <div><span id="stat-shown">{stats.shown}</span><small>shown</small></div>
      <div><span id="stat-perfect">{stats.perfect}</span><small>success</small></div>
      <div><span id="stat-errors">{stats.shown - stats.perfect}</span><small>errors</small></div>
      <div><span id="stat-rate">{pct(stats.perfect, stats.shown)}</span><small>accuracy</small></div>
      <div><span id="stat-streak">{stats.streak}</span><small>streak</small></div>
    </div>
  );
}
