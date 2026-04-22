---
'@dryui/lint': patch
---

Declare `files: ["dist"]` explicitly. Without it, `npm pack` inside the workspace excluded `dist/` because the repo-level `.gitignore` ignores it — a hygiene hole that `publint`/`attw` now catch via the new `check:publish-hygiene` gate.
