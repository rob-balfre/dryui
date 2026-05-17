---
'@dryui/feedback-server': minor
'@dryui/lint': minor
'@dryui/primitives': patch
'@dryui/ui': patch
'@dryui/feedback': patch
---

Add submission claiming, agent manifest generation, and skill restructure.

- `@dryui/feedback-server`: claim/release primitives so multiple agents can coordinate on the same submission queue without double-grabbing. New MCP tools `feedback_claim_submission` / `feedback_release_submission` and worker UI in the submission card.
- `@dryui/lint`: new `dryui/no-transcript-artifact` rule and `violation-report` module for structured violation output.
- `@dryui/primitives` / `@dryui/ui`: meta.ts doc comments updated to point at the docs-generation consumer instead of the deprecated `@dryui/mcp/load-component-meta` route. No runtime changes.
- `@dryui/feedback`: minor toolbar and accordion-default tweaks aligned with the new claim flow.
