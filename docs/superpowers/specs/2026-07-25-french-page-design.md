# French page (`/fr/`) — design

## Goal
Duplicate the English LUMAR landing page as a full French version at `/fr/`, with an EN/FR switcher in the hamburger menu on both pages.

## Decisions
- **Approach:** Standalone `fr/index.html` (translated copy), shared CSS/JS/images via `../` paths.
- **Switcher:** Menu items after Contact — English ↔ Français; current language marked with `aria-current="page"`.
- **Deploy:** Copy `fr/index.html` into `_site/fr/` in GitHub Pages workflow.
- **Out of scope:** JS i18n, auto language redirect, separate French assets.

## Content rules
- Translate all UI copy (nav, hero, about, programs, packages, contact, FAQ, aria-labels, placeholders, form labels).
- Keep brand/university names, MAD amounts, and phone placeholder format as on English.
- Set `lang="fr"` on the French document.

## Files
| File | Change |
|------|--------|
| `fr/index.html` | New French page |
| `index.html` | Add language links in menu |
| `styles.css` | Minimal styles for current-language menu state if needed |
| `.github/workflows/deploy-pages.yml` | Include `fr/` in `_site` |
