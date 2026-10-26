import { EXERCISES } from '../../core/exercises.ts'
import { totals, type Scoreboard } from '../../core/scores.ts'
import { pct } from '../../core/stats.ts'

interface Props {
  scores: Scoreboard
  onSkip: () => void
  onReset: () => void
}

// Per-exercise statistics with Skip and Reset (wide layout only)
export function Breakdown({ scores, onSkip, onReset }: Props) {
  return (
    <section className="breakdown">
      <h2>Per exercise</h2>
      <table>
        <thead><tr><th>Exercise</th><th>Shown</th><th>Success</th><th>Errors</th><th>Accuracy</th></tr></thead>
        <tbody>
          {EXERCISES.map(ex => {
            const e = totals(scores, { exercise: ex.id });
            return (
              <tr key={ex.id}>
                <td>{ex.name}</td>
                <td>{e.attempts}</td>
                <td>{e.successes}</td>
                <td>{e.attempts - e.successes}</td>
                <td>{pct(e.successes, e.attempts)}</td>
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
