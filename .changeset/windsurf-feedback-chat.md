---
'@dryui/feedback-server': patch
'@dryui/feedback': patch
---

Launch Windsurf feedback dispatch through `windsurf chat` when the CLI is available, including the bundled macOS CLI inside Windsurf.app. Falls back to the existing clipboard and app-open path when chat dispatch is unavailable.
