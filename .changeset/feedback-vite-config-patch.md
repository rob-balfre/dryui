---
'@dryui/cli': minor
---

- `@dryui/cli` feedback session: the auto-setup prompt now also detects whether `@dryui/feedback` is listed in `vite.config.(ts|js|mts|mjs)` under `ssr.noExternal`. If it isn't, the CLI offers to patch the config alongside the install and mount steps. Without this, SvelteKit SSR externalises `@dryui/feedback` and Node chokes on the raw `.svelte` files in the package's `dist/`. The patcher handles the three common config shapes: existing `noExternal` array, existing `ssr` block, and bare `defineConfig({ ... })` / `export default { ... }`. Unusual shapes (functional configs, regex `noExternal`) fall through to a manual-patch note.
