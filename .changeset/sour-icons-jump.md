---
'@dryui/cli': patch
---

Verify that an existing dev server on port 5173 belongs to the target project before reusing it. If another project's Vite server is holding the port during `dryui init` feedback launch, the CLI now prompts to stop it and starts the newly scaffolded project instead of opening feedback mode against the wrong app.
