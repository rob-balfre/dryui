---
'@dryui/mcp': patch
'@dryui/cli': patch
'@dryui/ui': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
'@dryui/lint': patch
---

Introduce the DESIGN.md brief pipeline: `check-vision` auto-discovers the nearest `DESIGN.md` and threads it into the visual rubric, `check` diagnoses brief structure, and the dryui/plugin/ui skills document a user-brief → DESIGN.md → component-lookup → polish → check loop so design identity stays visible instead of implicit in agent taste.
