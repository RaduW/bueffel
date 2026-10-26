import { pct, type Tally } from '../../core/stats.ts'

// The tally in the header: puzzles shown (score groups: a declension question,
// a noun phrase in a sentence), successes, errors, accuracy, streak
export function StatsBar({ stats }: { stats: Tally }) {
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
