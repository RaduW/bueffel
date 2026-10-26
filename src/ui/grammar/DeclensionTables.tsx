import { useState } from 'react'
import { EXERCISES, type Exercise } from '../../core/exercises.ts'
import { CASES, GENDER_HEADER, GENDERS, type CaseIndex, type Gender } from '../../core/grammar.ts'
import { loadPref, savePref } from '../../core/storage.ts'
import { useMediaQuery } from '../common/useMediaQuery.ts'
import type { GrammarProps } from '../grammar.ts'

// Short names for the chips, by exercise id
const CHIP: Record<string, string> = {
  def: 'der Mann', indef: 'ein Mann', strong: 'alter Mann', weak: 'der alte Mann', mixed: 'ein alter Mann',
};
const ALL = EXERCISES.map(e => e.id);
// The choice on the grammar page, kept for the next visit
const PREF = 'grammar-declension-tables';

// One table per exercise (form), like the ones in "German Declination.md";
// chips choose which are shown. Endings take the colour of their gender; the
// headers use the gender and case colours.
// The choice is remembered for the next visit
export function DeclensionTables({ compact }: GrammarProps) {
  const [selected, setSelected] = useState<string[]>(() => loadPref(PREF, ALL));
  // A phone in portrait is too narrow for four columns: each case gets two sub-rows,
  // so the first column holds Maskulin over Neutrum and the second Feminin over Plural.
  // Landscape has room for four columns
  const portrait = useMediaQuery('(max-width: 599px)');
  const groups: Gender[][] = compact && portrait ? [['m', 'f'], ['n', 'p']] : [GENDERS];

  function toggle(id: string) {
    const next = ALL.filter(x => x === id ? !selected.includes(x) : selected.includes(x));
    setSelected(next);
    savePref(PREF, next);
  }

  return (
    <div className="tables">
      <div className="chips" role="group" aria-label="Tables to show">
        {EXERCISES.map(ex => (
          <button key={ex.id} className="chip" aria-pressed={selected.includes(ex.id)} title={ex.name} onClick={() => toggle(ex.id)}>
            {CHIP[ex.id] ?? ex.name}
          </button>
        ))}
      </div>
      {!selected.length && <p className="hint">Select at least one table above.</p>}
      {EXERCISES.filter(ex => selected.includes(ex.id)).map(ex => (
        <section key={ex.id}>
          <h2>{ex.name}</h2>
          <ExerciseTable exercise={ex} groups={groups} />
        </section>
      ))}
    </div>
  );
}

// With more than one gender group, each case and the header get one sub-row per group
function ExerciseTable({ exercise, groups }: { exercise: Exercise; groups: Gender[][] }) {
  const rows = groups.length;
  return (
    <div className="table-scroll">
      <table className={rows > 1 ? 'split' : undefined}>
        <thead>
          {groups.map((genders, gi) => (
            <tr key={gi}>
              {gi === 0 && <th rowSpan={rows} className="corner">Kasus</th>}
              {genders.map(g => <th key={g} className={'g-' + g}>{GENDER_HEADER[g]}</th>)}
            </tr>
          ))}
        </thead>
        <tbody>
          {CASES.flatMap((c, ci) => groups.map((genders, gi) => (
            <tr key={`${c.id}-${gi}`} className={gi < rows - 1 ? 'sub' : undefined}>
              {gi === 0 && <th rowSpan={rows} className={'case-' + c.id} title={c.name}>{c.name.slice(0, 3)}</th>}
              {genders.map(g => (
                <td key={g} className={'g-' + g}>
                  {exercise.sample(g, ci as CaseIndex).map(([stem, ending], i) => (
                    <span key={i}>{i > 0 && ' '}{stem}{ending && <b>{ending}</b>}</span>
                  ))}
                </td>
              ))}
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}
