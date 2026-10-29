// Building blocks of the grammar pages: chips choosing which tables are shown
// (remembered), and tables with the case colours.

import { useState, type ReactNode } from 'react'
import type { Word } from '../../core/exercises.ts'
import { CASES, GENDER_HEADER, GENDERS, type CaseIndex, type Gender } from '../../core/grammar.ts'
import { loadPref, savePref } from '../../core/storage.ts'
import { useMediaQuery } from '../common/useMediaQuery.ts'

export interface Choice { id: string; label: string; title?: string }

// Which of the choices are shown, starting with all; the choice is kept under
// bueffel-<pref> for the next visit
export function useChoice(pref: string, choices: Choice[]) {
  const all = choices.map(c => c.id);
  const [selected, setSelected] = useState<string[]>(() => loadPref(pref, all));
  function toggle(id: string) {
    const next = all.filter(x => x === id ? !selected.includes(x) : selected.includes(x));
    setSelected(next);
    savePref(pref, next);
  }
  return { selected, toggle };
}

export function Chips({ choices, selected, onToggle }: { choices: Choice[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <>
      <div className="chips" role="group" aria-label="Tables to show">
        {choices.map(c => (
          <button key={c.id} className="chip" aria-pressed={selected.includes(c.id)} title={c.title} onClick={() => onToggle(c.id)}>
            {c.label}
          </button>
        ))}
      </div>
      {!selected.length && <p className="hint">Select at least one table above.</p>}
    </>
  );
}

// Words as [stem, ending]; the ending is highlighted (in the cell's gender colour)
export function Words({ words }: { words: Word[] }) {
  return <>{words.map(([stem, ending], i) => <span key={i}>{i > 0 && ' '}{stem}{ending && <b>{ending}</b>}</span>)}</>;
}

// The gender columns, in groups: a phone in portrait is too narrow for four
// columns, so each case gets two sub-rows (Maskulin over Neutrum, Feminin over
// Plural). Landscape has room for four columns
export function useGenderGroups(compact: boolean): Gender[][] {
  const portrait = useMediaQuery('(max-width: 599px)');
  return compact && portrait ? [['m', 'f'], ['n', 'p']] : [GENDERS];
}

// One row per case (in its colour), one column per gender; with more than one
// gender group, each case and the header get one sub-row per group
export function CaseGenderTable({ groups, cell }: { groups: Gender[][]; cell: (g: Gender, ci: CaseIndex) => Word[] }) {
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
                <td key={g} className={'g-' + g}><Words words={cell(g, ci as CaseIndex)} /></td>
              ))}
            </tr>
          )))}
        </tbody>
      </table>
    </div>
  );
}

export interface Column {
  title: string
  // e.g. 'case-dat': the header in that case's colour
  className?: string
}

// A plain table: a header row, then one row per entry with its label first
// (className: e.g. 'case-dat' for a row label in that case's colour)
export function ListTable({ corner, columns, rows }: { corner: string; columns: Column[]; rows: { label: string; className?: string; cells: ReactNode[] }[] }) {
  return (
    <div className="table-scroll">
      <table className="list">
        <thead>
          <tr>
            <th className="corner">{corner}</th>
            {columns.map(c => <th key={c.title} className={c.className}>{c.title}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <th className={r.className ?? 'row-label'}>{r.label}</th>
              {r.cells.map((c, i) => <td key={i}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
