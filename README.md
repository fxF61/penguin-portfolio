# portfolio-redesign — design prototype

Design bible for penguin's security portfolio (higanbana / red-spider-lily
theme, light). Built to be **ported to Hugo** once the design is locked — it is
not the production site. Existing Hugo blog stays untouched.

## Stack
- **Astro** (static, multi-page, no UI framework) — components ≈ Hugo partials, content collections ≈ Hugo content.
- **Plain CSS** with design tokens (`src/styles/tokens.css`) — no Tailwind, nothing to translate.
- **GSAP + Lenis** for motion on atmosphere pages (wired in Phase 1).
- **Pagefind** for search (wired in Phase 5).
- Self-hosted fonts via Fontsource; Japanese kanji subset to 8 glyphs (`public/fonts/`).

## Run (you run the dev server yourself)
```
npm install
npm run dev        # http://localhost:4321
npm run build      # static output → dist/
npm run check      # astro type-check
npm run lilies     # regenerate the flower SVGs
```

## Layout
```
src/
  styles/     tokens · base · lily · code · prose        ← the design system
  components/ Lily · Ornament · SiteHeader · SiteFooter · WriteupCard
  layouts/    Base.astro   (intensity: "atmosphere" | "calm")
  pages/      index · writeups · notes · about · search · 404 · styleguide
  content/    writeups/*.md · notes/*.md   (SAMPLE content — replace at port)
scripts/
  draw-lily.mjs   generative higanbana → src/assets/lilies/*.svg
```

## Design bible
`/styleguide` renders every token, the three font pairings (switch live), all
flower variants/tones, and every component. **This page is the reference for the
Hugo port.**

## Phases
0. **Scaffold + tokens + styleguide**  ← done
1. Landing (hero choreography, GSAP/Lenis)
2. Article template polish (callout remark plugin, copy buttons)
3. Writeups / Notes indexes with filtering
4. About
5. Search (Pagefind) + polish (a11y, OG images, `PORTING.md`)

## Notes for the port
- Code theme is emitted as CSS variables (`--astro-code-*` → `--code-*`); generate a matching Chroma stylesheet from the same `--code-*` tokens.
- `[!note]/[!warning]/[!loot]` callouts render as plain blockquotes until the Phase-2 remark plugin lands; `.callout` styles already exist.
- Handles/links marked `TODO(penguin)` in `SiteFooter.astro` and `about.astro` need real URLs.
