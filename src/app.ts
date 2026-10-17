// Shared by the desktop page (index.html) and the phone page (mobile.html).
// Elements that only one of the pages has are looked up as optional.

type Gender = 'm' | 'n' | 'f' | 'p'
type CaseIndex = 0 | 1 | 2 | 3
type Table = Record<Gender, string[]>

interface Noun {
  w: string
  g: Gender
  gen?: string
  dat?: string
  obl?: string
  opts: string[]
}

interface Slot {
  label: string
  options: string[]
  answer: string
}

interface Exercise {
  id: string
  name: string
  adjective?: boolean
  build(noun: Noun, ci: CaseIndex, adj: string): Slot[]
}

interface Counts {
  shown: number
  perfect: number
}

interface State {
  settings: { exercises: string[]; pools: string[]; genders: string[]; cases: string[] }
  stats: Counts & { streak: number; byExercise: Record<string, Counts> }
}

interface Question {
  exercise: Exercise
  noun: Noun
  ci: CaseIndex
  adj: string | null
  slots: (Slot & { solved: boolean })[]
  mistakes: number
  touched: boolean
  finished: boolean
}

// ---------- Grammar data (from "German Declination.md") ----------

// Case order everywhere: Nom, Akk, Dat, Gen
const CASES = [
  { id: 'nom', name: 'Nominativ', question: 'Wer? Was?' },
  { id: 'akk', name: 'Akkusativ', question: 'Wen? Was?' },
  { id: 'dat', name: 'Dativ', question: 'Wem?' },
  { id: 'gen', name: 'Genitiv', question: 'Wessen?' },
];

const GENDER_LABEL: Record<Gender, string> = { m: 'maskulin', n: 'neutrum', f: 'feminin', p: 'Plural' };
const GENDERS = Object.keys(GENDER_LABEL) as Gender[];

const DEF_ARTICLE: Table = {
  m: ['der', 'den', 'dem', 'des'],
  n: ['das', 'das', 'dem', 'des'],
  f: ['die', 'die', 'der', 'der'],
  p: ['die', 'die', 'den', 'der'],
};
const DEF_OPTIONS = ['der', 'die', 'das', 'den', 'dem', 'des'];

// Endings for ein / kein / mein ...
const EIN_ENDING: Table = {
  m: ['', 'en', 'em', 'es'],
  n: ['', '', 'em', 'es'],
  f: ['e', 'e', 'er', 'er'],
  p: ['e', 'e', 'en', 'er'],
};

const ADJ_ENDING: Record<'strong' | 'weak' | 'mixed', Table> = {
  strong: {
    m: ['er', 'en', 'em', 'en'],
    n: ['es', 'es', 'em', 'en'],
    f: ['e', 'e', 'er', 'er'],
    p: ['e', 'e', 'en', 'er'],
  },
  weak: {
    m: ['e', 'en', 'en', 'en'],
    n: ['e', 'e', 'en', 'en'],
    f: ['e', 'e', 'en', 'en'],
    p: ['en', 'en', 'en', 'en'],
  },
  mixed: {
    m: ['er', 'en', 'en', 'en'],
    n: ['es', 'es', 'en', 'en'],
    f: ['e', 'e', 'en', 'en'],
    p: ['en', 'en', 'en', 'en'],
  },
};
const ENDING_OPTIONS = ['', 'e', 'en', 'em', 'er', 'es'];

// ein has no plural, so plural questions use kein / possessives only
const EIN_WORDS_SG = ['ein', 'kein', 'mein', 'dein', 'sein', 'ihr', 'unser'];
const EIN_WORDS_PL = ['kein', 'mein', 'dein', 'sein', 'ihr', 'unser'];

const ADJECTIVES = ['alt', 'jung', 'klein', 'groß', 'neu', 'gut', 'schön', 'nett'];

