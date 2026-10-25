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
   exercises, question drawing/answering, stats, settings, storage, history).
   Functions there return new objects instead of mutating, so they can back
   React state (`useState`/`useReducer`) directly.
2. **Done:** UI rebuilt in React (`src/ui/`).
3. **Done:** one page (`index.html`). `App` picks the layout with a media query
   (`COMPACT_QUERY`: narrow, or short touch screen = phone in landscape) and sets
   the `compact` class; the compact rules are at the end of `style.css` under
   `.compact`. JS decides (not CSS media queries) because the layouts place the
   result and Skip/Next differently. Switching layouts keeps all state.

Exercise-specific components can come once there is a second kind of exercise;
today every exercise is "fill the slots by choosing options" (`QuestionCard`).

`@vitejs/plugin-react` was installed with `--legacy-peer-deps` (an optional Babel
peer conflicts with workbox's Babel). `npm ci` works without the flag; a later
`npm install <pkg>` may need it again.

## Layout

- `src/core/grammar.ts`: cases, genders, article/ending tables, adjectives
- `src/core/nouns.ts`: noun pools, `nounForm`
- `src/core/exercises.ts`: exercise definitions (`build` slots, `sample` table cells)
- `src/core/question.ts`: `createQuestion`, `answer`
- `src/core/stats.ts`, `settings.ts`, `storage.ts`, `history.ts` (IndexedDB daily log)
- `src/ui/App.tsx`: picks the page from the URL hash (`useHashRoute`): `#/<route>`
  of an exercise, otherwise the home page (`Home.tsx`)
- `src/ui/exercises.ts`: the exercises on the home page (route, title, component).
  Home: icon + "Büffel" header, a tagline, one card per exercise showing only its
  title (no description or progress on the card; user's choice).
  A new exercise = a new entry here plus its folder
- `src/ui/`: shared `Header` (title, optional back button, actions), `StatsBar`
  (the shown/success/errors/accuracy/streak tally, used by both exercises), `Modal`
  (native `<dialog>`), `useMediaQuery`, `icons`
- `src/ui/declension/Declension.tsx`: the declension exercise: state (settings,
  stats, question), auto-advance, wide or compact layout; `onFinish` goes home
  (a started, unfinished question counts like Skip)
- `src/ui/declension/`: `QuestionCard`, `ResultBanner`, `Breakdown` (wide layout),
  `SettingsDialog`, `TablesDialog`
- `src/main.tsx`: entry for `index.html`

## gapFill (reusable exercise kind)

Fill a sentence one gap at a time, picking each word from options; one option
row at a time. Built so the same page serves many exercises (declension, verbs …).

- `src/core/gapfill/types.ts`: `GapFillExercise` { id, title, info (help text,
  paragraphs split by blank lines), settings? (reserved, not defined yet),
  next(settings, previous) -> task }. A task is plain data: `template`
  ("{D__} {alt__} {Mann__} sieht …", gaps matched by position), `gaps`
  ({answer, options, label?, note?}; note is always shown in grey brackets after
  the gap, e.g. the noun's gender "m"), `scores` ({tags, gaps}: one group per noun phrase),
  `explanations?` ({gap, text}: e.g. "Nominativ Maskulin", "Dativ Plural", shown in brackets
  before that gap only after a task finished with mistakes).
  Definitions know nothing about the UI and don't drive gap-to-gap progress.
- `session.ts`: `startTask`, `pick`, `scoreResults` (a group succeeds when its
  gaps had no wrong pick); `scoreboard.ts`: totals per tag combination.
- `template.ts`: `parseTemplate`, `hintFor` (hint = common prefix of the options
  + "__", so it never rules out an option: articles show "d__"), `capitalize`.
- `src/core/sentences/declensionSentences.ts`: first definition: 44 sentence
  frames from `declination-exercises.md`, def. article + adjective + noun. Nouns
  carry tags (person, animal, place, furniture, surface, portable …) and each
  frame's phrase asks for tags, so sentences make sense. No n-nouns yet (user:
  add later as an option); frames needing ein/kein or contractions are left out.
- `src/ui/gapfill/GapFillPage.tsx` (+ Sentence, OptionRow, HelpDialog, ScorePanel);
  `gapFillPage(def)` makes the component for `src/ui/exercises.ts`.
- Decided with the user: help only behind the ? button; skipped tasks are not
  scored (and don't touch the header tally or streak); tally and scores are in
  memory only for now (not saved); after a task with
  mistakes there is no auto-advance (explanations shown, Next / Enter to go on).
- Not yet: settings, saving scores, moving the old declension exercise onto
  gapFill (it is untouched; `ResultBanner` is imported from it, and
  `COMPACT_QUERY` exists in both `src/ui/layout.ts` and `Declension.tsx`).

## Icon

A white bison on the German flag. Sources in `icons/` (`bison.svg`,
`bison-maskable.svg`); `icons/build.sh` writes favicon and PWA icons to `public/`.
`icons/bison-head.svg` is an alternative (front view of the head) the user wants
kept, but not used.

## Behaviour to keep

- After a question is solved, it moves on automatically after 1 s; the Next
  button stays. No auto-advance while a dialog is open.
- A question counts as "shown" only once the first answer is clicked.
- Storage keys are prefixed `bueffel-`: other apps on raduw.github.io share
  the same origin and storage.
- Desktop tables dialog is 840px wide so "keinen alten Leuten" fits without scrolling.

## Commands

- `npm run dev`, `npm run build` (tsc + vite build), `npm run preview`
