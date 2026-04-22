---
'@dryui/cli': minor
---

`dryui init` gains `--no-feedback` to skip installing `@dryui/feedback`, mounting `<Feedback />` in the root layout, and patching `vite.config`. Useful for CI scaffolds, library starters, or projects that want to opt in later.

The scaffolded `+layout.svelte` now imports `@dryui/ui/themes/default.css` and `@dryui/ui/themes/dark.css` BEFORE `../app.css`. The previous order silently let the theme defaults clobber any `--dry-*` token overrides in `app.css`, so token customisations appeared to do nothing. Existing scaffolds are unaffected; new scaffolds get the correct order at write-time.
