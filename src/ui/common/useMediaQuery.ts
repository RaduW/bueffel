import { useSyncExternalStore } from 'react'

// Whether a CSS media query matches, updated when it changes (e.g. turning the phone)
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    onChange => {
      const mql = matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => matchMedia(query).matches,
  );
}
