import { defineConfig } from 'vite'

export default defineConfig({
  // Relative asset paths, so the build works under any sub-path
  // (e.g. GitHub Pages serves it from /declination-practice/)
  base: './',
})
