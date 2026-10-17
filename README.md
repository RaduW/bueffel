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

## How to use it

1. Click the gear icon next to the title to open **Settings**, and choose:
   - **Exercises:** one or more of
     - definite article + noun (_der Mann_)
     - ein / kein / mein … + noun (_einen Mann_)
     - adjective + noun, no article (_alter Mann_)
     - der + adjective + noun (_dem alten Mann_)
     - ein / kein + adjective + noun (_einem alten Mann_)
   - **Nouns:** the core set (Mann, Kind, Frau, Leute), more nouns, or n-nouns (Junge, Student …)
   - **Cases:** Nominativ, Akkusativ, Dativ, Genitiv

   Close the dialog with **Done**, Escape, or a click outside it. Changes are saved straight away. The dialog stays open until at least one exercise, one noun group and one case are selected.
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

The table below breaks these numbers down by exercise.

A question only counts once you click your first answer, so reloading the page doesn't change the numbers.

Statistics and settings are saved in the browser's `localStorage` (key `declination-trainer-v1`), so they persist between visits. **Reset statistics** clears the statistics but keeps your settings.

## Files

| File | Purpose |
|---|---|
| `index.html` | Page layout (Vite entry point) |
| `src/main.ts` | Declination tables, nouns, question logic, statistics |
| `src/style.css` | Styling (light and dark mode) |
| `public/favicon.svg` | Browser tab icon |
| `vite.config.ts` | Vite config (relative `base`, so the build works on GitHub Pages) |
| `.github/workflows/deploy.yml` | Builds and deploys to GitHub Pages on every push to `main` |
| `German Declination.md` | The grammar reference the exercises are based on |

To add nouns or adjectives, edit `NOUN_POOLS` or `ADJECTIVES` in `src/main.ts`. Each noun lists the forms offered as choices in `opts`, and that list must include every correct form of the noun.
