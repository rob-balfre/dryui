---
"@dryui/ui": patch
"@dryui/primitives": patch
---

fix: eliminate flash-on-load across 25+ components by adding CSS fallback defaults

Components previously set initial styles via JS `@attach` + `setProperty` which runs after first paint, causing a visible flash/glitch on page load. Now scoped `<style>` blocks include CSS fallback defaults matching default prop values, so first paint renders correctly. The `@attach` still overrides reactively when props change.
