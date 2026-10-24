import { exerciseById, type Exercise } from '../core/exercises.ts'
import { CASES, GENDER_HEADER, GENDERS, type CaseIndex, type Gender } from '../core/grammar.ts'
import type { Variant } from './App.tsx'
import { Modal } from './Modal.tsx'
import { useMediaQuery } from './useMediaQuery.ts'

interface Props {
  open: boolean
  exerciseIds: string[]
  variant: Variant
  onClose: () => void
}

// One table per selected exercise, like the ones in "German Declination.md".
// Endings take the colour of their gender; the headers use the gender and case colours.
export function TablesDialog({ open, exerciseIds, variant, onClose }: Props) {
  // A phone in portrait is too narrow for four columns: each case gets two sub-rows,
  // so the first column holds Maskulin over Neutrum and the second Feminin over Plural.
  // Landscape has room for the desktop layout
  const portrait = useMediaQuery('(max-width: 599px)');
  const groups: Gender[][] = variant === 'mobile' && portrait ? [['m', 'f'], ['n', 'p']] : [GENDERS];
  const exercises = exerciseIds.map(exerciseById).filter((e): e is Exercise => !!e);

  return (
    <Modal open={open} onClose={onClose} className="tables-dialog" labelledBy="tables-title">
      <h2 id="tables-title">Declension tables</h2>
      <div className="tables">
        {!exercises.length && <p className="hint">Select at least one exercise in the settings to see its table.</p>}
        {exercises.map(ex => (
          <section key={ex.id}>
            <h2>{ex.name}</h2>
            <ExerciseTable exercise={ex} groups={groups} />
          </section>
        ))}
      </div>
      <div className="dialog-actions">
        <span></span>
        <button id="close-tables" className="primary" onClick={onClose}>Done</button>
      </div>
    </Modal>
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
