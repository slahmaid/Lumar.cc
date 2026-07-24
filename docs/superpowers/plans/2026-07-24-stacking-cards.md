# Stacking Cards Implementation Plan

> **For agentic workers:** Implement task-by-task. Steps use checkbox syntax.

**Goal:** Add four full-bleed program stacking cards under the marquee with per-card ScrollTrigger pin + scale-down.

**Architecture:** Markup in `index.html` after `.text-marquee`; styles in `styles.css`; GSAP pin/scale in `main.js` inside the existing `prefers-reduced-motion: no-preference` context.

**Tech Stack:** HTML, CSS, GSAP 3.13 ScrollTrigger (+ existing ScrollSmoother)

## Global Constraints

- Section `id="programs"` under marquee inside `#smooth-content`
- Cards: Medicine, Engineering, Business, Prep year with spec copy/images
- Per-card pin; scale ~0.92–0.95 + slight dim; higher z-index on later cards
- Static readable fallback if GSAP fails / reduced motion

---

### Task 1: Markup + CSS

- [x] Add `#programs` stack section HTML after marquee
- [x] Add `.stack-cards` / `.stack-card` styles (full-bleed, gradient overlay, type)

### Task 2: GSAP stacking

- [x] Wire per-card pin + scrubbed scale/filter in `main.js`
- [x] Skip animation under reduced motion; refresh with images

### Task 3: Verify

- [x] Syntax-check `main.js`; confirm section exists in HTML
