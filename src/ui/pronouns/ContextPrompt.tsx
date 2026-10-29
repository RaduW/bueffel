import type { ContextPrompt as Prompt } from '../../core/pronouns/context.ts'

// Above the sentence: what to do, and a sentence with the part it's about marked
export function ContextPrompt({ prompt: p }: { prompt: Prompt }) {
  return (
    <div className="prompt">
      <div className="exercise-name">{p.label}</div>
      <p className="context-sentence">
        {p.before}<mark>{p.marked}</mark>{p.note && <span className="gap-note"> ({p.note})</span>}{p.after}
      </p>
    </div>
  );
}
