---
'@dryui/mcp': minor
---

`detectProject` (and by extension `dryui ask --scope project` / `dryui detect`) now auto-selects a unique nested Svelte or SvelteKit project when the provided path resolves to a non-Svelte parent directory (e.g. running detection from a monorepo root that hosts a single SvelteKit app under `apps/`). When multiple candidates are present the detector warns and stays at the original root so users can rerun against the intended app. Explicit `package.json` paths are still honored without descent.
