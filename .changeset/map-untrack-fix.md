---
"@dryui/primitives": patch
"@dryui/ui": patch
---

Fixed effect loop in map marker and popup components by using `untrack()` when reading previous instances during cleanup.
