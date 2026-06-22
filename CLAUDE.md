# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install      # install dependencies
npm run dev      # dev server on 0.0.0.0 with hot reload
npm run build    # production build
npm run preview  # preview the production build
```

There are no tests or linting scripts.

## Project overview

Static HTML prototype for the **KlaipedON** tourism website (Klaipėda, Lithuania). The purpose is rapid design iteration before a WordPress + ACF handoff. The stack is intentionally minimal: **HTML + Tailwind CSS 4 + vanilla JS**, bundled with Vite.

## Architecture

### Pages
10 multi-page HTML files, each a standalone page. Vite's `rollupOptions.input` in `vite.config.js` lists every entry point. Adding a new page requires adding it there.

```
index.html                         Home
apie/index.html                    About
gyvenk/index.html                  Living (Gyvenk)
atrask/dviraciu/index.html         Cycling guide
naujienos/index.html               News archive
naujienos/carmina-burana/index.html  News detail
renginiai/index.html               Events archive
renginiai/parodos/index.html       Exhibitions
renginiai/kamaniu-silelis/index.html  Event detail
praneskite-apie-rengini/index.html  Submit an event
```

### JS entry point (`src/main.js`)
Does three things:
1. Resolves `data-asset="key"` attributes on `<img>` elements to hashed Vite asset URLs via an explicit `assetMap`.
2. Calls `initSiteUI()` from `src/scripts/site-ui.js`.
3. Registers Lucide icons — only the icons listed here are available; add new ones explicitly.

**Adding an asset:** import it in `src/main.js`, add it to `assetMap` with its key, then reference it in HTML as `<img data-asset="your-key">`.

### UI logic (`src/scripts/site-ui.js`)
Single exported function `initSiteUI()` that wires up all interactive behaviour via `querySelector` / `querySelectorAll` on `data-*` attributes. Main responsibilities:

- Mobile menu (clone of desktop nav, `data-menu-toggle` / `data-mobile-menu`)
- Header scroll state (`data-site-header` gets `is-scrolled`)
- Accordion panels (`data-accordion-trigger` + `aria-controls`)
- Hover image preview for accordion triggers (`data-accordion-hover-preview`)
- Events carousel with auto-scroll and cloned infinite loop (`data-events-carousel`)
- Attractions tab/slider (`data-attractions-slider`)
- Home news tabs (`data-home-news-tabs`)
- Category filter pills (`data-category-filter`) and event card visibility (`data-event-card`)
- Full events filter form with date picker and custom selects
- Google Maps initialisation (lazy-loads Maps API if `window.KLAIPEDON_GOOGLE_MAPS_API_KEY` is set)
- IntersectionObserver reveal animations (`motion-reveal` / `is-visible`)

### Styles (`src/styles.css`)
Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, not the v3 PostCSS setup). Custom CSS properties are defined in `:root` and used throughout. Design tokens:

| Token | Value |
|---|---|
| `--color-day` | `#2f5fd6` (primary blue) |
| `--color-dusk` | `#1f348a` |
| `--color-night` | `#071a44` |
| `--color-paper` | `#ffffff` |
| `--color-soft-paper` | `#f4ede9` |
| `--font-sans` | Plus Jakarta Sans |

## WordPress handoff conventions

HTML uses data attributes to signal the WordPress/ACF mapping:

| Attribute | Meaning |
|---|---|
| `data-wp-partial` | Expected WordPress `template-parts` path |
| `data-acf-field` | Single ACF field key |
| `data-acf-repeater` | ACF Repeater field |
| `data-acf-sub-field` | Sub-field inside a repeater row |

The full ACF field list is in `docs/ACF-MAP.md`. Architecture rationale is in `docs/HANDOFF.md`.

## Design principles

- Keep JS minimal and isolated; each behaviour is wired from a single `data-*` selector.
- Semantic HTML matters more than framework abstractions -- it maps directly to PHP partials.
- Tailwind utilities first; component-level CSS lives in `styles.css` only when utility classes become unwieldy.
