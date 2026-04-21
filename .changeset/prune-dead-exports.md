---
'@dryui/cli': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
'@dryui/mcp': patch
'@dryui/primitives': patch
'@dryui/theme-wizard': patch
'@dryui/ui': patch
---

Internal cleanup across the workspace: un-export symbols only consumed
inside their own module, modernize RegExp iteration to `str.matchAll`,
and drop unused dev dependencies (puppeteer, pixelmatch, pngjs,
lucide-svelte, adapter-static). No public API changes for documented
entry points.
