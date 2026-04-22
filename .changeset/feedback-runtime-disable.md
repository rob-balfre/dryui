---
'@dryui/feedback': minor
---

The `<Feedback />` widget now honours a runtime opt-out. Set `DRY_FEEDBACK_DISABLED=1` (or `VITE_DRY_FEEDBACK_DISABLED=1`) and the component renders nothing on both server and client, without removing the import or unmounting in the layout. Useful for CI, screenshot jobs, recorded demos, and any environment where the dev-only widget should stay out of the DOM. Prefer the `VITE_`-prefixed form so Vite bakes the flag into the client bundle for consistent SSR + client behaviour.
