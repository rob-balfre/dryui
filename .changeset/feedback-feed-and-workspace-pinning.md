---
'@dryui/feedback-server': minor
---

Ship the feed-shaped dashboard and pin dispatch to the submission's captured workspace.

- The admin dashboard is now a vertical feed with a collapsible filter bar. Each submission renders its screenshot, notes, and dispatch controls inline via a new `SubmissionCard`, replacing the previous split list + detail layout. Tabs read `Pending` / `Complete` and the bulk "Work through all" launcher sits next to the filter.
- Submissions now carry a `workspace` field stamped from the dispatcher at capture time (new `workspace` TEXT column, migrated in place via `ensureColumn`).
- `/dispatch` accepts an optional `submissionId` and prefers that submission's stored workspace over the live server's cwd, so launching an agent from an older submission still opens the correct project when the server was restarted elsewhere.
