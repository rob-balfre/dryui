---
'@dryui/cli': patch
---

`dryui detect` (ambient command) now imports the spec and project-planner through the `@dryui/mcp` package exports instead of relative source paths, so the published CLI no longer depends on the repo layout to load detection metadata.
