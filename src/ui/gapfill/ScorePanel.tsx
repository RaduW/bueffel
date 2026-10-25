import type { Scoreboard } from '../../core/gapfill/scoreboard.ts'
import { pct } from '../../core/stats.ts'

// Results so far, one row per combination of tags (e.g. case + pattern).
// The columns are the tag names that occur, then the counts
export function ScorePanel({ scores }: { scores: Scoreboard }) {
  const entries = Object.values(scores);
  if (!entries.length) return null;
  const tagNames = [...new Set(entries.flatMap(e => Object.keys(e.tags)))];

  return (
    <section className="scores">
      <h2>Results</h2>
      <div className="scores-scroll">
        <table>
          <thead>
            <tr>
              {tagNames.map(t => <th key={t}>{capitalized(t)}</th>)}
              <th className="num">Done</th><th className="num">Success</th><th className="num">Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={tagNames.map(t => e.tags[t]).join('|')}>
                {tagNames.map(t => <td key={t}>{e.tags[t] ?? '–'}</td>)}
                <td className="num">{e.attempts}</td>
                <td className="num">{e.successes}</td>
                <td className="num">{pct(e.successes, e.attempts)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function capitalized(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
