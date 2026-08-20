# 003 — Preserve useful feedback under reduced motion

- **Status**: DONE
- **Commit**: a8b50bc
- **Severity**: MEDIUM
- **Category**: Accessibility
- **Estimated scope**: 1 file, roughly 15 declarations

## Problem

The reduced-motion rule globally forces every transition and animation to `.01ms`, including focus, button, locale, and other color/opacity feedback. That goes beyond the deliberate design intent in `DESIGN.md`, which says non-essential motion should be disabled, and conflicts with the audit rule that reduced motion keeps useful opacity/color feedback while dropping movement.

Current code:

```css
/* src/styles/global.css:419-423 */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  .hero-1-eyebrow, .hero-1-title, .hero-1-subtitle, .hero-1-actions, .hero-1-glow { opacity: 1; transform: none; animation: none; }
  .services-track { animation: none; }
}
```

The global selector also makes the behavior difficult to reason about: new essential feedback added later will silently become instantaneous, while non-essential transform motion is handled by a broad override rather than by the component that owns it.

## Target

Replace the universal `.01ms` transition/animation override with targeted reduced-motion rules. Keep `scroll-behavior: auto !important`. Disable the non-essential hero entrance and ambient/marquee motion as the current design intends, and remove movement from interactive hover/focus states while retaining color, border, and opacity changes at `180ms ease`.

The reduced-motion section should follow this shape:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto !important; }

  .hero-1-eyebrow,
  .hero-1-title,
  .hero-1-subtitle,
  .hero-1-actions,
  .hero-1-glow,
  .services-track {
    animation: none;
    opacity: 1;
    transform: none;
  }

  .button:hover,
  .button:focus-visible,
  .locale-switcher-button:hover,
  .locale-switcher-button:focus-visible {
    transform: none;
  }

  .button,
  .locale-switcher-button,
  .primary-nav a,
  .more-panel-links a,
  .featured-card-image span,
  .project-tile-image span,
  .service-card-arrow,
  .service-arrow {
    transition-property: color, background-color, border-color, opacity;
    transition-duration: 180ms;
    transition-timing-function: ease;
  }
}
```

Do not set all transitions to zero. Movement-only transitions such as the mobile drawer and menu should be overridden to `opacity 180ms ease` with `transform: none` for their reduced-motion state, while opacity feedback remains visible.

## Repo conventions to follow

- Reduced-motion detection already exists in both CSS and `src/layouts/BaseLayout.astro:187`; keep the existing GSAP `matchMedia` guard.
- The product direction in `DESIGN.md` intentionally removes non-essential ambient motion under reduced motion; preserve that choice.
- The audit's reduced-motion pattern is “keep opacity/color, drop movement,” not a universal instant transition.

## Steps

1. Edit only the `@media (prefers-reduced-motion: reduce)` block in `src/styles/global.css`.
2. Remove the universal `transition-duration`, `animation-duration`, and `animation-iteration-count` declarations.
3. Keep `scroll-behavior: auto !important` and the explicit hero/marquee animation removal.
4. Add reduced-motion overrides for the mobile `.primary-nav`, `.mobile-dock`, `.more-backdrop`, and `.more-panel` that set transform to its settled state and retain an `180ms ease` opacity transition. Do not alter `hidden` timing in `SiteHeader.astro`.
5. Add reduced-motion overrides for interactive hover/focus transforms so they resolve to `transform: none`, while color/border/opacity feedback remains at `180ms ease`.
6. Verify the GSAP guard remains unchanged and still prevents ambient/hover GSAP work when `matchMedia('(prefers-reduced-motion: reduce)')` matches.

## Boundaries

- Do NOT remove reduced-motion support or restore the hero/marquee loops.
- Do NOT use `display: none`, `visibility: hidden`, or `.01ms` as a replacement for the whole reduced-motion policy.
- Do NOT change the normal-motion timings or the browser's native form validation behavior.
- Do NOT modify `DESIGN.md` unless the implementation reveals a direct contradiction that must be documented.
- If a selector listed above is absent or has changed shape, stop and report instead of applying a broad universal override.

## Verification

- **Mechanical**: run `bun run check` and `bun run build`; both should exit 0.
- **Feel check**: enable `prefers-reduced-motion: reduce` in DevTools, reload, and confirm the hero appears without travel or ambient looping, while button/locale focus still changes color or border with a short visible response.
- Open and close the mobile menu and More drawer with reduced motion enabled; confirm there is no spatial travel, but the surface still fades and remains usable.
- With normal motion restored, confirm the existing hero entrance, glow, marquee, and drawer behavior are unchanged.
- **Done when**: reduced motion removes non-essential movement without making useful opacity/color feedback instantaneous or invisible.
