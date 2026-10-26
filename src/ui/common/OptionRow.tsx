import type { Gap } from '../../core/gapfill/types.ts'

interface Props {
  gap: Gap
  // Options already tried for this gap: marked and disabled
  wrong: string[]
  // Solved: the answer is marked and every option disabled (with all options
  // shown at once, solved rows stay)
  solved: boolean
  onChoose: (opt: string) => void
}

// The options of one gap, with its label
export function OptionRow({ gap, wrong, solved, onChoose }: Props) {
  return (
    <div className="slot">
      {gap.label && <div className="slot-label">{gap.label}</div>}
      <div className={solved ? 'options done' : 'options'}>
        {gap.options.map(opt => {
          const isWrong = wrong.includes(opt);
          const correct = solved && opt === gap.answer;
          return (
            <button
              key={opt}
              className={correct ? 'correct' : isWrong ? 'wrong' : undefined}
              disabled={solved || isWrong}
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
