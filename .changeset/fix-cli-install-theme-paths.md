---
'@dryui/mcp': patch
'@dryui/cli': patch
---

Fix `@dryui/cli install --json` failing with `ENOENT: ../@dryui/ui/src/themes/default.css`
in published builds. The theme token registry is now generated at build time into
`theme-tokens.generated.json` and bundled with `@dryui/mcp`, so the CLI no longer
tries to read CSS files from `@dryui/ui`'s source tree (which is not shipped with
the published tarball).
