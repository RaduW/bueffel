# Bueffel

A browser app (PWA) for practising German. It started as a declension trainer
(`~/dev/declination`, published at https://raduw.github.io/declination-practice/,
left as is) and is growing into a collection of German exercises.

## Name

- Name: **Bueffel** everywhere (from *büffeln*, "to cram"), written without the umlaut so it is easy to type on any keyboard.

## Plan: move to React

Decided to move from plain TypeScript + DOM to React (Vite + TS), because more
exercise types are coming.

1. **Done:** framework-independent logic in `src/core/` (grammar data, nouns,
   exercises, question drawing/answering, stats, settings, storage, history).
   Functions there return new objects instead of mutating, so they can back
   React state (`useState`/`useReducer`) directly.
2. **Done:** UI rebuilt in React (`src/ui/`). Both pages mount the same `App`
   with `variant="desktop"` or `"mobile"`; the markup and CSS class names are
   the same as before, so `style.css` / `mobile.css` are unchanged.
3. **Next:** merge `index.html` and `mobile.html` into one responsive app (CSS / media
   queries) instead of two pages kept in sync.

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
- `src/ui/App.tsx`: state (settings, stats, question), auto-advance, layout per variant
- `src/ui/`: `Header`, `QuestionCard`, `ResultBanner`, `Breakdown` (desktop),
  `SettingsDialog`, `TablesDialog`, `Modal` (native `<dialog>`), `useMediaQuery`, `icons`
- `src/main.tsx` / `src/mobile.tsx`: entries for `index.html` / `mobile.html`

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
