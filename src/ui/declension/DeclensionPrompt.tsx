import type { DeclensionPrompt as Prompt } from '../../core/declension/declension.ts'
import { CASES, GENDER_LABEL } from '../../core/grammar.ts'

// Above the phrase: the case (with its question), the exercise, and the noun
// with its gender (plus the adjective, if the exercise has one)
export function DeclensionPrompt({ prompt: p }: { prompt: Prompt }) {
  const c = CASES.find(x => x.id === p.caseId)!;
  return (
    <div className="prompt">
      <div className={'case-badge case-' + c.id}>
        {c.name}<small>{c.question}</small>
      </div>
      <div className="exercise-name">{p.exercise}</div>
      <div className="given">
        <span className="noun">{p.noun}</span>
        <span className={'gender ' + p.gender}>{GENDER_LABEL[p.gender]}</span>
        <span className="adjective">{p.adjective ? `+ ${p.adjective}` : ''}</span>
      </div>
    </div>
  );
}