// g: gender (p = plural), gen: Genitiv singular (m/n), dat: Dativ plural,
// obl: n-noun form for Akk/Dat/Gen, opts: noun forms offered as choices
const NOUN_POOLS: Record<string, { label: string; nouns: Noun[] }> = {
  core: {
    label: 'Mann, Kind, Frau, Leute',
    nouns: [
      { w: 'Mann', g: 'm', gen: 'Mannes', opts: ['Mann', 'Mannen', 'Mannes'] },
      { w: 'Kind', g: 'n', gen: 'Kindes', opts: ['Kind', 'Kinden', 'Kindes'] },
      { w: 'Frau', g: 'f', opts: ['Frau', 'Frauen', 'Fraus'] },
      { w: 'Leute', g: 'p', dat: 'Leuten', opts: ['Leute', 'Leuten', 'Leutes'] },
    ],
  },
  more: {
    label: 'More nouns',
    nouns: [
      { w: 'Tisch', g: 'm', gen: 'Tisches', opts: ['Tisch', 'Tischen', 'Tisches'] },
      { w: 'Vater', g: 'm', gen: 'Vaters', opts: ['Vater', 'Vatern', 'Vaters'] },
      { w: 'Hund', g: 'm', gen: 'Hundes', opts: ['Hund', 'Hunden', 'Hundes'] },
      { w: 'Lehrer', g: 'm', gen: 'Lehrers', opts: ['Lehrer', 'Lehrern', 'Lehrers'] },
      { w: 'Haus', g: 'n', gen: 'Hauses', opts: ['Haus', 'Hausen', 'Hauses'] },
      { w: 'Buch', g: 'n', gen: 'Buches', opts: ['Buch', 'Buchen', 'Buches'] },
      { w: 'Fenster', g: 'n', gen: 'Fensters', opts: ['Fenster', 'Fenstern', 'Fensters'] },
      { w: 'Auto', g: 'n', gen: 'Autos', opts: ['Auto', 'Auton', 'Autos'] },
      { w: 'Stadt', g: 'f', opts: ['Stadt', 'Stadten', 'Stadts'] },
      { w: 'Lampe', g: 'f', opts: ['Lampe', 'Lampen', 'Lampes'] },
      { w: 'Tür', g: 'f', opts: ['Tür', 'Türen', 'Türs'] },
      { w: 'Kinder', g: 'p', dat: 'Kindern', opts: ['Kinder', 'Kindern', 'Kinders'] },
      { w: 'Männer', g: 'p', dat: 'Männern', opts: ['Männer', 'Männern', 'Männers'] },
      { w: 'Bücher', g: 'p', dat: 'Büchern', opts: ['Bücher', 'Büchern', 'Büchers'] },
      { w: 'Tische', g: 'p', dat: 'Tischen', opts: ['Tische', 'Tischen', 'Tisches'] },
    ],
  },
  nnoun: {
    label: 'n-nouns (Junge, Student …)',
    nouns: [
      { w: 'Junge', g: 'm', obl: 'Jungen', opts: ['Junge', 'Jungen', 'Junges'] },
      { w: 'Kollege', g: 'm', obl: 'Kollegen', opts: ['Kollege', 'Kollegen', 'Kolleges'] },
      { w: 'Student', g: 'm', obl: 'Studenten', opts: ['Student', 'Studenten', 'Studentes'] },
      { w: 'Mensch', g: 'm', obl: 'Menschen', opts: ['Mensch', 'Menschen', 'Mensches'] },
    ],
  },
};

function nounForm(noun: Noun, ci: CaseIndex): string {
  if (noun.obl) return ci === 0 ? noun.w : noun.obl;
  if (noun.g === 'p') return ci === 2 ? noun.dat! : noun.w;
  if (noun.g === 'f') return noun.w;
  return ci === 3 ? noun.gen! : noun.w;
}

