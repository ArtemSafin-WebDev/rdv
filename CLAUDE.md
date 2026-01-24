# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a vanilla HTML/CSS/JavaScript frontend project for RDV (a 1C digital solutions company). The site is built without a build system or framework - all files are served directly.

## Development Environment

- **Development server**: Use any local web server (e.g., `python3 -m http.server 8000` or VS Code Live Server extension)
- **CSS rem units**: Uses 10px base (1rem = 10px), configured in `.vscode/settings.json` for the px-to-rem extension

## Architecture

### File Structure

- `index.html` - Main landing page with all sections
- `vendor/` - Third-party and legacy files
  - `base.css` - Base styles including font definitions and reset
  - `main.js` - Legacy main JavaScript file
  - `backend.js` - Backend integration and form handling
  - `sprite-multi.svg` - SVG icon sprite
- `new.css` - Component-specific styles (sections, cards, sliders)
- `white-header.css` - Styles for white/dark header variants
- `complexApproach.js` - Tab switching functionality for the "complex approach" section
- `ourTeamSlider.js` - Swiper slider initialization for team members
- `img/` - All image assets (organized by section)
- `local/static_backend_2/` - Legacy assets from previous version

### JavaScript Modules

Both JavaScript files use ES6 modules (`type="module"` in HTML):

- **complexApproach.js** (index.html:268-520): Manages tab navigation with synchronized desktop tabs and mobile accordion
  - Desktop: `.complex-approach__tabs-nav-btn` buttons
  - Mobile: `.complex-approach__tabs-item-btn` accordion buttons
  - Both control same tab items (`.complex-approach__tabs-item`)

- **ourTeamSlider.js** (index.html:599-777): Initializes Swiper carousel for team member cards
  - Uses Swiper from CDN (v12)
  - Auto-width slides with pagination
  - Configured in `.our-team` section

### CSS Architecture

The project uses BEM methodology for class naming:
- Block: `.section-name` (e.g., `.digital-solutions`)
- Element: `.section-name__element` (e.g., `.digital-solutions__heading`)
- Modifier: `.section-name__element--modifier` (e.g., `.more-than-partner__card-text--mobile-limited-width`)

Responsive design is handled with mobile-first breakpoints at 640px.

### External Dependencies

Loaded via CDN:
- Swiper.js v12 (slider/carousel)
- Google Fonts (Inter family)

### Page Sections

All sections are contained in `index.html`:
1. **digital-solutions** - Hero section with expertise cards
2. **awards** - Company achievements and certifications
3. **project-metodology** - CEO quote with methodology photo
4. **more-than-partner** - Three value proposition cards
5. **complex-approach** - Tabbed content showing services (includes interactive tabs)
6. **system-approach** - Numbered list with icon cards
7. **our-team** - Team member carousel (includes Swiper slider)

## Common Tasks

### Testing Interactive Features

To test tab functionality:
```bash
# Open index.html in browser
# Click tabs in "complex-approach" section (around line 268)
# On mobile, test accordion buttons
```

To test team slider:
```bash
# Open index.html in browser
# Scroll to "our-team" section (around line 599)
# Test swipe/drag on team member cards
```

### Image Optimization

The project uses `<picture>` elements with responsive images:
- Desktop: Standard `.webp` images
- Mobile (max-width: 640px): `-mobile.webp` variants

### Working with Styles

When modifying CSS:
- `vendor/base.css` contains fonts, CSS custom properties, and global styles (legacy, avoid modifying)
- `new.css` contains all component-specific styles organized by section
- `white-header.css` contains styles for white/dark header color variants
- Use rem units (10px = 1rem per project convention)
- Maintain BEM naming convention
- Mobile styles are defined in `@media all and (max-width: 640px)` queries

## Notes

- No build process required - changes are immediately visible on page refresh
- All paths are absolute (starting with `/`)
- The `local/` directory contains legacy files that may not be actively used
- Console.log statement in `ourTeamSlider.js:5` can be removed in production
