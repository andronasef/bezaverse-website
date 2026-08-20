# 004 — Add subtle press feedback to common controls

- **Status**: DONE
- **Commit**: a8b50bc
- **Severity**: MEDIUM
- **Category**: Missed opportunity / Feedback
- **Estimated scope**: 1 file, roughly 8 selectors

## Problem

The site has hover/focus lift on buttons and several controls, but no `:active` response. A user pressing the primary CTA, language switcher, project filter, mobile menu, or mobile dock receives no immediate tactile confirmation before navigation or state change.

Current button transition and hover behavior:

```css
/* src/styles/global.css:74-75 */
.button { ... transition: color 180ms ease, background 180ms ease, border-color 180ms ease, transform 180ms ease; }
.button:hover, .button:focus-visible { color: var(--canvas); background: var(--ink); transform: translateY(-2px); }
```

The same file has no `:active` rule for `.button`, `.locale-switcher-button`, `.project-filters button`, `.menu-toggle`, or `.mobile-dock > a, .mobile-dock > button`.

## Target

Add this exact subtle press response, using transform only and a `160ms ease-out` transition as specified by the audit:

```css
.button:active,
.locale-switcher-button:active,
.project-filters button:active,
.menu-toggle:active,
.mobile-dock > a:active,
.mobile-dock > button:active {
  transform: scale(.97);
  transition: transform 160ms ease-out;
}
```

For controls that already translate on hover/focus, the `:active` transform should intentionally replace the lifted state while pressed. Do not add press animation to body text links, FAQ summaries, or the marquee, where the response would add noise or compete with reading.

## Repo conventions to follow

- All control styling lives in `src/styles/global.css`.
- The existing `.button` transition already includes `transform`; preserve it for returning to the resting state.
- The audit's exact press recipe is `transform: scale(.97)` with `transition: transform 160ms ease-out`; use no larger scale change.

## Steps

1. Add the grouped `:active` selector to `src/styles/global.css` immediately after the common button rules, or split it only if a component's existing transform would be overridden incorrectly.
2. Ensure the rule applies to the desktop CTA buttons, language switcher, project filter buttons, mobile menu toggle, and mobile dock controls.
3. If the grouped selector conflicts with a more specific mobile-dock rule, add the smallest selector-specific correction; do not change the dock layout transform `translateX(-50%)` except while the child control is pressed.
4. Add a reduced-motion override in the same media query used by Plan 003 that preserves the press as a color/opacity response but removes the scale movement.

## Boundaries

- Do NOT add press scale to links that are not controls, FAQ summaries, service rows, or the marquee.
- Do NOT use `transition: all`.
- Do NOT make the scale smaller than `.97` or the duration longer than `160ms`.
- Do NOT add JavaScript event handlers.
- If the common control markup has changed so one selector would catch a non-control element, stop and report.

## Verification

- **Mechanical**: run `bun run check` and `bun run build`; both should exit 0.
- **Feel check**: press and hold each target control on desktop and mobile. Confirm it compresses to `scale(.97)` immediately and returns smoothly on release without affecting layout.
- Keyboard focus must not trigger the pressed scale; only the physical `:active` state should.
- With reduced motion enabled, confirm the control still changes color/opacity but does not visibly scale.
- **Done when**: every listed high-frequency control has subtle press feedback and no unrelated text or data surface animates.
