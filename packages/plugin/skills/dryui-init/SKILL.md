---
name: dryui-init
description: 'Bootstrap a SvelteKit + DryUI project. Detects project state, installs dependencies, and applies theme/layout setup. Works for new projects, existing SvelteKit apps, and brownfield repos.'
---

# /dryui:init

Bootstrap DryUI in the current project (or scaffold a new one).

## Run the CLI

Always check for an existing local DryUI link before installing the CLI globally:

```bash
readlink ~/.bun/install/global/node_modules/@dryui/cli
```

If the link points at a local DryUI checkout's `packages/cli`, do not run `bun install -g @dryui/cli@latest` or `npm install -g @dryui/cli@latest`; a global install replaces the local link. In the DryUI monorepo, restore or refresh the link instead:

```bash
bun run dev:link
DRYUI_DEV=1 dryui
```

Only install the published CLI when no local link exists and you are not iterating on DryUI source:

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
2. Establish the UI creation pipeline before building screens: user brief, DryUI lookup/plan via `ask`, implementation, deterministic `check`.
3. Suggest next steps: start the dev server, then run `ask --scope recipe "app shell"` to get the root layout template.

## UI pipeline after setup

Use this order for the first real interface:

1. Capture the user's brief (one line): what you are building, for whom.
2. Use `dryui ask` or MCP `ask` to confirm components, recipes, contracts, accessibility, and tokens.
3. Build with DryUI + Svelte 5 runes, grid layout, and `--dry-*` tokens.
4. Run `dryui check [path]` or MCP `check` to validate contracts, a11y, tokens, and CSS discipline.

For design-quality flows (brief, critique, polish, audit), delegate to [impeccable](https://impeccable.style) via `/impeccable teach`, `/impeccable craft`, `/impeccable critique`, `/impeccable audit`, or `/impeccable polish` in your AI harness. DryUI ships no design opinion.

## MCP fallback (no CLI available)

If `npx` is not available, use the MCP tools directly:

1. `ask --scope setup ""` — check project state and get the inline install plan. If `project: ready`, stop.
2. Execute each setup step from the response: run shell commands (confirm with user first), write files using provided snippets, log notes, warn on blocked steps.
3. `check` — validate the workspace after applying the setup changes.
