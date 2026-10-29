// gapFill exercise: the personal pronoun of a given person, in the case the
// sentence needs: "Kannst du {___} (ich) helfen?" -> mir. The options are the
// person's own forms (ich, mich, mir), so the case is what's practised.

import { multiValue } from '../gapfill/settings.ts'
import type { GapFillExercise, GapFillTask, SettingDef, SettingValues } from '../gapfill/types.ts'
import { CASE_SHORT, caseIndex } from '../grammar.ts'
import { pick } from '../random.ts'
import { PERSONS } from './forms.ts'

// One gap per sentence; exclude: persons that would make it reflexive or
// odd ("Ich frage mich", "für es")
interface CueFrame { id: string; text: string; case: 'akk' | 'dat'; exclude?: string[] }

const FRAMES: CueFrame[] = [
  // Akkusativ
  { id: 'sieht', text: 'Er sieht {} jeden Tag.', case: 'akk', exclude: ['er'] },
  { id: 'besucht', text: 'Meine Schwester besucht {} am Wochenende.', case: 'akk' },
  { id: 'rufen-an', text: 'Wir rufen {} morgen an.', case: 'akk', exclude: ['wir'] },
  { id: 'frage', text: 'Ich frage {} etwas.', case: 'akk', exclude: ['ich'] },
  { id: 'fuer', text: 'Das Geschenk ist für {}.', case: 'akk', exclude: ['es'] },
  { id: 'ohne', text: 'Ohne {} gehe ich nicht.', case: 'akk', exclude: ['ich', 'es'] },
  { id: 'kennt', text: 'Der Lehrer kennt {} gut.', case: 'akk' },
  { id: 'abholen', text: 'Kannst du {} abholen?', case: 'akk', exclude: ['du'] },
  { id: 'liebt', text: 'Die Katze liebt {} sehr.', case: 'akk' },
  // Dativ
  { id: 'helfen', text: 'Kannst du {} helfen?', case: 'dat', exclude: ['du'] },
  { id: 'gehoert', text: 'Das Buch gehört {}.', case: 'dat' },
  { id: 'schluessel', text: 'Ich gebe {} den Schlüssel.', case: 'dat', exclude: ['ich'] },
  { id: 'antwortet', text: 'Er antwortet {} nicht.', case: 'dat', exclude: ['er'] },
  { id: 'danken', text: 'Wir danken {} für alles.', case: 'dat', exclude: ['wir'] },
  { id: 'mit', text: 'Kommst du mit {}?', case: 'dat', exclude: ['du', 'es'] },
  { id: 'schmeckt', text: 'Das Essen schmeckt {} gut.', case: 'dat' },
  { id: 'geht-es', text: 'Wie geht es {}?', case: 'dat' },
  { id: 'zeige', text: 'Ich zeige {} die Stadt.', case: 'dat', exclude: ['ich'] },
];

const SETTINGS: SettingDef[] = [
  {
    id: 'cases', label: 'Cases', type: 'multi',
    options: [{ id: 'akk', label: 'Akkusativ' }, { id: 'dat', label: 'Dativ' }], default: ['akk', 'dat'],
  },
  {
    id: 'persons', label: 'Persons', type: 'multi',
    options: PERSONS.map(p => ({ id: p.id, label: p.cue })), default: PERSONS.map(p => p.id),
  },
];

// Every [frame, person] that the settings allow
function pairs(values: SettingValues): [CueFrame, number][] {
  const cases = multiValue(SETTINGS, values, 'cases');
  const persons = multiValue(SETTINGS, values, 'persons');
  return FRAMES.filter(f => cases.includes(f.case)).flatMap(f =>
    PERSONS.map((_, pi) => [f, pi] as [CueFrame, number])
      .filter(([, pi]) => persons.includes(PERSONS[pi].id) && !f.exclude?.includes(PERSONS[pi].id)));
}

function createTask(all: [CueFrame, number][]): GapFillTask {
  const [frame, pi] = pick(all);
  const person = PERSONS[pi];
  const ci = caseIndex(frame.case);
  // The person's Nom, Akk and Dat, each once (wir, uns)
  const options = [...new Set(person.personal.slice(0, 3))];
  return {
    key: `${frame.id}|${person.id}`,
    template: frame.text.replace('{}', '{__}'),
    gaps: [{ label: 'Pronoun', options, answer: person.personal[ci], note: person.cue, tone: frame.case }],
    scores: [{ tags: { case: CASE_SHORT[frame.case], person: person.cue }, gaps: [0] }],
    explanations: [{ gap: 0, text: CASE_SHORT[frame.case] }],
  };
}

export const personForms: GapFillExercise = {
  id: 'pronouns-persons',
  title: 'Pronouns: mich or mir?',
  info: `Each sentence has one gap, with a person in brackets after it: put in that person's pronoun, in the case the sentence needs. Kannst du ___ (ich) helfen? → mir (helfen takes the Dativ).

The options are the person's own forms (ich, mich, mir), so the question is always: Akkusativ or Dativ?`,
  scoreColumns: ['case', 'person'],
  settings: SETTINGS,
  problem: values => pairs(values).length ? null : 'No sentence fits this combination. Select more cases or persons.',
  next(values, previous) {
    let all = pairs(values);
    if (!all.length) all = pairs({});
    let task = createTask(all);
    for (let tries = 0; task.key === previous?.key && tries < 20; tries++) task = createTask(all);
    return task;
  },
};
