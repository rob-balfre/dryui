# CLAUDE.md

Claude Code-specific notes for this repository.

Repo-wide rules live in [`AGENTS.md`](./AGENTS.md). If this file and `AGENTS.md` ever diverge, `AGENTS.md` wins.

## Claude-specific notes

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- Use `bun vm:test` (one-shot scaffold + build) or `bun vm` (scaffold + Vite dev with HMR) to exercise the public `bunx @dryui/cli` flow in a throwaway smolvm microVM. Use `bun vm:exec <cmd>` from another tab to run commands inside the live session (e.g. `bun vm:exec dryui list`). Source and gotchas live in [`scripts/vm.ts`](./scripts/vm.ts) and [`scripts/vm-exec.ts`](./scripts/vm-exec.ts).
- For local-source iteration on the cli/mcp/feedback-server bins, see "Source Mode (DRYUI_DEV)" in [`README.md`](./README.md). `bun run dev:link` then `DRYUI_DEV=1` makes `dryui`, `dryui-mcp`, and `dryui-feedback-mcp` run from `packages/*/src/` instead of `dist/`.
- Use `dryui check [path]` or MCP `check` for static validation of component contracts, a11y, tokens, and CSS discipline. For design-quality flows (brief, critique, polish, visual review) use [impeccable](https://impeccable.style), installed alongside DryUI by `dryui init` or via `npx impeccable skills install`. Invoke via `/impeccable <command>` in your harness.
- Use the `dryui-layout` agent/skill for page-level grid structure. It writes a `<div data-layout="<name>">` in the .svelte file plus the matching grid template in root `src/layout.css`.
- Keep `src/layout.css` enforced in dev as well as build: projects should wire `dryuiLayoutCss()` into `vite.config` before `sveltekit()`. Missing `src/layout.css` warns; violations hard-error during Vite dev startup, HMR, and build.
- The optional Claude SessionStart hook is installed with:

```bash
dryui install-hook
```

- Editor setup snippets, MCP config examples, and plugin install text live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts).
- The local plugin source is [`packages/plugin`](./packages/plugin). `/plugins` refers to the in-app install flow, not a repo directory.

## Canonical Links

- Repo-wide agent rules: [`AGENTS.md`](./AGENTS.md)
- Layout skill source: [`skills/dryui-layout/SKILL.md`](./skills/dryui-layout/SKILL.md)
- CSS discipline and token rules: [`skills/dryui/rules/theming.md`](./skills/dryui/rules/theming.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)
