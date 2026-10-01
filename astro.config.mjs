// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
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
