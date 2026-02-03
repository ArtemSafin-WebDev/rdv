# AGENTS.md

## Project Summary
This repository is a static website with a single main HTML entry point, custom CSS, and a few focused JS files. Assets (images and video) live in dedicated folders, and larger third‑party bundles are stored under `vendor/` and `local/static_backend_2/`.

## Structure (High Level)
- `index.html` is the primary document and stitches sections together.
- `new.css` and `white-header.css` provide site styles.
- Custom JS is split by site sections.
- `img/` and `videos/` hold media assets.
- `vendor/` and `local/static_backend_2/` contain third‑party CSS/JS and fonts.

## Key Files
- `index.html`
- `new.css`
- `white-header.css`
- `complexApproach.js`
- `ourSpecialization.js`
- `ourTeamSlider.js`

## Assets
- `img/` includes section‑specific folders such as `awards/`, `complex-approach/`, `digital-expertise/`, `integrator/`, `more-than-partner/`, `our-team/`, `project-metodology/`, `specialization/`, `system-approach/`, plus shared SVGs and `orb.webp`.
- `videos/` includes `1.mp4` and `output.webm`.

## Third‑Party Libraries and Fonts
- `vendor/` contains large bundled files like `base.css`, `main.js`, and `backend.js`.
- `local/static_backend_2/fonts/` contains Proxima Nova font files.
- `local/static_backend_2/js/` includes libraries like jQuery, axios, swiper, and helper scripts (`script.js`, `suggest.js`, `gtm-events.js`).

## Notes for Agents
- Treat this as a static site unless new build tooling is added.
- When editing, keep paths consistent with existing asset locations.
- Prefer small, localized changes to avoid breaking the page.
