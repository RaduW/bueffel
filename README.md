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

## Statistics

The header shows:

- **shown:** how many questions you've answered
- **success:** how many of those you solved without a wrong click
- **errors:** how many weren't a success (at least one wrong click, or started and then skipped)
- **accuracy:** the share of questions with no mistakes
- **streak:** how many questions in a row you've solved without a mistake

The table below breaks these numbers down by exercise (wide layout only).

A question only counts once you click your first answer, so reloading the page doesn't change the numbers.

Statistics and settings are saved in the browser's `localStorage`, so they persist between visits:

- `bueffel-state-v1`: statistics and the exercise, noun, gender and case selections
- `bueffel-theme`: the theme (`system`, `light` or `dark`)

**Reset statistics** clears these statistics but keeps your settings and the daily history below.

### Daily history (IndexedDB)

The app also keeps a permanent log with one record per calendar day, in the browser's IndexedDB (database `bueffel-history`, store `days`). It isn't shown in the app yet. Each day records questions started (`shown`), questions solved without a mistake (`perfect`) and wrong clicks (`mistakes`). These are kept as a total and broken down by exercise, case and gender. **Reset statistics** does not clear this history; to delete it, use **Settings → Clear history**.

To look at it, open the browser's developer tools: **Application → IndexedDB → bueffel-history → days** in Chrome or Edge, or **Storage → Indexed DB** in Firefox and Safari. The app also asks the browser to keep its storage permanently; Firefox may show a prompt for this.

## Files

| File | Purpose |
|---|---|
| `index.html` | The page (Vite entry point) |
| `src/core/` | Logic without UI: declension tables, nouns, exercises, questions, statistics, settings, storage |
| `src/core/history.ts` | Daily history in IndexedDB |
| `src/ui/` | React components; `App.tsx` holds the state and lays out the page |
| `src/main.tsx` | Entry: loads the styles and renders `App` |
| `src/style.css` | Styling (light and dark mode); the compact layout's rules are at the end, under `.compact` |
| `public/favicon.svg` | Browser tab icon |
| `public/*.png` | App icons for installing the PWA (Android, iOS, desktop) |
| `icons/` | Icon sources (SVG): `bison.svg` (the app icon), its maskable variant, and `bison-head.svg`, an alternative not used yet. `icons/build.sh` regenerates the icons in `public/` (needs `rsvg-convert`) |
| `vite.config.ts` | Vite config: relative `base` (so the build works on GitHub Pages) and the PWA manifest and service worker (via `vite-plugin-pwa`) |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| `German Declination.md` | The grammar reference the exercises are based on |

To add nouns or adjectives, edit `NOUN_POOLS` in `src/core/nouns.ts` or `ADJECTIVES` in `src/core/grammar.ts`. Each noun lists the forms offered as choices in `opts`, and that list must include every correct form of the noun.
