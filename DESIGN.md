# Design

## Brand

DryUI is a constraint system for AI-generated interfaces. The visual system should feel engineered and opinionated: rails, checks, terminal traces, and component inventory.

## Color

Use a full palette with distinct jobs:

- Ember: `oklch(65% 0.19 34)` for the primary brand action and logo field.
- Cyan: `oklch(73% 0.14 205)` for signals, verification, and feedback loops.
- Acid: `oklch(82% 0.16 118)` for small proof details only.
- Ink: `oklch(18% 0.035 185)` for text and dark mark interiors.
- Wash: `oklch(97.5% 0.015 168)` for the light docs surface.

Dark mode should be an instrument panel, not a blue SaaS shell: use green-black ink, ember actions, cyan signals, and low-chroma surfaces.

## Typography

Use one strong sans voice with clear weight contrast and a mono support face for commands, traces, tokens, and diagnostics. Keep letter spacing at `0` except short uppercase labels, where positive spacing is allowed.

## Logo

The mark is a squared DryUI `D` built from a filled rail block and a cyan baseline signal. Use it with the lowercase `dryui` wordmark. The mark should remain vector-native wherever possible.

## Layout

The homepage should not read as a centered SaaS template. Lead with an asymmetric hero: copy and calls to action on one side, a live agent loop or diagnostic surface on the other. Subsequent sections should use visible structure, not decorative cards for every item.

## Motion

Use motion to reveal the loop, not to decorate. Honor reduced motion. Avoid layout-property animation.
