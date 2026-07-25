# Arabic page (`/ar/`) — design

## Goal
Full Arabic RTL duplicate of the LUMAR landing page at `/ar/`, with Cairo + Tajawal typography and correct line spacing.

## Decisions
- **Path:** `ar/index.html` (`lang="ar"` `dir="rtl"`)
- **Fonts:** Cairo (display/headings), Tajawal (body) via Google Fonts
- **RTL:** Mirrored hamburger, CTAs, FAQ chevrons, pricing checks, select arrow; phone field stays `dir="ltr"`
- **Typography:** No Latin negative letter-spacing; no forced uppercase on Arabic; body line-height ~1.85, body text ~1.9
- **Switcher:** English / Français / العربية on all three pages
- **Deploy:** Copy into `_site/ar/`

## Out of scope
- Dialect localization beyond MSA; separate Arabic CSS file
