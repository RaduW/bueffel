import { EXERCISES } from '../core/exercises.ts'
import { exerciseCounts, pct, type Stats } from '../core/stats.ts'

interface Props {
  stats: Stats
  onSkip: () => void
  onReset: () => void
}

// Per-exercise statistics with Skip and Reset (desktop page only)
export function Breakdown({ stats, onSkip, onReset }: Props) {
  return (
    <section className="breakdown">
      <h2>Per exercise</h2>
      <table>
        <thead><tr><th>Exercise</th><th>Shown</th><th>Success</th><th>Errors</th><th>Accuracy</th></tr></thead>
        <tbody>
          {EXERCISES.map(ex => {
            const e = exerciseCounts(stats, ex.id);
            return (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{e.shown}</td>
                <td>{e.perfect}</td>
                <td>{e.shown - e.perfect}</td>
                <td>{pct(e.perfect, e.shown)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="actions">
        <button id="skip" onClick={onSkip}>Skip</button>
        <button className="danger" onClick={onReset}>Reset statistics</button>
      </div>
    </section>
  );
}
