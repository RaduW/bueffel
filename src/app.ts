// Shared by the desktop page (index.html) and the phone page (mobile.html).
// Elements that only one of the pages has are looked up as optional.
//
// This file is only the DOM layer: grammar, questions, stats and storage
// live in src/core and don't depend on the UI.

import { EXERCISES, type Exercise } from './core/exercises.ts'
import { CASES, GENDER_HEADER, GENDER_LABEL, GENDERS, type CaseIndex, type Gender } from './core/grammar.ts'
import { clearHistory, recordResult, type DayCounts } from './core/history.ts'
import { NOUN_POOLS } from './core/nouns.ts'
import { answer, createQuestion, type Question } from './core/question.ts'
import { settingsProblem } from './core/settings.ts'
import { emptyStats, exerciseCounts, pct, withFinished, withShown, withStreakBroken } from './core/stats.ts'
import { applyTheme, loadState, loadTheme, saveState as storeState, saveTheme, saveView, type Theme } from './core/storage.ts'

const state = loadState();

function saveState() {
  storeState(state);
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

function settingsValid() {
  return settingsProblem(state.settings) === null;
}

function showSettingsProblem() {
  const problem = settingsProblem(state.settings);
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
    const e = exerciseCounts(st, ex.id);
    const tr = document.createElement('tr');
    for (const v of [ex.name, e.shown, e.perfect, e.shown - e.perfect, pct(e.perfect, e.shown)]) {
      const td = document.createElement('td');
      td.textContent = String(v);
      tr.append(td);
    }
    body.append(tr);
  }
}

// ---------- Summary tables ----------

// One table per selected exercise, like the ones in "German Declination.md".
// Endings take the colour of their gender; the headers use the gender and case colours.
function renderTables() {
  const box = $('tables');
  box.innerHTML = '';
  const s = state.settings;
  const shown = EXERCISES.filter(e => s.exercises.includes(e.id));
  if (!shown.length) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Select at least one exercise in the settings to see its table.';
    box.append(hint);
  }

  // A phone in portrait is too narrow for four columns: each case gets two sub-rows,
  // so the first column holds Maskulin over Neutrum and the second Feminin over Plural
  const groups: Gender[][] = narrowTables() ? [['m', 'f'], ['n', 'p']] : [GENDERS];

  for (const ex of shown) {
    const title = document.createElement('h2');
    title.textContent = ex.name;
    box.append(title, exerciseTable(ex, groups));
  }
}

// Phone page in portrait (landscape has room for the desktop layout)
const NARROW = matchMedia('(max-width: 599px)');

function narrowTables(): boolean {
  return document.body.classList.contains('mobile') && NARROW.matches;
}

// With more than one gender group, each case and the header get one sub-row per group
function exerciseTable(ex: Exercise, groups: Gender[][]): HTMLElement {
  const table = document.createElement('table');
  if (groups.length > 1) table.className = 'split';

  const head = table.createTHead();
  groups.forEach((genders, gi) => {
    const tr = head.insertRow();
    if (gi === 0) tr.append(spanRows(cell('th', 'Kasus', 'corner'), groups.length));
    for (const g of genders) tr.append(cell('th', GENDER_HEADER[g], 'g-' + g));
  });

  const body = table.createTBody();
  CASES.forEach((c, ci) => {
    groups.forEach((genders, gi) => {
      const tr = body.insertRow();
      if (gi < groups.length - 1) tr.className = 'sub';
      if (gi === 0) {
        const th = spanRows(cell('th', c.name.slice(0, 3), 'case-' + c.id), groups.length);
        th.title = c.name;
        tr.append(th);
      }
      for (const g of genders) {
        const td = cell('td', '', 'g-' + g);
        ex.sample(g, ci as CaseIndex).forEach(([stem, ending], i) => {
          if (i) td.append(' ');
          td.append(stem);
          if (ending) {
            const b = document.createElement('b');
            b.textContent = ending;
            td.append(b);
          }
        });
        tr.append(td);
      }
    });
  });

  const scroll = document.createElement('div');
  scroll.className = 'table-scroll';
  scroll.append(table);
  return scroll;
}

function cell(tag: 'th' | 'td', text: string, className = ''): HTMLTableCellElement {
  const el = document.createElement(tag);
  el.textContent = text;
  el.className = className;
  return el;
}

function spanRows(el: HTMLTableCellElement, rows: number): HTMLTableCellElement {
  el.rowSpan = rows;
  return el;
}

// ---------- Questions ----------

let current: Question | null = null;

// Pending move to the next question after a solved one
let advanceTimer: number | undefined;
const ADVANCE_DELAY_MS = 1000;

