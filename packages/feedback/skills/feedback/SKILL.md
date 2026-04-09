---
name: feedback
description: 'Open the app for visual feedback, wait for annotations, and act on them.'
---

# Feedback

Orchestrates the visual feedback loop: ensure servers are running, open the app, wait for the user to draw annotations, then act on them.

## 1. Ensure the Feedback Server Is Running

Check the health endpoint:

```bash
curl -s http://localhost:4748/health
```

If it returns `{"status":"ok"}`, the server is already running. Otherwise start it:

```bash
bun run packages/feedback-server/dist/server.js
```

If `dist/` does not exist, build first:

```bash
cd packages/feedback-server && bun run build
```

The server listens on port 4748 by default (`DEFAULT_FEEDBACK_PORT`). Data is stored in `~/.dryui-feedback/store.db`.

## 2. Find or Start the Dev Server

Check if a dev server is already running on common ports (5173, 5174, 5198, 5199, 5200):

```bash
lsof -iTCP:5173 -iTCP:5174 -iTCP:5198 -iTCP:5199 -iTCP:5200 -sTCP:LISTEN -P 2>/dev/null
```

If nothing is listening, look for a `dev` script in the project's `package.json` and start it. The app must have the `<Feedback>` component mounted:

```svelte
<script>
	import { Feedback } from '@dryui/feedback';
</script>

<Feedback serverUrl="http://localhost:4748" />
```

If the component is not mounted, the user cannot submit feedback. Check layout files (`+layout.svelte`) for the import.

## 3. Open the App in a Browser

Use the browser tools available in your environment:

- **Claude Code with Chrome MCP:** use `navigate` to open the dev server URL
- **Claude Code with Preview:** use `preview_start` if a launch config exists
- **Other environments:** tell the user to open the dev server URL manually

## 4. Tell the User What to Do

Say:

> Draw your feedback on the page using the toolbar in the bottom-right corner. Available tools: pencil, arrow, text, move, and eraser. The toolbar can be dragged to reposition it. You can also toggle drawing mode with Cmd+M (or Ctrl+M).
>
> When you are done annotating, let me know and I will review your drawings.

The feedback component draws SVG overlays on the page. Drawings are automatically persisted to the server. There is no explicit "Send" button -- drawings save as they are created.

## 5. Wait for Annotations

Use the `feedback_watch_annotations` MCP tool to poll for pending annotations:

```
feedback_watch_annotations(timeoutSeconds: 120)
```

This blocks until annotations arrive or the timeout expires. If it times out with `timedOut: true`, ask the user if they need more time or have finished annotating.

If `feedback_watch_annotations` is not available, poll manually:

```
feedback_get_all_pending()
```

Check `count > 0` to see if any pending annotations exist.

## 6. Review the Annotations

Each annotation includes:

- **`comment`** -- the user's text note about a specific area
- **`element`** / **`elementPath`** -- the DOM element being annotated
- **`x`, `y`** -- viewport coordinates of the annotation point
- **`boundingBox`** -- dimensions of the annotated element
- **`svelteComponents`** -- Svelte component names in the element's ancestry
- **`url`** -- the page URL where the annotation was placed
- **`intent`** -- `fix`, `change`, `question`, or `approve`
- **`severity`** -- `blocking`, `important`, or `suggestion`
- **`cssClasses`**, **`computedStyles`**, **`nearbyText`** -- additional context

Use this data to identify which UI elements the user is referencing:

1. Match `elementPath` and `svelteComponents` to source files
2. Use `comment` to understand what change is requested
3. Use `intent` and `severity` to prioritize (blocking > important > suggestion)
4. Cross-reference `url` with routes to find the relevant page component

Also check the drawing data persisted to the server. Drawings saved via the `<Feedback>` component include:

- **Freehand strokes** -- highlighting or circling areas of concern
- **Arrows** -- pointing at specific elements that need attention
- **Text labels** -- inline comments positioned on the page

To retrieve saved drawings for a page:

```bash
curl -s "http://localhost:4748/drawings?url=/"
```

## 7. Act on the Feedback

Based on the annotations, make the necessary code changes. Common actions:

- **Fix styling** -- adjust colors, spacing, typography using `--dry-*` tokens
- **Adjust layout** -- modify CSS grid tracks, gap, alignment
- **Move elements** -- reorder markup or change grid placement
- **Fix bugs** -- address functional issues the user identified
- **Change content** -- update text, labels, or placeholder copy

After making changes, tell the user to refresh the page and verify. If using browser tools, trigger a reload.

## 8. Resolve Annotations

After acting on each annotation, mark it as resolved:

```
feedback_resolve(annotationId: "<id>", summary: "Fixed the spacing issue by adjusting grid gap")
```

The `summary` is optional but helpful -- it adds a thread message explaining what was done.

Other resolution options:

- **`feedback_acknowledge`** -- mark as seen but not yet acted on
- **`feedback_dismiss`** -- skip with a reason (e.g., "Working as intended")
- **`feedback_reply`** -- add a message to the annotation thread without changing status

After resolving all annotations, ask the user if they have more feedback. If yes, loop back to step 4.

## Important Notes

- The feedback HTTP server (port 4748) must be running for drawing persistence and annotation storage to work. Without it, the `<Feedback>` component's drawings will not save.
- The MCP server (`dryui-feedback` in `.mcp.json`) connects to the HTTP server to read/write annotations. Both must be running.
- Annotations include rich context about the DOM element (`elementPath`, `svelteComponents`, `computedStyles`). Use this to locate the exact source code to modify.
- Drawing coordinates are relative to the viewport at the time of annotation. Combine with `elementPath` for precise element identification.
- The `<Feedback>` component is toggled with `Cmd+M` / `Ctrl+M` by default (configurable via the `shortcut` prop).
- Sessions group annotations by page URL. Use `feedback_list_sessions` to see all active sessions, or `feedback_get_session` to get annotations for a specific session.
