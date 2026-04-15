---
'@dryui/feedback-server': patch
'@dryui/cli': patch
---

Feedback dashboard screenshots are now rendered as a thumbnail that opens a full-resolution Dialog with the original capture, viewport metadata, and a link out to the page. The dashboard reads its `?dev=` target through a shared `normalizeDevUrl` helper that always pins `?dryui-feedback=1` on the dev app URL, and the CLI launcher (`dryui` / `dryui feedback ui`) now constructs the dashboard URL with the same flag so the docs site only mounts the feedback overlay when the dashboard hands off to it.
