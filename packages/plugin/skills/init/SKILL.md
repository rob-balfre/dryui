---
name: init
description: 'Bootstrap a SvelteKit + DryUI project. Detects project state, installs dependencies, and applies theme/layout setup. Works for new projects, existing SvelteKit apps, and brownfield repos.'
---

# /dryui:init

Bootstrap DryUI in the current project (or scaffold a new one).

## Run the CLI

Install the CLI globally first so every subsequent call is short and fast:

```bash
bun install -g @dryui/cli   # or: npm install -g @dryui/cli
```

Then run init:

```bash
dryui init             # existing project — installs deps, adds theme, sets up layout
dryui init my-app      # new project — scaffolds SvelteKit + DryUI in one step
```

If the user specifies a package manager, pass `--pm bun|npm|pnpm|yarn`.

**No global install?** `bunx @dryui/cli init` and `npx -y @dryui/cli init` work without installing — same result, just slower on every call.

The CLI is idempotent — it detects what's already done and only applies missing steps. If everything is set up, it reports "DryUI is already set up" and exits.

## After init

1. Tell the user init is complete and show the CLI output.
2. Suggest next steps: start the dev server, then run `ask --scope recipe "app shell"` to get the root layout template.

## MCP fallback (no CLI available)

If `npx` is not available, use the MCP tools directly:

1. `ask --scope setup ""` — check project state and get the inline install plan. If `project: ready`, stop.
2. Execute each setup step from the response: run shell commands (confirm with user first), write files using provided snippets, log notes, warn on blocked steps.
3. `check` — validate the workspace after applying the setup changes.
