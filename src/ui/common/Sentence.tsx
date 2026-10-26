import { explanationsByGap, isFilled, isGroupComplete, type GapFillState } from '../../core/gapfill/session.ts'

// The sentence: solved gaps show their answer, in dark grey until their group
// (noun phrase) is complete, then in their tone's colour (e.g. the case);
// given gaps show theirs in the "given" colour, the others their hint;
// the gap being filled is highlighted. After a task with mistakes, the
// task's explanations appear in brackets before their gaps: the text (the
// case) in the gap's tone, the detail (the gender) uncoloured. A gap's note
// (e.g. a noun's gender) always follows it, in brackets
// highlightCurrent: mark the gap being filled (options shown one gap at a time)
export function Sentence({ state, highlightCurrent }: { state: GapFillState; highlightCurrent: boolean }) {
  const explanations = explanationsByGap(state);
  return (
    <p className="sentence">
      {state.segments.map((seg, i) => {
        if (seg.kind === 'text') return <span key={i}>{seg.text}</span>;
        const { answer, note, given, tone } = state.task.gaps[seg.index];
        const filled = isFilled(state, seg.index);
        const current = highlightCurrent && seg.index === state.current;
        const cls = given ? ' prefilled'
          : !filled ? (current ? ' current' : '')
          : !isGroupComplete(state, seg.index) ? ' solved pending'
          : ' solved' + (tone ? ' tone-' + tone : '');
        const gap = (
          <>
            <span className={'gap' + cls} aria-current={current || undefined}>
              {filled ? answer : seg.hint}
            </span>
            {note && <span className="gap-note"> ({note})</span>}
          </>
        );
        const notes = explanations.get(seg.index);
        if (!notes) return <span key={i}>{gap}</span>;
        return (
          <span key={i}>
            {notes.map((n, j) => (
              <span key={j} className="explanation">
                (<span className={tone ? 'tone-' + tone : undefined}>{n.text}</span>
                {n.detail && ' ' + n.detail})
              </span>
            ))} {gap}
          </span>
        );
      })}
    </p>
  );
}
