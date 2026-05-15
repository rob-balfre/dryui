---
'@dryui/primitives': patch
'@dryui/ui': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
'@dryui/lint': patch
---

Polish visual primitives and rewrite date-picker trigger.

- `ChromaticAberration`: alpha-derived color fringes, expanded filter region, source preserved via `feMerge`.
- `Displacement`: fill container via `block-size: 100%`.
- `GradientMesh`: layered backgrounds with `color-mix`, drop reliance on `@property` registration.
- `DatePicker.Trigger`: rewritten as a self-styled button (no longer wraps `Button`); exposes `--dry-date-picker-trigger-*` CSS vars and `data-content`/`data-date-picker-trigger` hooks.
- `Select.Trigger`: `size` prop added; type extends `HTMLButtonAttributes`.
- `TimeInput`: type now extends `HTMLAttributes<HTMLDivElement>` to match the segmented group implementation.
- Dep bumps across the workspace (svelte 5.55.7, svelte-check 4.4.8, vite 8.0.13, @sveltejs/kit 2.60.1, vite-plugin-svelte 7.1.2).
