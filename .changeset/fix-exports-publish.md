---
"@dryui/ui": patch
"@dryui/primitives": patch
---

Fix published package exports pointing to src/ instead of dist/

npm publish was shipping package.json with exports pointing to `./src/` paths,
but only `dist/` was included in the package. Added prepack/postpack scripts
that rewrite exports to `./dist/` paths before publishing and restore afterward.
