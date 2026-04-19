---
'@dryui/cli': patch
---

- `@dryui/cli` feedback auto-setup: when a SvelteKit app has no `vite.config.(ts|js|mts|mjs)` at all, the CLI now writes a minimal one (with `ssr.noExternal: ['@dryui/feedback']`) instead of silently skipping the patch step. Previously the check quietly reported "patched" when no config existed, which left the app without the SSR exclusion and the feedback widget failing on first run.
