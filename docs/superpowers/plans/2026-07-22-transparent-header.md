# Transparent Header Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a static educational page shell with a fully transparent header and a large centered logo.

**Architecture:** Two static files — `index.html` for markup and `styles.css` for header/logo rules. Logo asset already exists at `brand/logo.png`. No build step.

**Tech Stack:** HTML5, CSS3 (flexbox, media query)

## Global Constraints

- Logo-only header (no nav, no CTA)
- Fully transparent header background
- Logo height ~90px desktop, ~64px small screens
- Static header (not sticky)
- Styles in `styles.css`, not inline
- Asset path: `brand/logo.png`

---

### Task 1: Page shell with transparent centered logo header

**Files:**
- Create: `index.html`
- Create: `styles.css`

**Interfaces:**
- Consumes: `brand/logo.png`
- Produces: openable `index.html` with transparent centered header

- [ ] **Step 1: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Educational Page</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header class="site-header">
    <img class="site-logo" src="brand/logo.png" alt="Brand logo">
  </header>
  <main class="site-main">
    <!-- Placeholder: page content will go here -->
  </main>
</body>
</html>
```

- [ ] **Step 2: Create `styles.css`**

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-height: 100vh;
}

.site-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 28px 16px;
  background: transparent;
  border: none;
  box-shadow: none;
}

.site-logo {
  display: block;
  height: 90px;
  width: auto;
}

.site-main {
  min-height: 60vh;
}

@media (max-width: 600px) {
  .site-logo {
    height: 64px;
  }
}
```

- [ ] **Step 3: Verify in browser**

Open `index.html` and confirm:
1. Logo is centered
2. Header has no visible background, border, or shadow
3. Logo is ~90px tall on desktop
4. Logo shrinks on a narrow viewport

- [ ] **Step 4: Commit only if the user requests it**

Do not commit unless explicitly asked.
