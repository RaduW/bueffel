// gapFill exercise: join two clauses with a connector, in the right word order.
// Both gaps offer the same clauses, each in its three orders (straight,
// inverted, verb last): the learner picks which clause goes where, and how.
// Sentences from docs/German Conjunctions Exercises.md.

import { multiValue } from '../gapfill/settings.ts'
import { capitalize } from '../gapfill/template.ts'
import type { GapFillExercise, GapFillTask, SettingDef, SettingValues } from '../gapfill/types.ts'
import { pick, shuffle } from '../random.ts'

// The connector's kind decides the order of its clause:
// coordinating: straight (subject, verb …), adverbial: inverted (verb, subject …),
// subordinating: verb last (subject … verb)
type Kind = 'coordinating' | 'adverbial' | 'subordinating'
type Order = 'straight' | 'inverted' | 'last'

const KIND_LABEL: Record<Kind, string> = {
  coordinating: 'Coordinating (straight)',
  adverbial: 'Adverbial (inverted)',
  subordinating: 'Subordinating (verb last)',
};
const ORDER_LABEL: Record<Order, string> = { straight: 'straight', inverted: 'inverted', last: 'verb last' };
const KIND_ORDER: Record<Kind, Order> = { coordinating: 'straight', adverbial: 'inverted', subordinating: 'last' };

// [subject, conjugated verb, rest, verb-last ending if not "rest verb" (separable verbs)].
// Written as in mid-sentence: "ich", not "Ich"
type Clause = [string, string, string?, string?]

interface Pair {
  connector: string
  kind: Kind
  // The sentence is "main, connector sub."
  main: Clause
  sub: Clause
  // A subordinate clause that may also come first: "Connector sub, main (inverted)."
  front?: boolean
}

const C = 'coordinating', A = 'adverbial', S = 'subordinating';

