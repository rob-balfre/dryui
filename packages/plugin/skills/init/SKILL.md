---
name: init
description: 'Bootstrap a SvelteKit + DryUI project. Detects project state, installs dependencies, and applies theme/layout setup. Works for new projects, existing SvelteKit apps, and brownfield repos.'
---

# /dryui:init

Bootstrap DryUI in the current project (or scaffold a new one).

## Run the CLI

Install the CLI globally first so every subsequent call is short and fast:

```bash
bun install -g @dryui/cli@latest   # or: npm install -g @dryui/cli@latest
```

If the user also wants editor integration or feedback tooling, run `dryui` before or after init.

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
2. Establish the UI creation pipeline before building screens: user brief, optional `DESIGN.md` identity, DryUI lookup/plan, explicit make-interfaces-feel-better polish intent pass, implementation, deterministic check, visual review, and repair loop.
3. Suggest next steps: start the dev server, then run `ask --scope recipe "app shell"` to get the root layout template.

## UI pipeline after setup

Use this order for the first real interface:

1. Capture the user's brief: audience, job, domain, density, constraints, and success criteria.
2. Read `DESIGN.md` if present, or draft identity notes when durable design direction matters. Google-style `DESIGN.md` is an optional supported format, not a hard dependency.
3. Use `dryui info`, `dryui compose`, or MCP `ask` to confirm components, recipes, contracts, accessibility, and tokens.
4. Make the make-interfaces-feel-better polish intent pass explicit before implementation.
5. Build with DryUI + Svelte 5, then run `dryui check [path]` or MCP `check`.
6. Run `dryui check --visual <url>` or MCP `check` with `visualUrl`, repair issues, and repeat.

Precedence: user intent, `DESIGN.md`, DryUI contracts/accessibility/tokens, Svelte MCP, then the feel-better rubric.

## MCP fallback (no CLI available)

If `npx` is not available, use the MCP tools directly:

1. `ask --scope setup ""` — check project state and get the inline install plan. If `project: ready`, stop.
2. Execute each setup step from the response: run shell commands (confirm with user first), write files using provided snippets, log notes, warn on blocked steps.
3. `check` — validate the workspace after applying the setup changes.
