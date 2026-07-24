# Stacking Cards (Programs) — Design Spec

**Date:** 2026-07-24  
**Status:** Approved for implementation after user review of this file  
**Page:** LUMAR landing (`index.html`)

## Goal

Add a vertical stacking-cards section under the “Welcome to Lumar” marquee. As the user scrolls, each card pins to the top; the next card stacks on top while the pinned card scales down slightly.

## Placement

- Insert a new section **after** `.text-marquee`, still inside `.page-after-scroll` / `#smooth-content` (so ScrollSmoother + ScrollTrigger keep working).
- Section id: `programs` (matches existing menu link `#programs`).

## Content

Four program cards:

| # | Title | Supporting line | Image (existing asset) |
|---|--------|-----------------|-------------------------|
| 1 | Medicine | Cut-offs, language tracks, and what Medipol vs others actually ask for | `ScrollSmoother/medipol.webp` |
| 2 | Engineering | From Bau to Bilgi — which faculties fit your bac profile | `ScrollSmoother/bau.webp` |
| 3 | Business | Istanbul campuses where international seats still open mid-cycle | `ScrollSmoother/bilgi.webp` |
| 4 | Prep year | Turkish or English prep when your scores need one more runway | `ScrollSmoother/iau.webp` |

Visual treatment: **full-bleed campus image**, dark gradient from bottom (or left), title + one short line overlaid. No extra chrome, badges, or card borders beyond what’s needed for readable type.

## Interaction (Approach 1 — per-card pin)

1. Each `.stack-card` is roughly viewport height (min ~100vh / safe-area aware on mobile).
2. When a card’s top hits the top of the viewport, it **pins**.
3. While the following card scrolls up to cover it, the pinned card:
   - **scales down** to ~0.92–0.95
   - slightly **dims** (brightness or overlay opacity)
4. The incoming card sits at a higher z-index so it clearly stacks on top.
5. After the last card finishes its pin distance, pinning ends and normal scroll continues.
6. Prefer ScrollTrigger `pin` + scrubbed scale/opacity per card (not a single mega scrub timeline for the whole section).

## Layout & style

- Align with existing tokens: Poppins for titles, body stack for supporting line, color `#0c1e36` / white text on image.
- Section intro optional: one small heading (“Programs”) above the stack if it doesn’t clutter; default is **cards only** under the marquee.
- Mobile: same pin + scale behavior; keep type readable (`clamp`); avoid heavy 3D that previously caused mobile issues.
- Respect `prefers-reduced-motion`: show stacked/static cards without pin/scale scrub.

## Out of scope

- Horizontal pin gallery changes
- New image assets
- CMS / dynamic program list
- CTA buttons on each card (can add later)

## Success criteria

- Desktop and mobile: cards visibly pin, scale down, and layer as described.
- No blank/missing content if GSAP fails (cards remain readable statically).
- Menu `#programs` scrolls to this section.
- ScrollSmoother section above/below still works without layout jumps.
