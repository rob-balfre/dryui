---
'@dryui/primitives': patch
'@dryui/ui': patch
---

`AppFrame` now always renders its title row and reserves a stable line-height via `min-block-size`, so toggling `title` from empty to a value no longer causes the chrome bar to reflow. Also drops the `{#if title}` guard — passing `title=""` or omitting the prop both render an empty, space-reserving title row.
