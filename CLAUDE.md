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
- `src/ui/`: shared `Header` (title, optional back button, actions), `Modal`
  (native `<dialog>`), `useMediaQuery`, `icons`
- `src/ui/declension/Declension.tsx`: the declension exercise: state (settings,
  stats, question), auto-advance, wide or compact layout; `onFinish` goes home
  (a started, unfinished question counts like Skip)
- `src/ui/declension/`: `QuestionCard`, `ResultBanner`, `Breakdown` (wide layout),
  `SettingsDialog`, `TablesDialog`
- `src/main.tsx`: entry for `index.html`

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
