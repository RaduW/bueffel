# Büffel

A browser app for practising German, growing into a collection of exercises. The name comes from _büffeln_, German for cramming; anything you have to type (repository, URLs) spells it `bueffel`.

The first exercises practise declension: articles, _ein/kein_ words, adjective endings and noun endings, based on the tables in [German Declination.md](German%20Declination.md).

- **Use it online:** <https://raduw.github.io/bueffel/>
- **Source:** <https://github.com/RaduW/bueffel>

## How to run it

The project uses [Vite](https://vite.dev/) with TypeScript and React. You need [Node.js](https://nodejs.org/) and npm.

Install dependencies (once):

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Then open the URL Vite prints, usually <http://localhost:5173> (or the next free port, such as 5174, if another dev server is already running). The page reloads when you edit the source.

To expose the dev server to other devices on your network, run `npm run dev -- --host`.

**Production build**

```sh
npm run build     # type-checks with tsc, then writes the static site to dist/
npm run preview   # serves dist/ locally to check the build
```

The `dist/` folder is a plain static site that you can host anywhere.

> Statistics are stored per origin, so the dev server (`localhost:5173`) and the preview server (`localhost:4173`) keep separate statistics.

## Online version (GitHub Pages)

The app is published at <https://raduw.github.io/bueffel/>.

Every push to `main` builds and deploys the site automatically, using the workflow in `.github/workflows/deploy.yml`. You can also run it by hand from the repository's **Actions** tab (**Deploy to GitHub Pages → Run workflow**).

One-time setup: in the repository on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Phones

The page adapts to the screen. On phones (and in windows narrower than 640px) it switches to a compact layout with large tap targets and **Skip** / **Next** in a bar at the bottom of the screen, within thumb reach. The compact layout leaves out the per-exercise table, and **Reset statistics** is in the settings sheet instead. Phones in landscape get the compact layout too. Switching layouts (turning the phone, resizing the window) keeps the current question and statistics.

## Installing it as an app

The app is a Progressive Web App (PWA). You can install it from the [online version](https://raduw.github.io/bueffel/), and it then works offline. It installs as **Büffel**:

- **Chrome / Edge (desktop or Android):** click the install icon in the address bar, or use the menu → **Install app** (or **Add to Home screen**).
- **Safari on iPhone / iPad:** tap **Share → Add to Home Screen**.
- **Safari on Mac:** **File → Add to Dock**.

Updates install automatically: when a new version is deployed, the app picks it up the next time you open it.

The service worker only runs in production builds (`npm run build` / `npm run preview`, or the online version), not in `npm run dev`.

## How to use it

The start page lists the exercises as cards: **Declension practice** and **Declension in sentences**. Click one to open it. Clicking the icon or the name **Büffel** at the top opens the **About** dialog (what the app is, privacy, version, source link); the gear icon on the start page opens the app settings (the theme: device, light or dark). The back arrow next to the exercise's title finishes it and returns to the start page; leaving a question you've already started counts like **Skip** (it isn't counted). Each page has its own address (`#/declension`, `#/sentences`), so the browser's Back button and bookmarks work.

**Deklination**

1. Click the gear icon next to the title to open **Settings**, and choose:
   - **Exercises:** one or more of
     - definite article + noun (_der Mann_)
     - ein / kein / mein … + noun (_einen Mann_)
     - adjective + noun, no article (_alter Mann_)
     - der + adjective + noun (_dem alten Mann_)
     - ein / kein + adjective + noun (_einem alten Mann_)
   - **Nouns:** the core set (Mann, Kind, Frau, Leute), more nouns, or n-nouns (Junge, Student …)
   - **Gender / number:** any mix of maskulin, neutrum, feminin and Plural (e.g. only maskulin + Plural)
   - **Cases:** Nominativ, Akkusativ, Dativ, Genitiv
   - **Appearance:** **Device** (default) follows your device's light/dark setting; **Light** or **Dark** overrides it.

   Close the dialog with **Done**, Escape, or a click outside it. Changes are saved straight away. The dialog stays open, with a message saying what's missing, until the settings allow at least one question: at least one exercise, noun group, gender and case, and nouns of the chosen genders in the chosen groups.
2. Each question shows a case, a noun with its gender (or *Plural*), and an adjective if the exercise uses one.
3. Click the right form in each row of options:
   - **Green** means correct, and that row is locked.
   - **Red** means wrong. Keep trying until you find the right one.
4. When every word is solved, click **Next** or press **Enter**.

**Skip** moves to a new question. Skipping a question you've already started resets your streak.

**Declension in sentences**

A whole sentence is completed one word at a time, e.g. *D__ alt__ Mann__ (♂) sieht d__ klein__ Hund__ (♂).* Each noun's gender is given in grey brackets after it: ♂ maskulin, ♀ feminin, ⚲ neutrum, ⚤ plural. The gap being filled is highlighted, and below the sentence are the options for that word only: wrong choices turn red, the right one fills the gap and the options move on to the next word. A sentence solved without mistakes moves on by itself; after a mistake it stays, with the case and gender of each noun phrase written in front of it (*(Nom m) Der alte Mann sieht (Akk pl) die kleinen Kinder.*), until you click **Next** or press **Enter**. The **?** button explains the exercise.

The sentences come from `declination-exercises.md`: 44 sentences with one, two or three noun phrases, in all four cases. Each noun phrase takes one of five forms, chosen at random: definite article + noun (*der Mann*), ein/kein/mein … + noun (*einen Mann*), adjective + noun (*alte Leute*; only in the plural, as countable nouns need an article in the singular), definite article + adjective + noun (*dem alten Mann*), and ein/kein/mein … + adjective + noun (*einem alten Mann*). Nouns are matched to the sentence (only people buy or give, cats sit on furniture, and so on). Not included yet: n-nouns (*Student*, *Junge* …), sentences that need *ein/kein*, and sentences where the article would merge with the preposition (*beim*, *vom*, *im*). The header shows the same tally as in Declension practice (shown, success, errors, accuracy, streak), counting each noun phrase as one puzzle: a sentence with two noun phrases counts two, and a phrase is a success when all its words were right at the first try. The **Results** table breaks this down by case and form. Skipped sentences don't count. The gear icon opens this exercise's settings: which **cases**, **forms**, **genders / numbers** and **noun phrases per sentence** (one, two, three) to practise, which **ein-words** appear (only *ein, kein*, or also *mein, dein …*), and **Reset statistics** / **Clear history**. A noun phrase outside your choice (e.g. the Nominativ subject when you practise only Dativ) is filled in already, in italics in its own colour, and isn't counted. Once all words of a noun phrase are filled in, they take the colour of its case (Nominativ blue, Akkusativ orange, Dativ green, Genitiv purple, as in the declension tables); until then they're dark grey, so the colour doesn't give the case away; after mistakes the notes like (Dat pl) show the case in that colour, the gender in grey. If no sentence fits the chosen combination (e.g. only Nominativ + only Plural: subjects are always singular), the dialog says so and stays open.

## Statistics

The header shows:

- **shown:** how many puzzles you've finished. A puzzle is one question in Declension practice, and one noun phrase in Declension in sentences
- **success:** how many of those you solved without a wrong click
- **errors:** how many had at least one wrong click
- **accuracy:** the share of puzzles with no mistakes
- **streak:** how many puzzles in a row you've solved without a mistake

Only finished puzzles count: skipping, or leaving the exercise in the middle of a question, changes nothing.

Both exercises keep their numbers the same way: a table of results per combination of tags (Declension practice: exercise, case and gender; Declension in sentences: case and form), each with attempts, successes and wrong clicks. The header tally and the tables below it are sums over this table.

Statistics and settings are saved in the browser's `localStorage`, one key per exercise, so they persist between visits:

- `bueffel-ex-declension-v1`: Declension practice: its exercise, noun, gender and case selections, and its statistics
- `bueffel-ex-declension-sentences-v1`: Declension in sentences: its settings and statistics
- `bueffel-theme`: the theme (`system`, `light` or `dark`)

**Reset statistics** (in the exercise's settings) clears that exercise's statistics but keeps its settings and its daily history.

### Daily history (IndexedDB)

The app also keeps a permanent log in the browser's IndexedDB (database `bueffel-history`, store `results`), with one record per calendar day and exercise. It isn't shown in the app yet. Each record holds the day's results in the same shape as the statistics above (per tag combination: attempts, successes, wrong clicks). **Reset statistics** does not clear this history; to delete an exercise's history, use **Clear history** in its settings.

To look at it, open the browser's developer tools: **Application → IndexedDB → bueffel-history → results** in Chrome or Edge, or **Storage → Indexed DB** in Firefox and Safari. The app also asks the browser to keep its storage permanently; Firefox may show a prompt for this.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page (Vite entry point) |
| `src/core/` | Logic without UI: declension tables, nouns, exercises, questions, statistics, settings, storage |
| `src/core/scores.ts` | Results per tag combination, shared by all exercises |
| `src/core/history.ts` | Daily history in IndexedDB |
| `src/ui/useExerciseProgress.ts` | Loads and saves an exercise's settings and statistics, and writes its history |
| `src/ui/` | Shared React components: `App.tsx` (shows the start page or an exercise, by URL hash), `Home.tsx` (start page: one card per exercise), `exercises.ts` (the list of exercises), `Header`, `Modal` |
| `src/ui/declension/` | The Deklination exercise; `Declension.tsx` holds its state and lays out the page |
| `src/core/gapfill/` | gapFill, a reusable kind of exercise (fill a sentence gap by gap from options): the exercise interface, the template parser, the progress and scoring logic |
| `src/core/sentences/` | gapFill exercise definitions; `declensionSentences.ts` is "Declension in sentences" |
| `src/ui/gapfill/` | The page for any gapFill exercise: sentence, options, help dialog, results |
| `src/main.tsx` | Entry: loads the styles and renders `App` |
| `src/style.css` | Styling (light and dark mode); the compact layout's rules are at the end, under `.compact` |
| `public/favicon.svg` | Browser tab icon |
| `public/*.png` | App icons for installing the PWA (Android, iOS, desktop) |
| `icons/` | Icon sources (SVG): `bison.svg` (the app icon), its maskable variant, and `bison-head.svg`, an alternative not used yet. `icons/build.sh` regenerates the icons in `public/` (needs `rsvg-convert`) |
| `vite.config.ts` | Vite config: relative `base` (so the build works on GitHub Pages) and the PWA manifest and service worker (via `vite-plugin-pwa`) |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| `German Declination.md` | The grammar reference the exercises are based on |

To add nouns or adjectives, edit `NOUN_POOLS` in `src/core/nouns.ts` or `ADJECTIVES` in `src/core/grammar.ts`. Each noun lists the forms offered as choices in `opts`, and that list must include every correct form of the noun.