// Each exercise builds a list of slots: { label, options, answer }
const EXERCISES: Exercise[] = [
  {
    id: 'def',
    name: 'Definite article + noun',
    build(noun, ci) {
      return [
        { label: 'Article', options: DEF_OPTIONS, answer: DEF_ARTICLE[noun.g][ci] },
        nounSlot(noun, ci),
      ];
    },
  },
  {
    id: 'indef',
    name: 'ein / kein / mein … + noun',
    build(noun, ci) {
      return [einSlot(noun, ci), nounSlot(noun, ci)];
    },
  },
  {
    id: 'strong',
    name: 'Adjective + noun (no article)',
    adjective: true,
    build(noun, ci, adj) {
      return [adjSlot(adj, ADJ_ENDING.strong[noun.g][ci]), nounSlot(noun, ci)];
    },
  },
  {
    id: 'weak',
    name: 'der + adjective + noun',
    adjective: true,
    build(noun, ci, adj) {
      return [
        { label: 'Article', options: DEF_OPTIONS, answer: DEF_ARTICLE[noun.g][ci] },
        adjSlot(adj, ADJ_ENDING.weak[noun.g][ci]),
        nounSlot(noun, ci),
      ];
    },
  },
  {
    id: 'mixed',
    name: 'ein / kein + adjective + noun',
    adjective: true,
    build(noun, ci, adj) {
      return [einSlot(noun, ci), adjSlot(adj, ADJ_ENDING.mixed[noun.g][ci]), nounSlot(noun, ci)];
    },
  },
];

function nounSlot(noun: Noun, ci: CaseIndex): Slot {
  return { label: 'Noun', options: noun.opts, answer: nounForm(noun, ci) };
}

function einSlot(noun: Noun, ci: CaseIndex): Slot {
  const stem = pick(noun.g === 'p' ? EIN_WORDS_PL : EIN_WORDS_SG);
  return {
    label: 'Article',
    options: ENDING_OPTIONS.map(e => stem + e),
    answer: stem + EIN_ENDING[noun.g][ci],
  };
}

function adjSlot(adj: string, ending: string): Slot {
  return { label: 'Adjective', options: ENDING_OPTIONS.map(e => adj + e), answer: adj + ending };
}

// ---------- Persistence ----------

const STORE_KEY = 'declination-trainer-v1';

function defaultState(): State {
  return {
    settings: { exercises: ['def'], pools: ['core'], genders: [...GENDERS], cases: CASES.map(c => c.id) },
    stats: { shown: 0, perfect: 0, streak: 0, byExercise: {} },
  };
}

function loadState(): State {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) ?? 'null');
    if (saved && saved.settings && saved.stats) {
      // Settings saved before the gender filter existed: allow all genders
      saved.settings.genders ??= [...GENDERS];
      return saved;
    }
  } catch { /* ignore corrupt or blocked storage */ }
  return defaultState();
}

function saveState() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch { /* storage unavailable: stats live for this session only */ }
}

const state = loadState();

// ---------- Helpers ----------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const $ = <T extends HTMLElement = HTMLElement>(id: string) => document.getElementById(id) as T;

// ---------- Settings UI ----------

function renderCheckboxes(
  containerId: string,
  items: { id: string; label: string }[],
  selected: string[],
  onChange: (selected: string[]) => void,
) {
  const box = $(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = selected.includes(item.id);
    input.addEventListener('change', () => {
      const set = new Set(selected);
      if (input.checked) set.add(item.id);
      else set.delete(item.id);
      onChange(items.map(i => i.id).filter(id => set.has(id)));
    });
    label.append(input, item.label);
    box.append(label);
  }
}

function renderSettings() {
  const s = state.settings;
  renderCheckboxes('exercise-list', EXERCISES.map(e => ({ id: e.id, label: e.name })), s.exercises, v => {
    s.exercises = v; settingsChanged();
  });
  renderCheckboxes('pool-list', Object.entries(NOUN_POOLS).map(([id, p]) => ({ id, label: p.label })), s.pools, v => {
    s.pools = v; settingsChanged();
  });
  renderCheckboxes('gender-list', GENDERS.map(g => ({ id: g, label: GENDER_LABEL[g] })), s.genders, v => {
    s.genders = v; settingsChanged();
  });
  renderCheckboxes('case-list', CASES.map(c => ({ id: c.id, label: c.name })), s.cases, v => {
    s.cases = v; settingsChanged();
  });
}

