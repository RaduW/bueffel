import { CASES } from '../../core/grammar.ts'
import { PERSONS, possessiveCell, QUESTION, REFLEXIVE, relativeCell } from '../../core/pronouns/forms.ts'
import type { GrammarProps } from '../grammar.ts'
import { CaseGenderTable, Chips, ListTable, useChoice, useGenderGroups, type Choice, type Column } from './tables.tsx'

const CHOICES: Choice[] = [
  { id: 'personal', label: 'ich, mich, mir', title: 'Personal pronouns' },
  { id: 'reflexive', label: 'mich, sich', title: 'Reflexive pronouns' },
  { id: 'possessive', label: 'mein, dein', title: 'Possessive articles' },
  { id: 'relative', label: 'der, dessen', title: 'Relative pronouns' },
  { id: 'question', label: 'wer, wen', title: 'Question words' },
];

const caseColumn = (ci: number): Column => ({ title: CASES[ci].name.slice(0, 3), className: 'case-' + CASES[ci].id });

// The pronoun tables; chips choose which are shown (remembered)
export function PronounTables({ compact }: GrammarProps) {
  const { selected, toggle } = useChoice('grammar-pronoun-tables', CHOICES);
  const groups = useGenderGroups(compact);
  const shown = (id: string) => selected.includes(id);
  return (
    <div className="tables">
      <Chips choices={CHOICES} selected={selected} onToggle={toggle} />

      {shown('personal') && (
        <section>
          <h2>Personal pronouns</h2>
          <ListTable
            corner="Person"
            columns={[0, 1, 2, 3].map(caseColumn)}
            rows={PERSONS.map(p => ({ label: p.label, cells: p.personal }))}
          />
          <p className="hint">The Genitiv forms are rare (statt meiner, wegen seiner); it's usually replaced by a possessive: wegen ihm, sein Buch.</p>
        </section>
      )}

      {shown('reflexive') && (
        <section>
          <h2>Reflexive pronouns</h2>
          <ListTable
            corner="Subject"
            columns={[caseColumn(1), caseColumn(2)]}
            rows={REFLEXIVE.map(r => ({ label: r.subject, cells: [r.akk, r.dat] }))}
          />
          <p className="hint">Ich wasche mich (Akk). Ich wasche mir die Hände (Dat: when there is another object). Only the 3rd person and Sie have their own form: sich.</p>
        </section>
      )}

      {shown('possessive') && (
        <section>
          <h2>Possessive articles</h2>
          <ListTable
            corner="Person"
            columns={[{ title: 'Pronoun' }, { title: 'Possessive' }]}
            rows={PERSONS.map(p => ({ label: p.label, cells: [p.personal[0], p.possessive] }))}
          />
          <p className="hint">They all take the endings of ein (kein in the plural), shown here for mein. euer drops its second e before an ending: eure, euren, eurem …</p>
          <CaseGenderTable groups={groups} cell={(g, ci) => [possessiveCell('mein', g, ci)]} />
        </section>
      )}

      {shown('relative') && (
        <section>
          <h2>Relative pronouns</h2>
          <CaseGenderTable groups={groups} cell={(g, ci) => [relativeCell(g, ci)]} />
          <p className="hint">Like der, die, das, except Dativ Plural denen and the Genitiv dessen, deren. Der Mann, dem ich helfe; die Leute, denen ich helfe; die Frau, deren Auto rot ist.</p>
        </section>
      )}

      {shown('question') && (
        <section>
          <h2>Question words</h2>
          <ListTable
            corner="Kasus"
            columns={[{ title: 'People (wer)' }, { title: 'Things (was)' }]}
            rows={QUESTION.map((q, ci) => ({ label: CASES[ci].name.slice(0, 3), className: 'case-' + CASES[ci].id, cells: [<>{q.wer} <span className="en">{q.werEn}</span></>, <>{q.was} <span className="en">{q.wasEn}</span></>] }))}
          />
        </section>
      )}
    </div>
  );
}
