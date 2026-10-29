# Büffel

A browser app (PWA) for practising German. It started as a declension trainer
(`~/dev/declination`, published at https://raduw.github.io/declination-practice/,
left as is) and is growing into a collection of German exercises.

## Name

- Displayed name (page title, header, installed app name, docs headings): **Büffel** (from *büffeln*, "to cram").
- Anything that has to be typed (repo, package, URLs, storage keys, manifest id, file names): `bueffel`, so it works on any keyboard.

## Plan: move to React

Decided to move from plain TypeScript + DOM to React (Vite + TS), because more
exercise types are coming.

1. **Done:** framework-independent logic in `src/core/` (grammar data, nouns,
   exercise definitions, stats, storage, history).
   Functions there return new objects instead of mutating, so they can back
   React state (`useState`/`useReducer`) directly.
2. **Done:** UI rebuilt in React (`src/ui/`).
3. **Done:** one page (`index.html`). `App` picks the layout with a media query
   (`COMPACT_QUERY`: narrow, or short touch screen = phone in landscape) and sets
   the `compact` class; the compact rules are at the end of `style.css` under
   `.compact`. JS decides (not CSS media queries) because the layouts place the
   result and Skip/Next differently. Switching layouts keeps all state.

Both exercises are gapFill exercises (see below) on the same page
(`src/ui/common/GapFillPage.tsx`); an exercise adds its own components only
where it differs (declension: the prompt above the phrase).

