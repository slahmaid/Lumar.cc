# Programs cards — design

Date: 2026-07-24

## Goal

Add a display-only programs section under the Welcome marquee so visitors can see the four focus areas LUMAR helps with.

## Placement

- Inside `#smooth-content`, directly after `.text-marquee`
- Section `id="programs"` for the existing menu link

## Content

| Card | Title | Body | Image |
|------|-------|------|-------|
| 1 | Medicine & health | Human medicine, general medicine, dentistry, nursing, physiotherapy — mostly at Aydın, Medipol, Kent. | `ScrollSmoother/medipol.webp` |
| 2 | Engineering & IT | Software, AI, cybersecurity at BAU and Bilgi; labs are English-medium. | `ScrollSmoother/bau.webp` |
| 3 | Business & law | International business, logistics, law (Bilgi), public admin. | `ScrollSmoother/bilgi.webp` |
| 4 | Design & media | Fashion, film, game design — smaller intakes; portfolio sometimes required. | `ScrollSmoother/kent.webp` |

## Layout (approach A)

- Optional small uppercase label + one short section headline
- 2×2 image-led grid: photo (4:3) above title + body
- **2 columns on all breakpoints** (including mobile), with tighter gaps and slightly smaller type on small screens
- Typography/color match page: Poppins titles, Helvetica body, `#0c1e36`
- No borders, shadows, radii, or links

## Motion

- Scroll reveal consistent with after-section (opacity/y or image clip), `once: true`
- No click/hover navigation

## Out of scope

- New image assets, WhatsApp links, filters, detail pages
