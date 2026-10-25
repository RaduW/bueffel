import type { Gap } from '../../core/gapfill/types.ts'

interface Props {
  gap: Gap
  // Options already tried for this gap: marked and disabled
  wrong: string[]
  onChoose: (opt: string) => void
}

// The options for the gap being filled
export function OptionRow({ gap, wrong, onChoose }: Props) {
  return (
    <div className="slot">
      {gap.label && <div className="slot-label">{gap.label}</div>}
      <div className="options">
        {gap.options.map(opt => {
          const isWrong = wrong.includes(opt);
          return (
            <button key={opt} className={isWrong ? 'wrong' : undefined} disabled={isWrong} onClick={() => onChoose(opt)}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
