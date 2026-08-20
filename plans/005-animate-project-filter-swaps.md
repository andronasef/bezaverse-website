# 005 — Bridge project filter swaps with short transitions

- **Status**: DONE
- **Commit**: a8b50bc
- **Severity**: MEDIUM
- **Category**: Missed opportunities / Preventing a jarring change / Interruptibility
- **Estimated scope**: 2 files, roughly 25 lines

## Problem

The project index filters cards by toggling the native `hidden` property immediately. The grid therefore changes from one set of cards to another with no visual bridge, even though filtering is an occasional action where a short state transition can clarify what changed.

Current markup and script:

```astro
<!-- src/pages/projects/index.astro:29-35 -->
<div class="projects-index-grid">
  {projects.map((project, index) => <a class="project-tile" href={`${base}projects/${project.slug}`} data-category={project.data.category}>
    <div class="project-tile-image"><img ... /><span aria-hidden="true">↗</span></div>
    <div class="project-tile-meta">...</div>
  </a>)}
</div>
<p class="empty-state" hidden ...>No projects match that filter yet.</p>
```

```ts
// src/pages/projects/index.astro:50-59
filterButtons.forEach((button) => button.addEventListener('click', () => {
  const filter = button.dataset.filter ?? 'All';
  filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
  let visible = 0;
  cards.forEach((card) => {
    const show = filter === 'All' || card.dataset.category === filter;
    card.hidden = !show;
    if (show) visible += 1;
  });
  if (emptyState) emptyState.hidden = visible > 0;
}));
```

The current transition inventory has no rule for `.project-tile` opacity or transform, so the cards teleport in and out.

## Target

Use CSS transitions on `opacity` and `transform` only, with the audit's safe initial scale range and a strong ease-out. The resting state must remain fully visible:

```css
.project-tile {
  opacity: 1;
  transform: scale(1);
  transition: opacity 180ms var(--ease-out), transform 180ms var(--ease-out);
}

.project-tile.is-filtering-out {
  opacity: 0;
  transform: scale(.97);
  pointer-events: none;
}
```

When a filter changes, first mark cards that are leaving with `.is-filtering-out`, allow `180ms` for the transition, then set their `hidden` property. Cards entering the result set should be unhidden at their settled state so the grid does not flash from `scale(.97)`. If a user clicks filters again during the 180ms window, cancel the previous timer and compute the new target set from the current `data-category` values; transitions must retarget from the current state rather than restarting a keyframe.

The empty state should remain a non-animated semantic status element: toggle its `hidden` state after computing the final visible count.

## Repo conventions to follow

- The filter behavior is page-local in `src/pages/projects/index.astro`; keep the state logic there.
- Motion should be CSS transitions, not keyframes, because filter clicks can be repeated and transitions retarget from the current state.
- Plan 001 supplies the exact `--ease-out` token; if it has not landed yet, use the exact fallback `cubic-bezier(0.23, 1, 0.32, 1)` in the declaration and replace it with `var(--ease-out)` when Plan 001 is applied.

## Steps

1. Add the `.project-tile` resting and `.is-filtering-out` rules to `src/styles/global.css` near the existing project tile rules.
2. In `src/pages/projects/index.astro`, track the pending hide timer with a local `number | undefined` variable.
3. On each filter click, clear the prior timer, determine `show` for every card, remove `hidden` and `.is-filtering-out` from cards that should be visible, and add `.is-filtering-out` to cards that should leave.
4. Schedule one `window.setTimeout` for `180ms` that sets `hidden = true` only on cards still marked `.is-filtering-out`; remove the class from any card that has become visible before the timer fires.
5. Compute the empty-state count from the final `show` values immediately, so it remains correct while exiting cards finish their fade.
6. Add a reduced-motion override that keeps the filter state change legible but removes the scale movement, using `opacity 180ms ease` only.

## Boundaries

- Do NOT animate height, margin, padding, grid tracks, or the empty-state paragraph.
- Do NOT use `@keyframes` or a global scroll-reveal system.
- Do NOT reorder project cards or alter category matching/localization.
- Do NOT delay keyboard focus or block interaction while the transition runs.
- If the filter code is refactored before execution, stop and report rather than layering a second filtering state machine.

## Verification

- **Mechanical**: run `bun run check` and `bun run build`; both should exit 0.
- **Feel check**: on `/projects`, switch between All and each category. Cards leaving should fade and scale subtly toward `.97` over `180ms`; matching cards should remain readable and appear settled without a pop.
- Click filters repeatedly faster than 180ms. Confirm no stale timer hides a card that belongs to the newest filter and no animation restarts from a fixed keyframe origin.
- Select a category with no matches if one exists; confirm the empty state appears and remains semantically hidden/visible correctly without layout animation.
- With reduced motion enabled, confirm cards fade without scaling and filtering remains fully usable.
- **Done when**: filter changes have a short interruptible opacity bridge, final card visibility is correct after rapid clicks, and no layout properties animate.
