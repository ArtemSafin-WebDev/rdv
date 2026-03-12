# FIGMA_TO_CODE.md

This document defines mandatory rules for converting Figma designs into
HTML/CSS.

These rules must always be followed unless explicitly instructed
otherwise.

---

# Assets

## Image formats

- Raster images **must always be exported as WebP**.
- Vector graphics **must always be exported as SVG**.

## SVG rules

- Never use `preserveAspectRatio="none"` in SVG files.
- Export icons that appear in similar positions in the design using
  **identical frame sizes**.
- Exported images must **never have distorted proportions**.

## Background images

- Background images from the design must be exported **with the frame
  context in which they appear**.
- Do not export raw background images in their original uncropped
  form.

---

# Layout

## Grid usage

- Use **display: grid** for multi-column layouts.
- Use **fr units** for column sizing.
- Use **gap** for spacing between grid items.

Example:

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 2rem;
}
```

## Avoid absolute positioning

- Never use `position: absolute` when elements can be placed in the
  normal layout flow.

## Width usage

- Avoid unnecessary usage of `width: 100%`.

## Wrapper usage

- Do not be afraid to add extra wrappers when it improves layout
  stability or reusability.

---

# Cards and content containers

- Never assign fixed `height` or `min-height` to cards.
- Use **padding** to control spacing.
- Use **aspect-ratio** when it makes sense for media containers.

---

# Spacing

## Normalize spacing values

If spacing values from Figma differ only slightly, normalize them to a
single value.

Prefer **powers of two** or visually consistent values.

Example:

Instead of:

```css
padding: 2.9rem 3.3rem 2.8rem 3.5rem;
```

Use:

```css
padding: 3.2rem;
```

## Use gap instead of margin

When spacing between elements is similar, use **gap** rather than
multiple margins.

---

# Typography

## Font declarations

- Avoid redundant `font-family` declarations.
- Do not redefine `font-family` if it already inherits correctly.

## Heading layout

When adjusting heading width:

1.  Try using `text-wrap: balance`.
2.  Only use `max-width` if balancing does not produce the desired
    result.

---

# Colors

- Do not explicitly set text color if it already inherits from `body`.
- If an element has a background color, always explicitly set a **text
  color** on that element.

---

# Icons

When exporting icons from Figma:

- Icons used in similar contexts must be exported in **identical frame
  sizes**.
- This ensures consistent alignment in layout.

---

# Responsiveness

- Do not implement responsive behavior unless explicitly requested.

---

# Component strategy

## Modifiers

- Avoid unnecessary modifier classes for cards.
- Modifier classes may only be used when components are structurally
  different, not simply because content length differs.

## Content duplication

- Never duplicate markup for desktop and mobile versions of the same
  content.
- Layout must adapt using CSS, not duplicated HTML.

---

# Advanced layout techniques

## Wrapper breaking

If a wrapper becomes problematic on responsive layouts, break it using:

```css
display: contents;
```

---

# Core philosophy

When converting Figma to code:

- Favor **layout systems over manual positioning**.
- Favor **consistent spacing over pixel-perfect copying**.
- Favor **reusable structures over one-off fixes**.
