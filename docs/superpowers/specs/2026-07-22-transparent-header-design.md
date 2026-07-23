# Transparent Header with Centered Logo — Design

**Date:** 2026-07-22  
**Status:** Approved for planning  
**Scope:** First step of an educational landing page

## Goal

Create a simple educational page shell whose first visible piece is a fully transparent header with a large, centered brand logo.

## Decisions

| Topic | Choice |
|-------|--------|
| Project type | New static educational page |
| File layout | `index.html` + `styles.css` |
| Header content | Logo only (no nav, no CTA) |
| Transparency | Fully clear (`background: transparent`) |
| Logo size | ~90px height (balanced/large); ~64px on small screens |
| Position | Horizontally centered |
| Sticky | No — static for this step |
| Logo asset | `brand/logo.png` |

## Structure

```
/
├── index.html
├── styles.css
├── brand/
│   ├── logo.png
│   └── logo-footer.png
└── docs/superpowers/specs/
    └── 2026-07-22-transparent-header-design.md
```

### `index.html`

- Semantic `<header>` containing a single centered `<img>` pointing at `brand/logo.png`
- Meaningful `alt` text on the logo
- Link to `styles.css`
- Minimal `<main>` placeholder so transparency has content/background behind it

### `styles.css`

- Reset/normalize only as needed for the header
- Transparent header: no background fill, no border, no shadow
- Flexbox (or equivalent) to center the logo
- Vertical padding ~24–32px
- Logo height ~90px, width auto
- Media query: logo height ~64px on small viewports

## Behavior

- Header does not stick or change on scroll
- No navigation or interactive controls in this step

## Out of scope

- Navigation links
- CTA buttons
- Sticky / frost-on-scroll header
- Page body sections beyond a simple placeholder
- Footer (asset `logo-footer.png` reserved for later)

## Success criteria

1. Opening `index.html` shows a centered logo in a fully transparent header
2. Logo reads at ~90px on desktop and scales down on mobile
3. Styles live in `styles.css`, not inline in the HTML
4. No nav or CTA appears in the header