function newQuestion() {
  clearTimeout(advanceTimer);
  showSettingsProblem();
  current = createQuestion(state.settings, current?.key);
  $('card').hidden = !current;
  if (current) renderQuestion();
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
  q.slots.forEach((slot, slotIndex) => {
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
      btn.addEventListener('click', () => choose(slotIndex, opt, btn, options));
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

function choose(slotIndex: number, opt: string, btn: HTMLButtonElement, optionsBox: HTMLElement) {
  if (!current) return;
  const outcome = answer(current, slotIndex, opt);
  if (outcome.result === 'ignored') return;
  const q = current = outcome.question;

  // A question counts as shown once the user starts answering it,
  // so reloading the page or changing settings doesn't inflate the count
  if (outcome.started) {
    state.stats = withShown(state.stats, q.exercise.id);
    saveState();
    renderStats();
    record(q, { shown: 1 });
  }

  if (outcome.result === 'correct') {
    btn.classList.add('correct');
    optionsBox.classList.add('done');
    for (const b of optionsBox.querySelectorAll('button')) b.disabled = true;
    renderPhrase();
    if (outcome.finished) finish(q);
  } else {
    btn.classList.add('wrong');
    btn.disabled = true;
    record(q, { mistakes: 1 });
  }
}

// Add to today's record in the long-term history (IndexedDB, see history.ts)
function record(q: Question, delta: Partial<DayCounts>) {
  void recordResult({ exercise: q.exercise.id, caseId: CASES[q.ci].id, gender: q.noun.g, delta });
}

function finish(q: Question) {
  const perfect = q.mistakes === 0;
  state.stats = withFinished(state.stats, q.exercise.id, perfect);
  if (perfect) record(q, { perfect: 1 });
  saveState();
  renderStats();

  const result = $('result');
  result.hidden = false;
  result.className = 'result ' + (perfect ? 'perfect' : 'mistakes');
  $('result-text').textContent = perfect
    ? '✓ Correct, no mistakes!'
    : `Done with ${q.mistakes} mistake${q.mistakes === 1 ? '' : 's'}.`;
  $('next').focus();
  // Move on by itself shortly; Next still works for skipping the wait.
  // Don't swap the question behind an open dialog
  advanceTimer = window.setTimeout(() => {
    if (current === q && !settingsDialog.open && !tablesDialog.open) newQuestion();
  }, ADVANCE_DELAY_MS);
}

// ---------- Wiring ----------

const settingsDialog = $<HTMLDialogElement>('settings');

$('open-settings').addEventListener('click', () => {
  const status = document.getElementById('history-status');
  if (status) status.textContent = '';
  settingsDialog.showModal();
});

// The dialog stays open until the settings allow at least one question
function closeSettings() {
  if (settingsValid()) settingsDialog.close();
}

$('close-settings').addEventListener('click', closeSettings);

// Declension tables for the selected exercises, drawn fresh each time
const tablesDialog = $<HTMLDialogElement>('tables-dialog');

$('open-tables').addEventListener('click', () => {
  renderTables();
  tablesDialog.showModal();
  // Opening focuses Done, which scrolls a long dialog to the end; start at the top
  tablesDialog.scrollTop = 0;
});

$('close-tables').addEventListener('click', () => tablesDialog.close());

// Turning the phone switches between the split and the four-column layout
NARROW.addEventListener('change', () => {
  if (tablesDialog.open) renderTables();
});

settingsDialog.addEventListener('cancel', e => {
  e.preventDefault();
  closeSettings();
});

// Clicking the backdrop (outside the dialog box) closes it
function onBackdropClick(dialog: HTMLDialogElement, close: () => void) {
  dialog.addEventListener('click', e => {
    const r = dialog.getBoundingClientRect();
    const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) close();
  });
}

onBackdropClick(settingsDialog, closeSettings);
onBackdropClick(tablesDialog, () => tablesDialog.close());

$('next').addEventListener('click', newQuestion);

$('skip').addEventListener('click', () => {
  if (current && current.touched && !current.finished) {
    state.stats = withStreakBroken(state.stats);
    saveState();
    renderStats();
  }
  newQuestion();
});

$('reset').addEventListener('click', () => {
  if (!confirm('Reset the current statistics?\n\nYour daily history is kept. To delete it, use Settings → Clear history.')) return;
  state.stats = emptyStats();
  saveState();
  renderStats();
  newQuestion();
});

// Only this button deletes the long-term history (IndexedDB, see history.ts)
$('clear-history').addEventListener('click', async () => {
  if (!confirm('Delete the whole daily history?\n\nThis cannot be undone. The current statistics are kept.')) return;
  let message: string;
  try {
    await clearHistory();
    message = 'History cleared.';
  } catch (e) {
    console.warn('Could not clear daily history', e);
    message = 'Could not clear the history.';
  }
  // The desktop page has a status line; the phone page shows it on the button
  const status = document.getElementById('history-status');
  if (status) {
    status.textContent = message;
  } else {
    const btn = $<HTMLButtonElement>('clear-history');
    const label = btn.textContent;
    btn.textContent = message.replace(/\.$/, '');
    btn.disabled = true;
    setTimeout(() => { btn.textContent = label; btn.disabled = false; }, 2000);
  }
});

// Theme: the script in each page's <head> applies the stored choice before the first paint
for (const radio of document.querySelectorAll<HTMLInputElement>('#theme-choice input')) {
  radio.checked = radio.value === loadTheme();
  radio.addEventListener('change', () => {
    applyTheme(radio.value as Theme);
    saveTheme(radio.value as Theme);
  });
}

// Link to the other version of the page; remember the choice so that
// index.html's redirect respects it (see the script in its <head>)
const switchView = document.getElementById('switch-view');
switchView?.addEventListener('click', () => saveView(switchView.dataset.view!));

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && !settingsDialog.open && !tablesDialog.open && current && current.finished && document.activeElement !== $('next')) {
    newQuestion();
  }
});

renderSettings();
renderStats();
newQuestion();
