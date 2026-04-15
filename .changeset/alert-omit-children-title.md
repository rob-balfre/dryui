---
'@dryui/ui': patch
---

Alert now omits `children` and `title` from the forwarded `HTMLAttributes<HTMLDivElement>` base so the component's own `title` and snippet children no longer collide with the div's inherited attributes. The generated spec and contract reflect the new `omitted` list.
