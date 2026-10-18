# Deklination üben

A small browser app for practising German declination: articles, _ein/kein_ words, adjective endings and noun endings. It is based on the tables in [German Declination.md](German%20Declination.md).

## How to run it

The project uses [Vite](https://vite.dev/) with TypeScript. You need [Node.js](https://nodejs.org/) and npm.

Install dependencies (once):

```sh
npm install
```

Start the development server:

```sh
npm run dev
```

Then open the URL Vite prints, usually <http://localhost:5173>. The page reloads when you edit the source.

To expose the dev server to other devices on your network, run `npm run dev -- --host`.

**Production build**

```sh
npm run build     # type-checks with tsc, then writes the static site to dist/
npm run preview   # serves dist/ locally to check the build
```

The `dist/` folder is a plain static site that you can host anywhere.

> Statistics are stored per origin, so the dev server (`localhost:5173`) and the preview server (`localhost:4173`) keep separate statistics.

## Online version (GitHub Pages)

The app is published at <https://raduw.github.io/declination-practice/>.

Every push to `main` builds and deploys the site automatically, using the workflow in `.github/workflows/deploy.yml`. You can also run it by hand from the repository's **Actions** tab (**Deploy to GitHub Pages → Run workflow**).

One-time setup: in the repository on GitHub, go to **Settings → Pages** and set **Source** to **GitHub Actions**.

## Phone version

There is a separate page for smartphones, `mobile.html` (online: <https://raduw.github.io/declination-practice/mobile.html>). It has large tap targets and keeps **Skip** / **Next** in a bar at the bottom of the screen, within thumb reach. It leaves out the per-exercise table, and **Reset statistics** is in the settings sheet instead.

Phones opening `index.html` are sent to the phone version automatically (small touch screens only). Each version has a link to the other in its settings: **Phone version** or **Desktop version**. Once you pick one, that choice is remembered on that device. Both versions share the same settings and statistics.

## Installing it as an app

The app is a Progressive Web App (PWA). You can install it from the online version, and it then works offline:

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

The table below breaks these numbers down by exercise (desktop version only).

A question only counts once you click your first answer, so reloading the page doesn't change the numbers.

Statistics and settings are saved in the browser's `localStorage`, so they persist between visits:

- `declination-trainer-v1`: statistics and the exercise, noun, gender and case selections
- `declination-theme`: the theme (`system`, `light` or `dark`)
- `declination-view`: the desktop/phone choice, once you've used the switch link

**Reset statistics** clears these statistics but keeps your settings and the daily history below.

### Daily history (IndexedDB)

The app also keeps a permanent log with one record per calendar day, in the browser's IndexedDB (database `declination-history`, store `days`). It isn't shown in the app yet. Each day records questions started (`shown`), questions solved without a mistake (`perfect`) and wrong clicks (`mistakes`). These are kept as a total and broken down by exercise, case and gender. **Reset statistics** does not clear this history; to delete it, use **Settings → Clear history**.

To look at it, open the browser's developer tools: **Application → IndexedDB → declination-history → days** in Chrome or Edge, or **Storage → Indexed DB** in Firefox and Safari. The app also asks the browser to keep its storage permanently; Firefox may show a prompt for this.

## Files

| File | Purpose |
|---|---|
| `index.html` | Desktop page (Vite entry point); sends phones to `mobile.html` |
| `mobile.html` | Phone page (Vite entry point) |
| `src/app.ts` | Shared logic: declination tables, nouns, questions, statistics |
| `src/history.ts` | Daily history in IndexedDB |
| `src/main.ts` | Desktop page entry: loads the styles and `app.ts` |
| `src/mobile.ts` | Phone page entry: loads the styles, phone overrides and `app.ts` |
| `src/style.css` | Shared styling (light and dark mode) |
| `src/mobile.css` | Phone layout overrides |
| `public/favicon.svg` | Browser tab icon |
| `public/*.png` | App icons for installing the PWA (Android, iOS, desktop) |
| `vite.config.ts` | Vite config: relative `base` (so the build works on GitHub Pages), the two pages, and the PWA manifest and service worker (via `vite-plugin-pwa`) |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| `German Declination.md` | The grammar reference the exercises are based on |

To add nouns or adjectives, edit `NOUN_POOLS` or `ADJECTIVES` in `src/app.ts`. Each noun lists the forms offered as choices in `opts`, and that list must include every correct form of the noun.
