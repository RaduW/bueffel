import { EXERCISES } from '../../core/exercises.ts'
import type { GrammarProps } from '../grammar.ts'
import { CaseGenderTable, Chips, useChoice, useGenderGroups, type Choice } from './tables.tsx'

// Short names for the chips, by exercise id
const CHIP: Record<string, string> = {
  def: 'der Mann', indef: 'ein Mann', strong: 'alter Mann', weak: 'der alte Mann', mixed: 'ein alter Mann',
};
const CHOICES: Choice[] = EXERCISES.map(e => ({ id: e.id, label: CHIP[e.id] ?? e.name, title: e.name }));

// One table per exercise (form), like the ones in "German Declination.md";
// chips choose which are shown. Endings take the colour of their gender; the
// headers use the gender and case colours
export function DeclensionTables({ compact }: GrammarProps) {
  const { selected, toggle } = useChoice('grammar-declension-tables', CHOICES);
  const groups = useGenderGroups(compact);
  return (
    <div className="tables">
      <Chips choices={CHOICES} selected={selected} onToggle={toggle} />
      {EXERCISES.filter(ex => selected.includes(ex.id)).map(ex => (
        <section key={ex.id}>
          <h2>{ex.name}</h2>
          <CaseGenderTable groups={groups} cell={ex.sample} />
        </section>
      ))}
    </div>
  );
}
