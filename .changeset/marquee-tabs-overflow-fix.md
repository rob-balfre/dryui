---
'@dryui/primitives': patch
'@dryui/ui': patch
---

- `@dryui/primitives` + `@dryui/ui` Marquee: shift the track by the measured content size (with trailing padding on content instead of gap on the track) so the keyframe loop stays seamless across varying item counts and speeds.
- `@dryui/ui` Tabs.List: scroll horizontally when triggers overflow the container instead of pushing the parent wider; hide the scrollbar and contain inline-size so the list stays within its grid track.
- `@dryui/ui` Heading: balance multi-line headings with `text-wrap: balance`.
