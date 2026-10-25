import { explanationsByGap, type GapFillState } from '../../core/gapfill/session.ts'

// The sentence: solved gaps show their answer, the others their hint;
// the gap being filled is highlighted. After a task with mistakes, the
// task's explanations appear in brackets before their gaps. A gap's note
// (e.g. a noun's gender) always follows it, in brackets
export function Sentence({ state }: { state: GapFillState }) {
  const explanations = explanationsByGap(state);
  return (
    <p className="sentence">
      {state.segments.map((seg, i) => {
        if (seg.kind === 'text') return <span key={i}>{seg.text}</span>;
        const solved = seg.index < state.current;
        const current = seg.index === state.current;
        const { answer, note } = state.task.gaps[seg.index];
        const gap = (
          <>
            <span className={'gap' + (solved ? ' solved' : current ? ' current' : '')} aria-current={current || undefined}>
              {solved ? answer : seg.hint}
            </span>
            {note && <span className="gap-note"> ({note})</span>}
          </>
        );
        const notes = explanations.get(seg.index);
        if (!notes) return <span key={i}>{gap}</span>;
        return (
          <span key={i}>
            {notes.map((n, j) => <span key={j} className="explanation">({n})</span>)} {gap}
          </span>
        );
      })}
    </p>
  );
}