`@vitejs/plugin-react` was installed with `--legacy-peer-deps` (an optional Babel
peer conflicts with workbox's Babel). `npm ci` works without the flag; a later
`npm install <pkg>` may need it again.

## Layout

- `src/core/grammar.ts`: cases, genders, article/ending tables, adjectives
- `src/core/nouns.ts`: noun pools, `nounForm`
- `src/core/exercises.ts`: exercise definitions (`build` slots, `sample` table cells)
- `src/core/scores.ts`: `ScoreResult` {tags, success, mistakes}, `Scoreboard`
  (per tag combination: attempts, successes, mistakes), `totals`. Every exercise
  reports one result per score group of a finished task (declension question:
  one, tags exercise/case/gender; sentence: one per noun phrase, tags case/pattern)
- `src/core/stats.ts`: `Progress` {scores, streak}; the header tally (shown =
  attempts, perfect = successes) is derived, so a sentence with 2 phrases counts 2
  ("puzzles"; user is fine with the label "shown")
- `src/core/storage.ts`: localStorage, one key per exercise
  `bueffel-ex-<id>-v1` = {settings, progress}, plus `bueffel-theme`. The old
  `bueffel-state-v1` is removed on load (dropped, not migrated: user's choice)
- `src/core/history.ts`: IndexedDB `bueffel-history` v2, store `results`, one
  record per [date, exercise] with a `scores` scoreboard. v1's `days` store is
  deleted on upgrade. `clearHistory(exercise)` clears one exercise
- `src/ui/App.tsx`: picks the page from the URL hash (`useHashRoute`): `#/<route>`
  of an exercise or a grammar page, otherwise the home page (`Home.tsx`)
- Home: icon + "Büffel" header, a tagline, then two sections (user's choice:
  sections, not tabs, while the lists are short): **Practice** (one card per
  exercise) and **Grammar** (one card per grammar page, with a book icon). Cards
  show only the title (no description or progress; user's choice)
- `src/ui/exercises.ts`: the exercises (route, title, component); a new exercise
  = a new entry here plus its folder
- `src/ui/grammar.ts`: the grammar pages (route `grammar/<id>`, title, `Content`
  getting {compact}); a new cheat sheet = a new entry + a component in
  `src/ui/grammar/`. `GrammarPage.tsx` shows one (header + back; back =
  `goBack()`: the previous page, e.g. the exercise it was opened from, or home
  if it's the first page shown). `grammar/tables.tsx`: shared building blocks
  (`useChoice` + `Chips`: which tables are shown, remembered via
  `loadPref`/`savePref` under `bueffel-grammar-<page>`; `CaseGenderTable`: case
  rows × gender columns, endings highlighted, split rows on a phone in portrait;
  `ListTable`: label + columns, case-coloured headers). `grammar/DeclensionTables.tsx`:
  one table per declension exercise. `grammar/PronounTables.tsx` ("Pronouns",
  data in `src/core/pronouns.ts`): personal (Nom–Gen per person), reflexive
  (Akk/Dat), possessive articles (which per person + endings of mein; euer ->
  eure), relative (der/dessen/deren/denen), question words (wer/was). `grammar/ConjunctionsSheet.tsx`
  ("Conjunctions & word order", sections 1–2 of the conjunctions doc: the three
  orders with examples, rules, connectors per kind), linked from word-order's help
- Exercise help (?): `HelpDialog` = a very brief explanation (user: keep it
  short) + a "Grammar" list of links (`gapFillPage(def, { grammar: [PAGE] })`)
  to the global grammar pages (user's choice: no copy inside the dialog; leaving
  the exercise ends the current task like Skip)
- Settings: the home page's gear opens `AppSettingsDialog` (theme, and
  auto-advance on correct answer: pref `bueffel-auto-advance`, default on); each exercise's gear has its own settings with Reset statistics and
  Clear history for that exercise
- `src/ui/AboutDialog.tsx`: opened by the icon + "Büffel" title on the home page;
  the version comes from package.json (`__APP_VERSION__`, defined in vite.config.ts)
- `src/ui/common/` (user's request: UI shared by the exercises): `GapFillPage`
  (state, auto-advance, Enter, wide/compact layout; `gapFillPage(def, { Prompt,
  grammar })` makes the page component; leaving goes home, an unfinished task counts
  like Skip), `Sentence`, `OptionRow`, `ResultBanner`, `ScorePanel` (groups by
  `scoreColumns`), `SettingsDialog` (drawn from the `SettingDef`s, plus Reset
  statistics / Clear history), `HelpDialog`, `HistoryControls`, `Header`,
  `StatsBar`, `Modal` (native `<dialog>`), `icons`, `useMediaQuery`, `layout`
  (`COMPACT_QUERY`, `ADVANCE_DELAY_MS`), `useExerciseProgress` (the one storage
  mechanism: load/save, `addResults` = progress + history, `resetStats`,
  `deleteHistory`)
- `src/ui/declension/`: `DeclensionPrompt` (case badge, exercise, noun + gender
  + adjective)
- `src/main.tsx`: entry for `index.html`

## gapFill (reusable exercise kind)

Fill a sentence (or phrase) gap by gap, picking each word from options. Built so
the same page serves many exercises (declension, verbs …).

- `src/core/gapfill/types.ts`: `GapFillExercise<P>` { id, title, info? (help text,
  paragraphs split by blank lines), options? ('current' = one option row, gaps in
  order; 'all' = every row at once, any order: declension), scoreColumns? / scoreLabel?
  (results table: declension groups by exercise, shown by name), settings? (`SettingDef[]`: boolean, choice,
  multi; the page draws the dialog from them), problem?(settings) (dialog stays
  open while non-null), next(settings, previous) -> task }. `settings.ts`:
  `defaultValues`, `multiValue`, `choiceValue`, `emptySelection`. A task is plain data: `template`
  ("{D__} {alt__} {Mann__} sieht …", gaps matched by position), `gaps`
  ({answer, options, label?, note?, given?, tone?}; note is always shown in grey
  brackets after the gap, e.g. the noun's gender letter M F n Pl (`GENDER_LETTER`; user's choice, clearer than ♂ ♀ ⚲ ⚤; text size; sentences setting `showGender`); given = filled in
  from the start, italic in `--given`, skipped by the session, not scored; tone =
  'nom'|'akk'|'dat'|'gen' -> the `--case-*` colours of the declension tables,
  shown only once every gap of its score group is filled (`isGroupComplete`;
  before that dark grey `--pending`, so the colour doesn't give the case away)), `scores` ({tags, gaps}: one group per asked noun phrase),
  `explanations?` ({gap, text, detail?}: text "Dat" in the gap's tone, detail
  "Pl" grey (user: colour only the case, not the gender), shown in brackets
  before that gap only after a task finished with mistakes), `prompt?` (data of
  type P for the exercise's Prompt component).
  Definitions know nothing about the UI and don't drive gap-to-gap progress.
- `session.ts`: state per gap (solved, wrong); `startTask`, `pick(state, gap,
  opt)`, `scoreResults` (a group succeeds when its gaps had no wrong pick).
- `src/core/declension/declension.ts`: the declension exercise (one noun phrase,
  all options at once). Settings exercises / noun groups / genders / cases
  (same saved shape as before, key `bueffel-ex-declension-v1`); template = hints
  of the phrase ("{d__} {alt__} {Mann__}"), tone = the case; one score group
  tagged exercise/case/gender.
- `template.ts`: `parseTemplate`, `hintFor` (hint = common prefix of the options
  + "__", so it never rules out an option: articles show "d__"), `capitalize`.
- `src/core/sentences/declensionSentences.ts`: first definition: 44 sentence
  frames from `declination-exercises.md`. Each noun phrase gets a random form
  (PATTERNS, also its score tag): def.Art+noun, ein-word+noun, adj+noun (plural
  only: no article with a singular countable noun), def.Art+adj+noun,
  ein-word+adj+noun; adjective endings weak / mixed / strong accordingly. Nouns
  carry tags (person, animal, place, furniture, surface, portable …) and each
  frame's phrase asks for tags, so sentences make sense. Settings: cases, forms
  (patterns), genders, noun phrases per sentence, ein-words (ein/kein or all).
  A phrase is asked if its case is selected and some selected noun + form fits;
  other phrases are given (user's choice (b): pre-filled in a distinct colour).
  Frames need a selected length and at least one asked phrase. No n-nouns yet (user:
  add later as an option); frames needing ein/kein or contractions are left out.
- `src/core/conjunctions/wordOrder.ts`: "Conjunctions: word order" (route
  `word-order`), from `docs/German Conjunctions Exercises.md`. Template
  "{____}, sondern {____}."; both gaps offer the same options: both clauses in
  all three orders (straight / inverted / verb last; grouped by clause,
  `longOptions` = one per line). Clauses are [subject, verb, rest, verb-last
  ending for separable verbs]. Subordinating pairs marked `front` sometimes
  start with the connector ("Weil … , gehe ich …"; setting). Settings: connector
  kinds. One score group per task, tags kind/connector.
- Decided with the user: help only behind the ? button; skipped tasks are not
  scored (and don't touch the header tally or streak); after a task with
  mistakes there is no auto-advance (explanations shown, Next / Enter to go on).

## Icon

A white bison on the German flag. Sources in `icons/` (`bison.svg`,
`bison-maskable.svg`); `icons/build.sh` writes favicon and PWA icons to `public/`.
`icons/bison-head.svg` is an alternative (front view of the head) the user wants
kept, but not used.

## Behaviour to keep

- After a task solved without mistakes, it moves on automatically after 1 s;
  the Next button stays. After mistakes it stays until Next / Enter (both
  exercises; user's choice). No auto-advance while a dialog is open, or when
  turned off in the app settings.
- Only finished tasks count, in every exercise; Skip or leaving changes
  nothing (not even the streak). The streak follows score groups in order.
- Storage keys are prefixed `bueffel-`: other apps on raduw.github.io share
  the same origin and storage.
- The declension tables fit the page card without scrolling ("keinen alten Leuten"); on desktop their page is wider (`wide` grammar page: 880px column instead of 760px).

## Commands

- `npm run dev`, `npm run build` (tsc + vite build), `npm run preview`
