import { tagsKey, type Scoreboard, type ScoreEntry } from '../../core/scores.ts'
import { pct } from '../../core/stats.ts'

interface Props {
  scores: Scoreboard
  // The tags to group by, in column order; default: every tag that occurs
  columns?: string[]
  // How a tag value is shown; default: as is
  label?: (tag: string, value: string) => string
}

// Results so far, one row per combination of the column tags (e.g. case +
// pattern), summing the entries that share them
export function ScorePanel({ scores, columns, label = (_, v) => v }: Props) {
  if (!Object.keys(scores).length) return null;
  const tagNames = columns ?? [...new Set(Object.values(scores).flatMap(e => Object.keys(e.tags)))];
  const rows = new Map<string, ScoreEntry>();
  for (const e of Object.values(scores)) {
    const tags = Object.fromEntries(tagNames.map(t => [t, e.tags[t] ?? '–']));
    const key = tagsKey(tags);
    const r = rows.get(key) ?? { tags, attempts: 0, successes: 0, mistakes: 0 };
    rows.set(key, { ...r, attempts: r.attempts + e.attempts, successes: r.successes + e.successes, mistakes: r.mistakes + e.mistakes });
  }
  // Sorted by the tag columns, left to right, so rows stay in place as results come in
  const entries = [...rows.values()].sort((a, b) => {
    for (const t of tagNames) {
      const c = a.tags[t].localeCompare(b.tags[t]);
      if (c) return c;
    }
    return 0;
  });

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
              <tr key={tagsKey(e.tags)}>
                {tagNames.map(t => <td key={t}>{label(t, e.tags[t])}</td>)}
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
