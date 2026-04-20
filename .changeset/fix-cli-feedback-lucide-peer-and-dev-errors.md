---
'@dryui/cli': patch
---

Fix `dryui` feedback setup on fresh projects: the CLI now also ensures the `lucide-svelte` peer dependency of `@dryui/feedback` is installed and added to `ssr.noExternal` in `vite.config.ts`. Without this, a fresh SvelteKit project would 500 on every SSR request with `Cannot find module '…/lucide-svelte/dist/icons/index'` once the Feedback widget was mounted.

Also surface actual dev server errors in the CLI output instead of reporting a generic `skipped (dev server did not respond within 30s)` timeout. When the user's dev server returns 5xx, the CLI now reports the HTTP status and the error summary extracted from the response body. When the dev server never binds the port, the transport error is shown. Dev server stdout/stderr is captured to a temp log file and the tail plus the log path are included in the output so you can diagnose what went wrong without re-running anything.
