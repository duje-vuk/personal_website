# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## What This Is

Personal portfolio website for Duje Vukovac. Static site served via Express with Helmet security headers. Salmon (#FAC7B4) / navy (#00213A) color scheme, dark/light theme toggle, responsive design. Contact is via mailto link (no server-side form processing).

## Project Structure

- **`public/`** — All frontend files (served by Express static)
  - **`index.html`** — Main portfolio page (hero, about, projects, experience timeline, contact section)
  - **`style.css`** — All styles; uses CSS custom properties for theming (`--salmon`, `--blue`, etc.)
  - **`script.js`** — Theme toggle, mobile hamburger menu, smooth scroll
  - **`404.html`** — Custom 404 page
  - **`404.js`** — Theme toggle and hamburger menu for 404 page (external to comply with CSP)
  - **`seal.png`** — Logo image
  - **`CV.pdf`** — Resume PDF
- **`server.js`** — Express 5: Helmet security headers, serves `public/`, 404 fallback
- **`CV.tex`** — Resume LaTeX source (not served publicly)
- **`.gitignore`** — Excludes `node_modules/`, `.env`, `*.log`

## Backend

- **Express 5** on port 3000 (`npm start`)
- **No API endpoints** — server only serves static files
- **Security headers**: Helmet middleware (CSP, X-Frame-Options, HSTS, X-Content-Type-Options, etc.)
- **CSP policy**: scripts and connections locked to `'self'`; styles allow `'unsafe-inline'` (needed for 404 page) and fontsource CDN; images allow `data:` URIs (favicon)
- **Static files served from `public/` only** — `server.js`, `package.json` are not exposed
- Unknown routes fall back to `public/404.html`

## Key Patterns

- **Theme toggle**: `[data-theme="light"]` on `<html>` swaps CSS variables. Default (no attribute) is the dark/salmon theme. Persisted in `localStorage`.
- **Wave dividers**: SVG `<path>` elements between sections. Fill colors use `var()` so they respond to theme changes.
- **Responsive breakpoints**: 768px (hamburger menu, single-column) and 480px (tighter spacing).
- **Font**: Satoshi via fontsource CDN.
- **Contact**: `mailto:dvcsmail@gmail.com` link — no server-side form processing.
- **No inline scripts**: All JS is in external files (`script.js`, `404.js`) to comply with CSP `scriptSrc: ['self']`.

## Development

```bash
npm start          # runs server.js on http://localhost:3000
```

No environment variables required.
