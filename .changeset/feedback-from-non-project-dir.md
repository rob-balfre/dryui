---
'@dryui/cli': patch
'@dryui/mcp': patch
---

Starting a feedback session from a directory with no Svelte/SvelteKit project no longer crashes when the descendant project walk hits an unreadable folder (e.g. `~/.Trash` on macOS). The walker skips inaccessible directories, and the interactive feedback menu now shows a brief notice explaining why the dev server was not auto-started before falling back to the dashboard-only URL.
