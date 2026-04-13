---
'@dryui/primitives': major
'@dryui/ui': major
---

Remove `Flex`, `Stack`, and `Grid` primitives.

These primitives contradicted the DryUI layout philosophy ("Layout is raw CSS grid — do not use Grid, Stack, or Flex components") and had zero internal consumers. Removed to align the published surface with the documented rule. Use raw `display: grid` with CSS custom properties and `@container` queries instead — see the `dryui-css` skill or CLAUDE.md for the canonical patterns.
