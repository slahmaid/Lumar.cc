# Universities stacking cards — design

Date: 2026-07-24

## Goal

Add sticky stacking university cards under `#programs`, matching the `top-main` hero/gallery stack behavior.

## Placement

- Directly after `.programs-section`, inside `#smooth-content`
- Section `id="universities"` (menu link)

## Content

| # | Title | Image |
|---|-------|-------|
| 01 | Bahçeşehir | `ScrollSmoother/bau.webp` |
| 02 | Bilgi | `ScrollSmoother/bilgi.webp` |
| 03 | Medipol | `ScrollSmoother/medipol.webp` |
| 04 | Kent | `ScrollSmoother/kent.webp` |

## Interaction

- CSS `position: sticky` stack (same structure as `top-main`)
- As the next card covers the current one, scrubbed scale (~0.92) + brightness dim via GSAP
- Rounded corners (~50px desktop / ~28px mobile)
- Full-bleed image + bottom gradient + white title / number overlay

## Out of scope

- Links, CTAs, new assets
