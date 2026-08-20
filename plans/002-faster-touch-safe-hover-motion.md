# 002 — Make hover motion fast and touch-safe

- **Status**: DONE
- **Commit**: a8b50bc
- **Severity**: MEDIUM
- **Category**: Easing & duration / Accessibility / Performance
- **Estimated scope**: 1-2 files, roughly 15 declarations

## Problem

High-frequency project and service card hovers take 500-600ms, which is slow for a pointer response and exceeds the under-300ms UI budget. The active page also contains hover transforms that are not gated to fine pointers, so touch browsers may retain a hover state after tapping.

Current code:

```css
/* src/styles/global.css:156 */
.service-card img { object-fit: cover; transition: transform 600ms cubic-bezier(.22, 1, .36, 1), filter 300ms ease; }

/* src/styles/global.css:163-165 */
.service-card-arrow { ... transition: transform 220ms ease; }
.service-card:hover img, .service-card:focus-within img { filter: saturate(1.08); transform: scale(1.05); }
.service-card:hover .service-card-arrow, .service-card:focus-within .service-card-arrow { transform: translate(3px, -3px); }

/* src/styles/global.css:187-190 */
.featured-card-image img, .project-tile-image img { ... transition: transform 550ms cubic-bezier(.22, 1, .36, 1); }
.featured-card:hover img, .project-tile:hover img { transform: scale(1.045); }
.featured-card-image span, .project-tile-image span { ... transition: opacity 180ms ease, transform 180ms ease; }
.featured-card:hover span, .featured-card:focus-visible span, .project-tile:hover span, .project-tile:focus-visible span { opacity: 1; transform: none; }
```

The same issue affects transform hovers on `.button`, `.hero-1-eyebrow`, `.service-row`, `.more-panel-links a`, and `.locale-switcher-button` at `src/styles/global.css:75, 105, 107, 172, 351, 427`.

The layout script also contains a separate `500ms` GSAP hover path for `.project-image-wrap img`, but the rendered project cards use `.project-tile` and `.featured-card`, not `.project-image-wrap` (`src/layouts/BaseLayout.astro:191-194`, `src/pages/projects/index.astro:30-32`). It does not improve the active card surface and should not remain as a competing hover convention.

## Target

For the active CSS card image hovers, use `180ms ease` for transform and filter. Keep the existing scale amounts. The target shape is:

```css
.service-card img,
.featured-card-image img,
.project-tile-image img {
  transition: transform 180ms ease, filter 180ms ease;
}
```

Keep the arrow and affordance fades at `180ms ease`. Put transform-based hover selectors inside this exact media query so they only apply to a fine pointer:

```css
@media (hover: hover) and (pointer: fine) {
  /* transform-based hover rules only */
}
```

Keep `:focus-visible` transform/opacity feedback outside that media query so keyboard users retain a visible affordance. Color-only `:hover` rules may remain available to the existing CSS cascade, but do not leave a transform-only hover rule ungated.

Remove the dead `.project-image-wrap img` mouseenter/mouseleave GSAP block from `src/layouts/BaseLayout.astro:191-194`; the active card surfaces already use CSS selectors, and this selector does not occur in the rendered project pages. Do not replace it with another JS hover listener.

## Repo conventions to follow

- CSS is the existing mechanism for predetermined hover motion; keep the card behavior in `src/styles/global.css`.
- Existing affordance transitions already use `180ms ease` at `src/styles/global.css:189`; use that exact duration/curve for the image transition.
- The audit requires `@media (hover: hover) and (pointer: fine)` when a suggestion involves hover motion.

## Steps

1. In `src/styles/global.css`, change the service image transition from `600ms cubic-bezier(.22, 1, .36, 1), filter 300ms ease` to `transform 180ms ease, filter 180ms ease`.
2. Change the featured/project image transition from `550ms cubic-bezier(.22, 1, .36, 1)` to `transform 180ms ease`.
3. Split the card hover rules so image/arrow transform rules are inside `@media (hover: hover) and (pointer: fine)`, while the existing `:focus-within`/`:focus-visible` rules remain keyboard-safe outside it. Preserve the current scale values and arrow translation.
4. Apply the same pointer gating to transform-only hover behavior for `.button`, `.hero-1-eyebrow`, `.service-row .service-arrow`, `.more-panel-links a`, and `.locale-switcher-button`; keep their `:focus-visible` rules available.
5. Remove only the `.project-image-wrap img` GSAP event-listener block from `src/layouts/BaseLayout.astro`. Leave the unrelated heroSphere block untouched.

## Boundaries

- Do NOT change scale distances, card markup, image loading, or the marquee.
- Do NOT add JavaScript hover listeners.
- Do NOT gate keyboard `:focus-visible` feedback behind the pointer media query.
- Do NOT add a new motion library or remove the existing GSAP dependency for unrelated reasons.
- If `.project-image-wrap` is used by newly added markup at execution time, stop and report rather than deleting the listener.

## Verification

- **Mechanical**: run `bun run check` and `bun run build`; both should exit 0. Run `rg -n "duration: 0.5|550ms|600ms|addEventListener\\('mouseenter|addEventListener\\('mouseleave" src/styles/global.css src/layouts/BaseLayout.astro` and confirm there are no active long-duration hover declarations or JS hover listeners. The unused `project-image-wrap` class in `src/components/ProjectCard.astro` may remain because it is outside this plan.
- **Feel check**: on desktop, hover a service card, featured card, and project tile repeatedly; each image should respond promptly and settle within 180ms. Move the pointer rapidly across cards and confirm the transition retargets smoothly.
- On a touch/coarse-pointer emulation, tapping a card must not leave the image scaled or the arrow translated because of a sticky hover state.
- Keyboard-tab to the same cards and buttons; confirm focus-visible affordances still appear.
- **Done when**: active CSS hover motion is 180ms, touch devices do not receive transform hover motion, and the stale GSAP selector is gone.
