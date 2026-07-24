# Pricing slider (packages) — design

Date: 2026-07-24

## Goal

Add a centered 3-plan pricing carousel at the end of the page (`#packages`), starting on STANDARD (Popular).

## Plans (from client table)

| | FREE | STANDARD | VIP |
|--|------|----------|-----|
| Price | 0 MAD | from 4,500 MAD | from 9,500 MAD |
| Orientation call + major advice | ✓ | ✓ | ✓ |
| Application filed within 3 working days | ✓ | ✓ | ✓ |
| Final registration with university | — | ✓ | ✓ |
| Student bank account (Ziraat / Vakıf) | — | ✓ | ✓ |
| Airport pickup + ikamet appointment booking | — | — | ✓ |
| 3 months housing (utilities in) | — | — | ✓ |
| SIM, lease draft, health insurance paperwork | — | — | ✓ |

## Interaction (Approach A)

- Horizontal snap carousel; center card is active
- Initial index = 1 (STANDARD), badge “Popular”
- Drag/swipe + prev/next + dots
- Each card lists only included features (checks)
- CTA → `#contact` (or no-op until contact exists)
- `prefers-reduced-motion`: no fancy transitions

## Look

- LUMAR navy `#0c1e36` / white; Poppins titles; body stack for features
- STANDARD slightly emphasized (border or weight), others quieter when not centered
- No purple; no heavy multi-shadow chrome

## Placement

After universities stack, before end of `#smooth-content`.
