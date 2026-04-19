---
'@dryui/cli': minor
---

- `@dryui/cli` feedback session: when `@dryui/feedback` is missing or not mounted, the interactive menu now asks to install the package and inject `<Feedback serverUrl="http://127.0.0.1:4748" />` into the root `src/routes/+layout.svelte` automatically. Non-TTY callers continue to receive the existing warning. The edit is idempotent, creates a `<script lang="ts">` block if one is missing, and does not create a layout file if the project has none.
