// @ts-check
import { defineConfig } from 'astro/config';

// Project site on GitHub Pages: https://fxf61.github.io/penguin-portfolio/
// The base only applies to production builds (and `astro preview`); `astro dev`
// keeps serving at / for local convenience.
const isDev = process.argv.includes('dev');

export default defineConfig({
  site: 'https://fxf61.github.io',
  base: isDev ? '/' : '/penguin-portfolio',
  // Astro 7 defaults to JSX-style whitespace stripping; keep HTML-aware
  // compression so templates behave like the Hugo output we'll port to.
  compressHTML: true,
  markdown: {
    // Emit highlighting as CSS variables (--astro-code-*), mapped to our
    // --code-* tokens in src/styles/code.css. Same tokens drive Hugo's
    // Chroma stylesheet later, so the code theme lives in one place.
    shikiConfig: { theme: 'css-variables' },
  },
});
