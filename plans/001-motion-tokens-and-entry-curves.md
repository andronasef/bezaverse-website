# 001 — Establish shared motion tokens and responsive entry curves

- **Status**: DONE
- **Commit**: a8b50bc
- **Severity**: MEDIUM
- **Category**: Easing & duration / Cohesion & tokens
- **Estimated scope**: 1 file, roughly 20 declarations

## Problem

Motion values are repeated as hand-typed curves, so the hero, mobile navigation, and mobile drawer do not share an explicit vocabulary. The same `cubic-bezier(.22, 1, .36, 1)` appears in unrelated surfaces, while the mobile navigation uses the generic `ease` curve for an entrance.

Current examples in `src/styles/global.css`:

```css
/* src/styles/global.css:40 */
.skip-link { ... transition: transform 180ms ease; }

/* src/styles/global.css:102 */
.hero-1-glow { ... animation: hero-1-glow 5s ease-in-out infinite alternate; }

/* src/styles/global.css:104, 108-110 */
.hero-1-eyebrow { ... animation: hero-1-fade-up 700ms cubic-bezier(.22, 1, .36, 1) both; }
.hero-1-title { ... animation: hero-1-fade-in 800ms cubic-bezier(.22, 1, .36, 1) 80ms both; }
.hero-1-subtitle { ... animation: hero-1-fade-in 800ms cubic-bezier(.22, 1, .36, 1) 180ms both; }
.hero-1-actions { ... animation: hero-1-fade-up 800ms cubic-bezier(.22, 1, .36, 1) 280ms both; }

/* src/styles/global.css:156, 187 */
.service-card img { ... transition: transform 600ms cubic-bezier(.22, 1, .36, 1), filter 300ms ease; }
.featured-card-image img, .project-tile-image img { ... transition: transform 550ms cubic-bezier(.22, 1, .36, 1); }

/* src/styles/global.css:328, 344 */
.primary-nav { ... transition: opacity 180ms ease, transform 180ms ease; }
.more-panel { ... transition: opacity 220ms ease, transform 220ms cubic-bezier(.22, 1, .36, 1); }
```

Entering and exiting UI should use a strong ease-out; trigger-anchored drawers should use the drawer curve. The current generic `ease` on the mobile navigation and the duplicated inline curve make the motion vocabulary harder to tune consistently.

## Target

Add these three tokens to the existing `:root` block in `src/styles/global.css`, after the existing visual tokens:

```css
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1);
```

Replace every UI entrance/exit use of `cubic-bezier(.22, 1, .36, 1)` with `var(--ease-out)`, preserving the existing durations and delays for the hero. Use `var(--ease-out)` for the skip-link transition and mobile primary navigation transition. Use `var(--ease-drawer)` for the mobile `.more-panel` transform transition while retaining its existing `220ms` duration and opacity transition. Leave the card-hover curves to Plan 002. Keep the `5s ease-in-out` ambient glow and `78s linear` marquee unchanged because they are intentional ambient/constant motion.

The resulting declarations should include:

```css
.skip-link { ... transition: transform 180ms var(--ease-out); }
.hero-1-eyebrow { ... animation: hero-1-fade-up 700ms var(--ease-out) both; }
.hero-1-title { ... animation: hero-1-fade-in 800ms var(--ease-out) 80ms both; }
.hero-1-subtitle { ... animation: hero-1-fade-in 800ms var(--ease-out) 180ms both; }
.hero-1-actions { ... animation: hero-1-fade-up 800ms var(--ease-out) 280ms both; }
.primary-nav { ... transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out); }
.more-panel { ... transition: opacity 220ms var(--ease-out), transform 220ms var(--ease-drawer); }
```

## Repo conventions to follow

- All motion currently lives in `src/styles/global.css`; keep the tokens there rather than creating a new stylesheet.
- Preserve the deliberate marketing behavior documented in `DESIGN.md`: no global scroll-reveal system, and ambient non-essential motion remains reduced-motion-safe.
- The existing `180ms` and `220ms` timings are already used for frequent controls and the drawer; do not invent a new duration scale in this plan.

## Steps

1. Edit only `src/styles/global.css` and add the three exact custom-property values to `:root`.
2. Replace the repeated `.22, 1, .36, 1` curve in the hero entrance animations with `var(--ease-out)`.
3. Change `.skip-link` and the mobile `.primary-nav` transform transitions from bare `ease` to `var(--ease-out)`.
4. Change the `.more-panel` transform transition to `220ms var(--ease-drawer)` and its opacity transition to `220ms var(--ease-out)`.
5. Leave `hero-1-glow` and `services-track` timing/curves unchanged, and do not introduce scroll-triggered animation.

## Boundaries

- Do NOT touch Astro markup, scripts, GSAP setup, content, layout, or visual colors.
- Do NOT change hero durations or delays.
- Do NOT change the marquee's `78s linear` loop or the ambient glow's `5s ease-in-out` loop.
- Do NOT add a dependency or a second token file.
- If the cited declarations have drifted from the excerpts at commit `a8b50bc`, stop and report instead of improvising.

## Verification

- **Mechanical**: run `bun run check` and `bun run build`; both should exit 0.
- **Feel check**: open the home page and mobile viewport, trigger the mobile menu and More drawer, and confirm entries start quickly and settle without a generic slow ease. Confirm the More drawer travels from the bottom edge and exits along the same path.
- In DevTools, set animation playback to 10% and confirm the hero entrance uses the shared `--ease-out` value and the drawer uses `--ease-drawer`.
- Toggle `prefers-reduced-motion` and confirm this plan does not remove or change the reduced-motion behavior; that behavior is handled by Plan 003.
- **Done when**: the three tokens exist once in `:root`, all targeted declarations reference them, and the ambient loops remain unchanged.
