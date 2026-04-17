---
'@dryui/cli': patch
---

Bump the CLI so `bun install -g @dryui/cli@latest` forces bun to re-resolve transitive deps. Existing `@dryui/cli@0.7.0` globals carry a cached `@dryui/feedback-server@0.3.3`/`0.3.4` (both shipped empty `dist/`), and bun won't refresh transitives when the top-level version is unchanged. Also pins the minimum `@dryui/feedback-server` to `^0.3.5` so fresh installs can't fall into the same hole.
