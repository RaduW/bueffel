import type { ReactNode } from 'react'
import { CASES, GENDER_LABEL } from '../core/grammar.ts'
import type { Question, SlotState } from '../core/question.ts'

interface Props {
  question: Question
  onChoose: (slotIndex: number, opt: string) => void
  // Shown at the bottom of the card (the result, in the wide layout)
  children?: ReactNode
}

export function QuestionCard({ question: q, onChoose, children }: Props) {
  const c = CASES[q.ci];
  return (
    <section id="card" className="card">
      <div className="prompt">
        <div className={'case-badge case-' + c.id}>
          {c.name}<small>{c.question}</small>
        </div>
        <div className="exercise-name">{q.exercise.name}</div>
        <div className="given">
          <span className="noun">{q.noun.w}</span>
          <span className={'gender ' + q.noun.g}>{GENDER_LABEL[q.noun.g]}</span>
          <span className="adjective">{q.adj ? `+ ${q.adj}` : ''}</span>
        </div>
      </div>

      <div className="phrase">
        {q.slots.map((slot, i) =>
          <span key={i} className={slot.solved ? 'filled' : 'blank'}>{slot.solved ? slot.answer : '____'}</span>)}
      </div>

      <div>
        {q.slots.map((slot, i) =>
          <SlotOptions key={i} slot={slot} onChoose={opt => onChoose(i, opt)} />)}
      </div>

      {children}
    </section>
  );
}

// One blank of the phrase: its label and the options to choose from.
// A wrong option stays marked and disabled; once solved, all are disabled
function SlotOptions({ slot, onChoose }: { slot: SlotState; onChoose: (opt: string) => void }) {
  return (
    <div className="slot">
      <div className="slot-label">{slot.label}</div>
      <div className={slot.solved ? 'options done' : 'options'}>
        {slot.options.map(opt => {
          const wrong = slot.wrong.includes(opt);
          const correct = slot.solved && opt === slot.answer;
          return (
            <button
              key={opt}
              className={correct ? 'correct' : wrong ? 'wrong' : undefined}
              disabled={slot.solved || wrong}
              onClick={() => onChoose(opt)}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