// Nouns from the selected groups that have one of the selected genders
function availableNouns(): Noun[] {
  const s = state.settings;
  return s.pools.flatMap(p => NOUN_POOLS[p].nouns).filter(n => s.genders.includes(n.g));
}

// Why no question can be drawn with the current settings, or null if one can
function settingsProblem(): string | null {
  const s = state.settings;
  if (!s.exercises.length) return 'Select at least one exercise.';
  if (!s.pools.length) return 'Select at least one noun group.';
  if (!s.genders.length) return 'Select at least one gender or Plural.';
  if (!s.cases.length) return 'Select at least one case.';
  if (!availableNouns().length) return 'The selected noun groups have no nouns of the selected genders (the n-nouns are all masculine).';
  return null;
}

function settingsValid() {
  return settingsProblem() === null;
}

function showSettingsProblem() {
  const problem = settingsProblem();
  const el = $('settings-error');
  el.textContent = problem ?? '';
  el.hidden = problem === null;
}

function settingsChanged() {
  saveState();
  renderSettings();
  showSettingsProblem();
  // Keep a question the user has already started; otherwise draw a new one
  if (!current || !current.touched || current.finished) newQuestion();
}

// ---------- Stats ----------

function exStats(id: string): Counts {
  return (state.stats.byExercise[id] ||= { shown: 0, perfect: 0 });
}

function pct(perfect: number, shown: number): string {
  return shown ? Math.round((perfect / shown) * 100) + '%' : '–';
}

function renderStats() {
  const st = state.stats;
  $('stat-shown').textContent = String(st.shown);
  $('stat-perfect').textContent = String(st.perfect);
  $('stat-errors').textContent = String(st.shown - st.perfect);
  $('stat-rate').textContent = pct(st.perfect, st.shown);
  $('stat-streak').textContent = String(st.streak);

  // Per-exercise table (desktop page only)
  const body = document.getElementById('breakdown');
  if (!body) return;
  body.innerHTML = '';
  for (const ex of EXERCISES) {
    const e = st.byExercise[ex.id] || { shown: 0, perfect: 0 };
    const tr = document.createElement('tr');
    for (const v of [ex.name, e.shown, e.perfect, e.shown - e.perfect, pct(e.perfect, e.shown)]) {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.append(td);
    }
    body.append(tr);
  }
}

// ---------- Questions ----------

let current: Question | null = null;
let lastKey = '';

function newQuestion() {
  showSettingsProblem();
  const valid = settingsValid();
  $('card').hidden = !valid;
  if (!valid) { current = null; return; }

  const s = state.settings;
  const nouns = availableNouns();
  let exercise: Exercise, noun: Noun, ci: CaseIndex, adj: string, key: string;
  let tries = 0;
  do {
    exercise = pick(EXERCISES.filter(e => s.exercises.includes(e.id)));
    noun = pick(nouns);
    const caseId = pick(s.cases);
    ci = CASES.findIndex(c => c.id === caseId) as CaseIndex;
    adj = pick(ADJECTIVES);
    key = `${exercise.id}|${noun.w}|${ci}`;
  } while (key === lastKey && ++tries < 20);
  lastKey = key;

  current = {
    exercise, noun, ci,
    adj: exercise.adjective ? adj : null,
    slots: exercise.build(noun, ci, adj).map(sl => ({ ...sl, solved: false })),
    mistakes: 0,
    touched: false,
    finished: false,
  };
  renderQuestion();
}

