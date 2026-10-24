# Büffel

A browser app (PWA) for practising German. It started as a declension trainer
(`~/dev/declination`, published at https://raduw.github.io/declination-practice/,
left as is) and is growing into a collection of German exercises.

## Name

- Display name: **Büffel** (from *büffeln*, "to cram").
- Wherever it must be typed (repo, package, URLs, storage keys): `bueffel`.

## Plan: move to React

Decided to move from plain TypeScript + DOM to React (Vite + TS), because more
exercise types are coming.

1. **Done:** framework-independent logic in `src/core/` (grammar data, nouns,
   exercises, question drawing/answering, stats, settings, storage, history).
   Functions there return new objects instead of mutating, so they can back
   React state (`useState`/`useReducer`) directly.
2. **Next:** rebuild the UI in React, one component per exercise, reusing the
   shared pieces (option buttons, result banner, stats, settings and tables dialogs).
3. Merge `index.html` and `mobile.html` into one responsive app (CSS / media
   queries) instead of two pages kept in sync.

Until step 2, `src/app.ts` is the old DOM layer, now running on `src/core`.

## Layout

- `src/core/grammar.ts`: cases, genders, article/ending tables, adjectives
- `src/core/nouns.ts`: noun pools, `nounForm`
- `src/core/exercises.ts`: exercise definitions (`build` slots, `sample` table cells)
- `src/core/question.ts`: `createQuestion`, `answer`
- `src/core/stats.ts`, `settings.ts`, `storage.ts`, `history.ts` (IndexedDB daily log)
- `src/app.ts`: DOM UI shared by `index.html` (desktop) and `mobile.html` (phone)

## Behaviour to keep

- After a question is solved, it moves on automatically after 1 s; the Next
  button stays. No auto-advance while a dialog is open.
- A question counts as "shown" only once the first answer is clicked.
- Storage keys are prefixed `bueffel-`: other apps on raduw.github.io share
  the same origin and storage.
- Desktop tables dialog is 840px wide so "keinen alten Leuten" fits without scrolling.

## Commands

- `npm run dev`, `npm run build` (tsc + vite build), `npm run preview`
