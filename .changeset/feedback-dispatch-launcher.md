---
'@dryui/feedback-server': minor
'@dryui/feedback': patch
---

Launch agents directly from the feedback admin console and swap the floating widget's dispatch picker to a `DropdownMenu`.

`@dryui/feedback-server` extracts `dispatchPrompt(target, prompt, options)` and exposes `POST /dispatch` (202 on success, 400 on invalid input, 503 when the chosen platform is unsupported on the host). The admin UI fetches `/dispatch-targets` on mount, persists the chosen agent in `localStorage`, and renders a Launch button + agent dropdown alongside Copy for both single submissions and the batch "run through all pending" prompt.

`@dryui/feedback` swaps the floating widget's target-picker from `Dialog` to a top-end `DropdownMenu` (brand logos preserved), adds dark CSS-var overrides via a wrap div, and teaches the drag-guard to ignore menu elements so opening the picker does not start a drag.