function renderQuestion() {
  const q = current!;
  const c = CASES[q.ci];
  const caseBadge = $('q-case');
  caseBadge.innerHTML = `${c.name}<small>${c.question}</small>`;
  caseBadge.className = 'case-badge case-' + c.id;
  $('q-exercise').textContent = q.exercise.name;
  $('q-noun').textContent = q.noun.w;
  const gender = $('q-gender');
  gender.textContent = GENDER_LABEL[q.noun.g];
  gender.className = 'gender ' + q.noun.g;
  $('q-adj').textContent = q.adj ? `+ ${q.adj}` : '';

  const slotsBox = $('slots');
  slotsBox.innerHTML = '';
  q.slots.forEach(slot => {
    const wrap = document.createElement('div');
    wrap.className = 'slot';
    const label = document.createElement('div');
    label.className = 'slot-label';
    label.textContent = slot.label;
    const options = document.createElement('div');
    options.className = 'options';
    for (const opt of slot.options) {
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.addEventListener('click', () => choose(slot, opt, btn, options));
      options.append(btn);
    }
    wrap.append(label, options);
    slotsBox.append(wrap);
  });

  $('result').hidden = true;
  $('result-text').textContent = '';
  renderPhrase();
}

function renderPhrase() {
  const box = $('q-phrase');
  box.innerHTML = '';
  for (const slot of current!.slots) {
    const span = document.createElement('span');
    span.className = slot.solved ? 'filled' : 'blank';
    span.textContent = slot.solved ? slot.answer : '____';
    box.append(span);
  }
}

function choose(slot: Question['slots'][number], opt: string, btn: HTMLButtonElement, optionsBox: HTMLElement) {
  if (!current || slot.solved || current.finished) return;
  // A question counts as shown once the user starts answering it,
  // so reloading the page or changing settings doesn't inflate the count
  if (!current.touched) {
    current.touched = true;
    state.stats.shown++;
    exStats(current.exercise.id).shown++;
    saveState();
    renderStats();
  }

  if (opt === slot.answer) {
    btn.classList.add('correct');
    slot.solved = true;
    optionsBox.classList.add('done');
    for (const b of optionsBox.querySelectorAll('button')) b.disabled = true;
    renderPhrase();
    if (current.slots.every(s => s.solved)) finish(current);
  } else if (!btn.classList.contains('wrong')) {
    btn.classList.add('wrong');
    btn.disabled = true;
    current.mistakes++;
  }
}

function finish(q: Question) {
  q.finished = true;
  const st = state.stats;
  const perfect = q.mistakes === 0;
  if (perfect) {
    st.perfect++;
    st.streak++;
    exStats(q.exercise.id).perfect++;
  } else {
    st.streak = 0;
  }
  saveState();
  renderStats();

  const result = $('result');
  result.hidden = false;
  result.className = 'result ' + (perfect ? 'perfect' : 'mistakes');
  $('result-text').textContent = perfect
    ? '✓ Correct, no mistakes!'
    : `Done with ${q.mistakes} mistake${q.mistakes === 1 ? '' : 's'}.`;
  $('next').focus();
}

// ---------- Wiring ----------

const settingsDialog = $<HTMLDialogElement>('settings');

$('open-settings').addEventListener('click', () => settingsDialog.showModal());

// The dialog stays open until the settings allow at least one question
function closeSettings() {
  if (settingsValid()) settingsDialog.close();
}

$('close-settings').addEventListener('click', closeSettings);

settingsDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeSettings();
});

// Clicking the backdrop (outside the dialog box) closes it
settingsDialog.addEventListener('click', e => {
  const r = settingsDialog.getBoundingClientRect();
  const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
  if (!inside) closeSettings();
});

$('next').addEventListener('click', newQuestion);

$('skip').addEventListener('click', () => {
  if (current && current.touched && !current.finished) {
    state.stats.streak = 0;
    saveState();
    renderStats();
  }
  newQuestion();
});

$('reset').addEventListener('click', () => {
  if (!confirm('Reset all statistics?')) return;
  state.stats = defaultState().stats;
  saveState();
  renderStats();
  newQuestion();
});

// Link to the other version of the page; remember the choice so that
// index.html's redirect respects it (see the script in its <head>)
const switchView = document.getElementById('switch-view');
switchView?.addEventListener('click', () => {
  try {
    localStorage.setItem('declination-view', switchView.dataset.view!);
  } catch { /* storage unavailable: the link still works for this visit */ }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !settingsDialog.open && current && current.finished && document.activeElement !== $('next')) {
    newQuestion();
  }
});

renderSettings();
renderStats();
newQuestion();
