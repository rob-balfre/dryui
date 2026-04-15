---
'@dryui/mcp': patch
---

Wire the shared `prepack`/`postpack` hooks into `@dryui/mcp` so its `workspace:*` dependency on `@dryui/lint` gets rewritten to a concrete `^x.y.z` range before `npm pack` builds the publish tarball. Without these hooks, `@dryui/mcp@2.0.0` shipped with an unresolved `"@dryui/lint": "workspace:*"` dep, which breaks `bun add @dryui/mcp` outside the monorepo.
