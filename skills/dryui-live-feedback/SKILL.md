---
name: dryui-live-feedback
description: 'Open the DryUI app for visual feedback, wait for the user to annotate the page, then act on each submission via the dryui-feedback skill. Use when the user asks for live feedback, visual feedback, or to iterate on UI by drawing on it.'
---

# Feedback

Orchestrates the visual feedback loop: ensure servers are running, open the app, wait for the user to draw annotations, then act on them.

## 1. Ensure the Feedback Server Is Running

Check the health endpoint:

```bash
curl -s http://localhost:4748/health
```

If it returns `{"status":"ok"}`, the server is already running. Otherwise launch it:

```bash
bunx dryui-feedback --no-open
```

In the DryUI monorepo, if you need a repo-internal fallback and `dist/` does not exist, build first:

```bash
cd packages/feedback-server && bun run build
```

The server binds port 4748 by default (`DEFAULT_FEEDBACK_PORT`) and walks up to the first free port if it's taken. State lives under `<project>/.dryui/feedback/` (store.db, screenshots, server.json), so each project keeps its own queue.

## 2. Confirm the Widget Is Wired and Find the Dev Server

### 2a. Verify `@dryui/feedback` and `@dryui/feedback-server` are installed and the widget is mounted

`dryui-init` installs `@dryui/feedback` and `@dryui/feedback-server` as dev deps but does NOT mount the widget by default — the mount is opt-in. Confirm the install + mount before continuing:

```bash
test -f node_modules/@dryui/feedback/package.json && echo WIDGET_OK || echo WIDGET_MISSING
test -x node_modules/.bin/dryui-feedback && echo SERVER_OK || echo SERVER_MISSING
grep -q "from '@dryui/feedback'" src/routes/+layout.svelte && echo MOUNTED || echo MISSING
```

If `WIDGET_MISSING` or `SERVER_MISSING`, fall through to the `dryui-init` skill's **Apply Setup → Install** steps. If `MISSING` (mount), follow `dryui-init` → **Live Feedback (Opt-In)** to add the import + `<Feedback serverUrl="http://localhost:4748" />` mount in `src/routes/+layout.svelte`. A `package.json` `overrides` entry alone is not proof of installation — bun only applies overrides when the package is also a dep, so the `node_modules` check is the source of truth. Skipping this step is the most common way the rest of the flow silently breaks: the import resolves at edit time but vite throws `Cannot find module '@dryui/feedback'` on first request, or `bunx dryui-feedback` 404s against the npm registry because no top-level package by that name exists.

`@dryui/feedback` pulls in `lucide-svelte` transitively. lucide-svelte 1.0.x ships internal `./icons/index` imports without a `.js` extension, which Node strict ESM rejects, so vite must bundle it for SSR. The `dryuiLayoutCss()` plugin from `@dryui/lint` injects `ssr.noExternal: ['lucide-svelte']` automatically. If the project's `vite.config.*` doesn't use `dryuiLayoutCss()` (custom setups, ejected configs), add `ssr: { noExternal: ['lucide-svelte'] }` to the vite config manually before starting the dev server -- otherwise the first SSR request crashes with `Cannot find module '.../lucide-svelte/dist/icons/index'`.

### 2b. Find the right dev server

Check for vite servers on common ports (5173, 5174, 5198, 5199, 5200):

```bash
lsof -iTCP:5173 -iTCP:5174 -iTCP:5198 -iTCP:5199 -iTCP:5200 -sTCP:LISTEN -P 2>/dev/null
```

When more than one server is listening (a developer with several SvelteKit projects open will routinely have 5173/5174 taken by unrelated apps), match by the listening process's working directory. For each PID:

```bash
lsof -p <PID> -a -d cwd -Fn 2>/dev/null | sed -n 's/^n//p'
```

Pick the URL whose process cwd equals `$PWD`. Do **not** assume the first port returned belongs to this project. If no listening server matches the cwd, look for a `dev` script in this project's `package.json` and start it.

## 3. Open the App in a Browser

Use the browser tools available in your environment. In this repo, prefer `chrome-devtools-axi` for browser automation.

- With Chrome/DevTools automation: open the dev server URL directly.
- With a preview tool: open the configured preview URL.
- If no browser tool is available: tell the user to open the dev server URL manually.

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
highest-priority user intent for the current repair loop.

Use the same UI creation pipeline as the DryUI skill while resolving feedback:

1. Read the feedback screenshot and drawings.
2. Confirm any DryUI component APIs you touch with the `dryui` skill rules, component metadata, docs pages, or existing repo usage.
3. Apply the requested fix using DryUI components, CSS grid layout, and `--dry-*` tokens.
4. Run the relevant deterministic project check/build/test command.

Common actions:

- **Fix styling** -- adjust colors, spacing, typography using `--dry-*` tokens
- **Adjust layout** -- modify CSS grid tracks, gap, alignment
- **Move elements** -- reorder markup or change grid placement
- **Fix bugs** -- address functional issues the user identified
- **Change content** -- update text, labels, or placeholder copy

After making changes, run the relevant project check command and fix violations. Then tell the user
to refresh the page and verify. If using browser tools, trigger a reload.

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
- The `<Feedback>` component is toggled with `Cmd+M` / `Ctrl+M` by default (configurable via the `shortcut` prop). The toolbar is hidden until activated.
- Screenshots are saved as files at `screenshotPath` -- read them with the Read tool to see the annotated page.
- Drawing coordinates are relative to the active feedback scroll root. On the docs site this is the main content pane, not the browser window.
