import type { ReactNode } from 'react'
import type { GrammarProps } from '../grammar.ts'

// The cheat sheet from docs/German Conjunctions Exercises.md (sections 1 and 2):
// the three word orders after a connector, the extra rules, and the connectors
// of each kind. In the examples the connector is bold and the verb highlighted

// Connector (bold) and verb (highlighted) in an example
const C = ({ children }: { children: ReactNode }) => <em>{children}</em>;
const V = ({ children }: { children: ReactNode }) => <b>{children}</b>;

const ORDERS: { kind: string; german: string; order: string; example: ReactNode }[] = [
  {
    kind: 'Coordinating', german: 'Konjunktionen', order: 'Straight: connector + subject + verb …',
    example: <>Ich trinke Wasser, <C>aber</C> er <V>trinkt</V> ein Bier.</>,
  },
  {
    kind: 'Adverbial', german: 'Konjunktionaladverbien', order: 'Inverted: connector + verb + subject …',
    example: <>Ich trinke Wasser, <C>danach</C> <V>trinke</V> ich ein Bier.</>,
  },
  {
    kind: 'Subordinating', german: 'Subjunktionen', order: 'Verb last: connector + subject … verb',
    example: <>Ich trinke Wasser, <C>weil</C> ich Durst <V>habe</V>.</>,
  },
];

const CONNECTORS: { kind: string; order: string; words: [string, string][] }[] = [
  {
    kind: 'Coordinating', order: 'straight',
    words: [['und', 'and'], ['aber', 'but'], ['oder', 'or'], ['denn', 'because'], ['sondern', 'but rather']],
  },
  {
    kind: 'Adverbial', order: 'inverted',
    words: [
      ['allerdings', 'however'], ['also', 'so, therefore'], ['außerdem', 'besides, moreover'],
      ['dagegen', 'in contrast'], ['danach', 'after that'], ['dann', 'then'], ['deshalb', 'therefore'],
      ['deswegen', "that's why"], ['genauso', 'just as'], ['inzwischen', 'meanwhile'], ['jedoch', 'however'],
      ['schließlich', 'finally'], ['sonst', 'otherwise'], ['später', 'later'], ['trotzdem', 'nevertheless'],
      ['vorher', 'beforehand'], ['weder … noch', 'neither … nor'], ['zwar (… aber)', 'admittedly (… but)'],
    ],
  },
  {
    kind: 'Subordinating', order: 'verb last',
    words: [
      ['als', 'when (single past event)'], ['bevor', 'before'], ['bis', 'until'], ['da', 'since, as'],
      ['damit', 'so that'], ['dass', 'that'], ['falls', 'in case'], ['indem', 'by (doing)'],
      ['nachdem', 'after'], ['ob', 'whether'], ['obwohl', 'although'], ['seitdem', 'since (time)'],
      ['sodass', 'so that (result)'], ['solange', 'as long as'], ['sooft', 'whenever'],
      ['während', 'while'], ['weil', 'because'], ['wenn', 'if, when(ever)'],
    ],
  },
];

export function ConjunctionsSheet({ compact }: GrammarProps) {
  return (
    <div className="tables conjunctions">
      <h2>Word order after the connector</h2>
      <div className="table-scroll">
        <table>
          <tbody>
            {ORDERS.map(o => compact ? (
              // Phone: kind and order above the example
              <tr key={o.kind}>
                <td><strong>{o.kind}</strong> <span className="muted">({o.german})</span><br />{o.order}<br /><span className="example">{o.example}</span></td>
              </tr>
            ) : (
              <tr key={o.kind}>
                <td><strong>{o.kind}</strong><br /><span className="muted">{o.german}</span></td>
                <td>{o.order}<br /><span className="example">{o.example}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Rules</h2>
      <ul className="rules">
        <li>Coordinating connectors take no position (position 0). Adverbial ones take position 1, so the verb, still in position 2, comes before the subject.</li>
        <li>A subordinate clause placed first counts as position 1: the main clause starts with the verb. <span className="example"><C>Weil</C> ich Durst <V>habe</V>, <V>trinke</V> ich Wasser.</span></li>
        <li>An adverbial connector can also move into the clause, with normal order. <span className="example">Ich <V>bleibe</V> <C>deshalb</C> zu Hause.</span></li>
        <li>A comma always comes before aber, denn, sondern and before a subordinate clause; before und / oder joining two main clauses it is optional.</li>
      </ul>

      {CONNECTORS.map(group => (
        <section key={group.kind}>
          <h2>{group.kind} ({group.order})</h2>
          <div className="table-scroll">
            <table>
              <tbody>
                {group.words.map(([de, en]) => (
                  <tr key={de}>
                    <td><strong>{de}</strong></td>
                    <td className="muted">{en}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}
