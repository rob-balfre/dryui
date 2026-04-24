---
'@dryui/cli': patch
---

Keep the feedback launcher process alive while it owns started dev or feedback servers. The foreground wait now uses an explicit keep-alive handle, so `dryui init` no longer returns to the shell immediately after printing "press Ctrl-C to stop servers and exit".
