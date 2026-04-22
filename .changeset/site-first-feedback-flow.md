---
'@dryui/cli': patch
'@dryui/feedback': patch
'@dryui/feedback-server': patch
---

`dryui` now opens the dev site with `?dryui-feedback=1` so the Feedback component starts in annotation mode, and submitting feedback opens the dashboard in a named tab focused on the new submission (`?focus=<id>`). The inline agent picker in the toolbar has been removed; pick which agent to launch per submission from the dashboard instead. `@dryui/feedback-server` now re-exports `normalizeDevUrl`.
