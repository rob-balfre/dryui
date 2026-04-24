---
'@dryui/cli': patch
---

Make `dryui init` launch copy and behavior match project feedback mode. After scaffolding, the prompt now asks to run the project in feedback mode, and the launcher receives an interactive port-holder prompt so a busy port 5173 no longer silently skips the newly scaffolded dev server and falls back to the dashboard-only URL.