const PAIRS: Pair[] = [
  { connector: 'sondern', kind: C, main: ['ich', 'trinke', 'keinen Kaffee'], sub: ['ich', 'trinke', 'Tee'] },
  { connector: 'sondern', kind: C, main: ['er', 'fährt', 'nicht mit dem Auto'], sub: ['er', 'nimmt', 'den Bus'] },
  { connector: 'sondern', kind: C, main: ['wir', 'bleiben', 'nicht zu Hause'], sub: ['wir', 'gehen', 'ins Kino'] },
  { connector: 'aber', kind: C, main: ['es', 'regnet'], sub: ['ich', 'gehe', 'spazieren'] },
  { connector: 'aber', kind: C, main: ['es', 'ist', 'kalt'], sub: ['er', 'trägt', 'keine Jacke'] },
  { connector: 'denn', kind: C, main: ['ich', 'bleibe', 'zu Hause'], sub: ['es', 'regnet'] },
  { connector: 'denn', kind: C, main: ['er', 'kommt', 'nicht mit', 'nicht mitkommt'], sub: ['er', 'hat', 'keine Zeit'] },
  { connector: 'denn', kind: C, main: ['sie', 'lernt', 'Deutsch'], sub: ['sie', 'will', 'in Wien arbeiten'] },
  { connector: 'und', kind: C, main: ['ich', 'habe', 'Hunger'], sub: ['ich', 'esse', 'ein Brot'] },
  { connector: 'und', kind: C, main: ['ich', 'mache', 'die Hausaufgaben'], sub: ['ich', 'sehe', 'fern', 'fernsehe'] },
  { connector: 'oder', kind: C, main: ['du', 'musst', 'dich beeilen'], sub: ['du', 'verpasst', 'den Zug'] },
  { connector: 'oder', kind: C, main: ['wir', 'fahren', 'mit dem Zug'], sub: ['wir', 'nehmen', 'das Auto'] },

  { connector: 'deshalb', kind: A, main: ['ich', 'bin', 'müde'], sub: ['ich', 'gehe', 'ins Bett'] },
  { connector: 'deshalb', kind: A, main: ['es', 'regnet'], sub: ['ich', 'bleibe', 'zu Hause'] },
  { connector: 'deswegen', kind: A, main: ['ich', 'habe', 'keine Zeit'], sub: ['ich', 'komme', 'nicht mit', 'nicht mitkomme'] },
  { connector: 'trotzdem', kind: A, main: ['ich', 'bin', 'müde'], sub: ['ich', 'arbeite', 'weiter', 'weiterarbeite'] },
  { connector: 'trotzdem', kind: A, main: ['es', 'ist', 'kalt'], sub: ['er', 'trägt', 'keine Jacke'] },
  { connector: 'dann', kind: A, main: ['wir', 'essen', 'zu Abend'], sub: ['wir', 'gehen', 'ins Kino'] },
  { connector: 'danach', kind: A, main: ['ich', 'mache', 'die Hausaufgaben'], sub: ['ich', 'sehe', 'fern', 'fernsehe'] },
  { connector: 'sonst', kind: A, main: ['du', 'musst', 'lernen'], sub: ['du', 'bestehst', 'die Prüfung nicht'] },
  { connector: 'sonst', kind: A, main: ['du', 'musst', 'dich beeilen'], sub: ['du', 'verpasst', 'den Zug'] },
  { connector: 'außerdem', kind: A, main: ['die Wohnung', 'ist', 'hell'], sub: ['sie', 'hat', 'einen Balkon'] },
  { connector: 'inzwischen', kind: A, main: ['ich', 'koche'], sub: ['du', 'deckst', 'den Tisch'] },
  { connector: 'schließlich', kind: A, main: ['wir', 'haben', 'lange gesucht'], sub: ['wir', 'haben', 'das Hotel gefunden'] },
  { connector: 'allerdings', kind: A, main: ['das Auto', 'ist', 'teuer'], sub: ['es', 'ist', 'sehr sparsam'] },
  { connector: 'also', kind: A, main: ['er', 'hat', 'keinen Führerschein'], sub: ['er', 'kann', 'nicht fahren'] },

  { connector: 'weil', kind: S, main: ['ich', 'gehe', 'ins Bett'], sub: ['ich', 'bin', 'müde'], front: true },
  { connector: 'weil', kind: S, main: ['ich', 'bleibe', 'zu Hause'], sub: ['es', 'regnet'], front: true },
  { connector: 'da', kind: S, main: ['ich', 'bleibe', 'zu Hause'], sub: ['ich', 'bin', 'krank'], front: true },
  { connector: 'obwohl', kind: S, main: ['ich', 'arbeite', 'weiter', 'weiterarbeite'], sub: ['ich', 'bin', 'müde'], front: true },
  { connector: 'obwohl', kind: S, main: ['er', 'trägt', 'keine Jacke'], sub: ['es', 'ist', 'kalt'], front: true },
  { connector: 'wenn', kind: S, main: ['wir', 'fahren', 'an den See'], sub: ['das Wetter', 'ist', 'schön'], front: true },
  { connector: 'wenn', kind: S, main: ['ich', 'sehe', 'fern', 'fernsehe'], sub: ['ich', 'habe', 'die Hausaufgaben gemacht'], front: true },
  { connector: 'falls', kind: S, main: ['wir', 'bleiben', 'zu Hause'], sub: ['es', 'regnet', 'morgen'], front: true },
  { connector: 'als', kind: S, main: ['ich', 'habe', 'das Museum besucht'], sub: ['ich', 'war', 'in Berlin'], front: true },
  { connector: 'bevor', kind: S, main: ['ich', 'mache', 'die Hausaufgaben'], sub: ['ich', 'sehe', 'fern', 'fernsehe'], front: true },
  { connector: 'nachdem', kind: S, main: ['ich', 'putze', 'die Zähne'], sub: ['ich', 'habe', 'gegessen'], front: true },
  { connector: 'während', kind: S, main: ['er', 'hört', 'Musik'], sub: ['er', 'kocht'], front: true },
  { connector: 'dass', kind: S, main: ['ich', 'glaube'], sub: ['der Bus', 'kommt', 'gleich'] },
  { connector: 'dass', kind: S, main: ['ich', 'weiß'], sub: ['er', 'kommt', 'morgen'] },
  { connector: 'ob', kind: S, main: ['ich', 'weiß', 'nicht'], sub: ['er', 'kommt', 'morgen'] },
  { connector: 'damit', kind: S, main: ['sie', 'lernt', 'Deutsch'], sub: ['sie', 'kann', 'in Wien arbeiten'] },
  { connector: 'bis', kind: S, main: ['ich', 'warte', 'hier'], sub: ['du', 'kommst', 'zurück', 'zurückkommst'] },
  { connector: 'sodass', kind: S, main: ['es', 'war', 'sehr laut'], sub: ['ich', 'konnte', 'nicht schlafen'] },
];

