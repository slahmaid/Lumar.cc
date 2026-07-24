# Contact lead form — design

Date: 2026-07-24

## Goal

Add a lead form under the pricing slider (`#contact`) matching the uploaded field set and LUMAR page theme.

## Placement

After `#packages`, `id="contact"`.

## Fields

| Field | Control | Notes |
|-------|---------|-------|
| Full name | text | required |
| WhatsApp number | tel/text | helper: country code |
| Desired major | text | |
| Preferred study language | radio cards | English / Turkish |
| High school GPA | text | helper |
| Approximate yearly budget | select | Under 40k / 40–70k / 70–100k / 100k+ MAD |
| Submit | button | “Get my options on WhatsApp” |

## Behavior

- Opens `https://wa.me/YOUR_NUMBER` with prefilled message from form values
- `YOUR_NUMBER` is a single constant in `main.js` to replace later

## Look

- LUMAR navy `#0c1e36`, white inputs, Poppins labels (uppercase like facts)
- Light panel; selected language = navy border; CTA navy fill / white text (or outline matching pricing CTAs)
- No purple; no heavy card chrome beyond a light border panel
