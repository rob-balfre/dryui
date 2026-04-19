---
'@dryui/primitives': patch
'@dryui/ui': patch
---

- `@dryui/ui` AppFrame: move `--dry-app-frame-{bg,border,radius,chrome-bg,dot-size,dot-close,dot-min,dot-max}` defaults from the root rule into `var(name, fallback)` at the consumption sites so consumer overrides via the Svelte `--prop` syntax actually take effect (root assignments otherwise beat the inherited override). Add an opt-in `--dry-app-frame-transition` (default `0s`) that animates background, border, and dot colors when supplied; respects `prefers-reduced-motion`.