function inOrder([subject, verb, rest, last]: Clause, order: Order): string {
  const words = order === 'straight' ? [subject, verb, rest]
    : order === 'inverted' ? [verb, subject, rest]
    : [subject, last ?? [rest, verb].filter(Boolean).join(' ')];
  return words.filter(Boolean).join(' ');
}

const ORDERS: Order[] = ['straight', 'inverted', 'last'];

const SETTINGS: SettingDef[] = [
  {
    id: 'kinds', label: 'Connectors', type: 'multi',
    options: (Object.keys(KIND_LABEL) as Kind[]).map(k => ({ id: k, label: KIND_LABEL[k] })),
    default: ['coordinating', 'adverbial', 'subordinating'],
  },
  { id: 'front', label: 'Sometimes put the subordinate clause first (Weil …, …)', type: 'boolean', default: true },
];

function createTask(kinds: string[], front: boolean): GapFillTask {
  const pair = pick(PAIRS.filter(p => kinds.includes(p.kind)));
  const fronted = front && !!pair.front && Math.random() < 0.5;
  // The two gaps in sentence order, each with its clause and order
  const parts: { clause: Clause; order: Order }[] = fronted
    ? [{ clause: pair.sub, order: 'last' }, { clause: pair.main, order: 'inverted' }]
    : [{ clause: pair.main, order: 'straight' }, { clause: pair.sub, order: KIND_ORDER[pair.kind] }];
  const template = fronted ? `${capitalize(pair.connector)} {____}, {____}.`
    // No comma before und / oder joining two main clauses
    : `{____}${['und', 'oder'].includes(pair.connector) ? '' : ','} ${pair.connector} {____}.`;

  // The same options for both gaps: each clause in its three orders, grouped
  // by clause (both groups shuffled); a clause whose orders coincide ("es
  // regnet") has fewer
  const variants = shuffle([pair.main, pair.sub]).flatMap(c => shuffle(ORDERS).map(o => inOrder(c, o)));
  const gaps = parts.map(({ clause, order }, i) => {
    // The sentence's first word is capitalized
    const write = (s: string) => i === 0 && !fronted ? capitalize(s) : s;
    return {
      label: i === 0 ? 'First clause' : 'Second clause',
      options: [...new Set(variants.map(write))],
      answer: write(inOrder(clause, order)),
    };
  });
  return {
    key: `${pair.connector}|${pair.main.join(' ')}|${fronted}`,
    template,
    gaps,
    scores: [{ tags: { kind: pair.kind, connector: pair.connector }, gaps: [0, 1] }],
    explanations: parts.map(({ order }, gap) => ({ gap, text: ORDER_LABEL[order] })),
  };
}

export const wordOrder: GapFillExercise = {
  id: 'word-order',
  title: 'Conjunctions: word order',
  info: `Build the sentence around the connector: choose the clause that goes first, then the second one, each in the right word order. A wrong choice turns red; try again.

After und, aber, oder, denn, sondern: straight order (ich trinke). After deshalb, trotzdem …: inverted (trinke ich). After weil, dass, obwohl …: verb last (ich … trinke). A subordinate clause placed first is followed by the verb (Weil ich müde bin, gehe ich …).`,
  options: 'current',
  longOptions: true,
  scoreColumns: ['kind', 'connector'],
  scoreLabel: (tag, value) => tag === 'kind' ? KIND_LABEL[value as Kind]?.split(' ')[0] ?? value : value,
  settings: SETTINGS,
  next(values: SettingValues, previous) {
    const kinds = multiValue(SETTINGS, values, 'kinds');
    const front = values.front !== false;
    let task = createTask(kinds, front);
    for (let tries = 0; task.key === previous?.key && tries < 20; tries++) task = createTask(kinds, front);
    return task;
  },
};
