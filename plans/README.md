# Animation plans

Audit stamped at commit `a8b50bc` for the Astro 5 site in this repository.

| # | Plan | Severity | Status | Depends on |
| --- | --- | --- | --- | --- |
| 001 | Establish shared motion tokens and responsive entry curves | MEDIUM | DONE | — |
| 002 | Make hover motion fast and touch-safe | MEDIUM | DONE | 001 recommended |
| 003 | Preserve useful feedback under reduced motion | MEDIUM | DONE | 001 recommended |
| 004 | Add subtle press feedback to common controls | MEDIUM | DONE | 001 and 003 recommended |
| 005 | Bridge project filter swaps with short transitions | MEDIUM | DONE | 001 and 003 recommended |

## Recommended execution order

1. **001** establishes the shared curves without changing the intentional ambient loops.
2. **002** fixes the most visible daily hover problem and removes the stale project-image GSAP path.
3. **003** scopes reduced-motion behavior so later feedback remains accessible.
4. **004** adds the missing press response to common controls.
5. **005** adds an interruptible transition to the project filter state change.

Plans are intentionally source-independent and should be executed against the stamped code. If the cited excerpts have drifted, stop the executor and refresh the plan before improvising.
