import { useEffect, type RefObject } from 'react'

interface Props {
  mistakes: number
  label: string
  nextRef: RefObject<HTMLButtonElement | null>
  onNext: () => void
}

// Shown once a question is solved, with the Next button focused
export function ResultBanner({ mistakes, label, nextRef, onNext }: Props) {
  useEffect(() => nextRef.current?.focus(), [nextRef]);

  const perfect = mistakes === 0;
  return (
    <div id="result" className={'result ' + (perfect ? 'perfect' : 'mistakes')}>
      <span id="result-text">
        {perfect ? '✓ Correct, no mistakes!' : `Done with ${mistakes} mistake${mistakes === 1 ? '' : 's'}.`}
      </span>
      <button id="next" ref={nextRef} className="primary" onClick={onNext}>{label}</button>
    </div>
  );
}
