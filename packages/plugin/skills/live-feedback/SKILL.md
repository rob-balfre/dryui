---
name: live-feedback
description: 'Open the app for visual feedback, wait for submissions, and act on them.'
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

The server binds port 4748 by default (`DEFAULT_FEEDBACK_PORT`) and walks up to the first free port if it's taken. State lives under `<project>/.dryui/feedback/` (store.db, screenshots, server.json), so each project keeps its own queue.

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

## 5. Wait for Submissions

Use the `feedback_get_submissions` MCP tool to poll for pending submissions:

```
feedback_get_submissions(timeoutSeconds: 60)
```

This blocks until submissions arrive or the timeout expires. If it times out with `timedOut: true`, ask the user if they need more time.

**Important:** Use `feedback_get_submissions`, NOT `feedback_get_all_pending` or `feedback_watch_annotations`. The Feedback component creates **submissions** (screenshots + drawings), not annotations.

## 6. Review the Submissions

Each submission includes:

- **`id`** -- unique submission ID
- **`url`** -- the page URL where feedback was given
- **`screenshotPath`** -- path to the saved screenshot file (read this with the Read tool to see the page)
- **`drawings`** -- array of drawing objects the user made on the page
- **`viewport`** -- viewport dimensions at time of submission
- **`status`** -- `pending` or `resolved`
- **`createdAt`** -- timestamp

Each drawing has a `kind`:

- **`freehand`** -- strokes highlighting or circling areas (`points` array)
- **`arrow`** -- pointing at specific elements (`start` and `end` points)
- **`text`** -- inline text comments positioned on the page (`position` and `text`)

Use this data to identify what the user wants changed:

1. Read the screenshot file to see the page as the user saw it
2. Check drawing text labels for the user's comments/instructions
3. Use arrows to identify which elements the user is pointing at
4. Cross-reference `url` with routes to find the relevant page component

## 7. Act on the Feedback

Based on the submissions, make the necessary code changes. Treat feedback submissions as the
highest-priority user intent for the current repair loop. If the project has a local `DESIGN.md`,
read it before editing and preserve that durable product identity unless the feedback clearly
overrides it.

Use the same UI creation pipeline as the DryUI skill while resolving feedback:

1. Read the feedback screenshot and drawings.
2. Read `DESIGN.md` if present.
3. Confirm any DryUI component APIs you touch with `dryui info` or `dryui compose`.
4. Apply the requested fix using DryUI components, CSS grid layout, and `--dry-*` tokens.
5. Run an explicit make-interfaces-feel-better polish pass for hierarchy, spacing, alignment, density, states, copy clarity, and intentionality.
6. Run deterministic checks.
7. Run visual review when the page can be rendered.

Common actions:

- **Fix styling** -- adjust colors, spacing, typography using `--dry-*` tokens
- **Adjust layout** -- modify CSS grid tracks, gap, alignment
- **Move elements** -- reorder markup or change grid placement
- **Fix bugs** -- address functional issues the user identified
- **Change content** -- update text, labels, or placeholder copy

After making changes, run the relevant project check command and fix violations. When a dev server is
available, run `dryui check --visual <submission-url>`; include `--design <path-to-DESIGN.md>` when
the design brief is not auto-discoverable from the current working directory. Then tell the user to
refresh the page and verify. If using browser tools, trigger a reload.

## 8. Resolve Submissions

After acting on each submission, mark it as resolved:

```
feedback_resolve_submission(submissionId: "<id>")
```

After resolving all submissions, ask the user if they have more feedback. If yes, loop back to step 4.

## Important Notes

- The feedback HTTP server (port 4748) must be running for drawing persistence and submission storage to work. Without it, the `<Feedback>` component's drawings will not save.
- The MCP server (`dryui-feedback` in `.mcp.json`) connects to the HTTP server to read/write data. Both must be running.
- **Use `/submissions` endpoints, NOT `/sessions`.** The Feedback component creates submissions (screenshot + drawings), not sessions/annotations. Querying `/sessions` will always return empty results for this workflow.
- If annotation feedback conflicts with `DESIGN.md`, follow the annotation for that submission. If the new direction should persist, update `DESIGN.md` as part of the repair.
- The `<Feedback>` component is toggled with `Cmd+M` / `Ctrl+M` by default (configurable via the `shortcut` prop). The toolbar is hidden until activated.
- Screenshots are saved as files at `screenshotPath` -- read them with the Read tool to see the annotated page.
- Drawing coordinates are relative to the active feedback scroll root. On the docs site this is the main content pane, not the browser window.
