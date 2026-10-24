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

export function navigate(route: string) {
  location.hash = route ? '#/' + route : '';
}
