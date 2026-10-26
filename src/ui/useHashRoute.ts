import { useSyncExternalStore } from 'react'

// The page shown, from the URL's hash: '#/declension' -> 'declension', no hash -> ''.
// Hash URLs need no server setup (GitHub Pages serves one index.html) and keep
// the browser's Back button working between pages.
export function useHashRoute(): string {
  return useSyncExternalStore(
    onChange => {
      addEventListener('hashchange', onChange);
      return () => removeEventListener('hashchange', onChange);
    },
    () => location.hash.replace(/^#\/?/, ''),
  );
}

// Whether the app has moved from one page to another since it opened: then
// the browser's history has a page of ours to go back to
let moved = false;
addEventListener('hashchange', () => { moved = true; });

// Back to the previous page (e.g. the exercise a grammar page was opened
// from); the home page if this is the first page shown
export function goBack() {
  if (moved) history.back();
  else navigate('');
}

export function navigate(route: string) {
  location.hash = route ? '#/' + route : '';
}
