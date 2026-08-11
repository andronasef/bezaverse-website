# Design System

## Direction

Working identity mirrors the six2eight reference so the composition can be judged honestly. The future brand should be swappable through tokens and content data.

## Color

- Canvas: `oklch(96% 0.018 86)` warm paper
- Ink: `oklch(12% 0.018 82)` deep charcoal
- Muted ink: `oklch(44% 0.03 82)` secondary copy
- Accent: `oklch(78% 0.2 132)` electric lime
- Purple: `oklch(46% 0.16 300)` vivid violet
- Dark section: `oklch(12% 0.02 84)` near-black
- Dark text: `oklch(97% 0.012 90)` warm white

## Typography

Use `Manrope` for the working build, with system fallbacks. Large headlines use tight tracking and a strong weight contrast. Body copy stays at 1rem or larger with a 65ch maximum measure.

## Layout

Use a 4pt base spacing rhythm with generous section breaks. The desktop grid is asymmetric, while mobile collapses into a single readable column. Keep cards sparse and use image blocks, rules, and whitespace as the main grouping devices.

## Components

- `SiteHeader`: sticky, compact, keyboard-accessible, with a mobile menu.
- `ProjectCard`: image-led project preview with category and arrow affordance.
- `SectionIntro`: eyebrow, heading, and supporting copy pattern.
- `FaqList`: native details/summary disclosure for accessible progressive content.
- `ContactForm`: labeled inputs with inline validation and success state.

## Motion

GSAP reveals `[data-reveal]` elements on entry and uses a subtle image lift on project hover. All motion is disabled when `prefers-reduced-motion: reduce` matches.
