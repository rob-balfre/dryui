# CLAUDE.md

Claude Code-specific notes for this repository.

Repo-wide rules live in [`AGENTS.md`](./AGENTS.md). If this file and `AGENTS.md` ever diverge, `AGENTS.md` wins.

## Claude-specific notes

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- Use `bun run e2e:full` to pack local package tarballs and run every scaffold scenario. Use `bun run e2e:one <scenario>` for focused coverage.
- For local-source iteration on the CLI and feedback-server bins, see "Source Mode (DRYUI_DEV)" in [`README.md`](./README.md). `bun run dev:link` then `DRYUI_DEV=1` makes `dryui` and `dryui-feedback-mcp` run from `packages/*/src/` instead of `dist/`.
- The DryUI CLI is intentionally limited to skill/editor setup and feedback tooling. Use package-level lint/build/test commands for deterministic validation. For design-quality flows (brief, critique, polish, visual review) use [impeccable](https://impeccable.style), installed via `npx impeccable skills install`. Invoke via `/impeccable <command>` in your harness.
- Use the `dryui-layout` agent/skill for page-level grid structure. It writes a `<div data-layout="<name>">` in the .svelte file plus the matching grid template in root `src/layout.css`.
- Keep `src/layout.css` enforced in dev as well as build: projects should wire `dryuiLayoutCss()` into `vite.config` before `sveltekit()`. Missing `src/layout.css` warns; violations hard-error during Vite dev startup, HMR, and build.
- Keep docs positioning aligned with the current homepage: DryUI is human-led, agent-assisted UI for reusable components, themes, route patterns, and checks. Do not describe it as a full automation tool, "agent-built apps", or primarily a Svelte cleanup product.
- The public docs are intentionally trimmed to Home, Getting Started, and individual component pages. Do not recreate removed pages such as `/tools`, `/how-it-works`, `/how-we-work`, `/grid-rules`, `/theme-wizard`, `/components` index pages, or logo exploration pages unless the user explicitly asks.
- The docs header is a shared shell in `apps/docs/src/routes/+layout.svelte` with logo, search, GitHub, and theme toggle. The logo is the simple `DryUI` wordmark, and `apps/docs/static/favicon.svg` should remain black and white with no underline.
- The optional Claude SessionStart hook is installed with:

```bash
dryui install-hook
```

- Editor setup snippets, MCP config examples, and plugin install text live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts).
- The DryUI plugin marketplace bundle is sunset; users install via `npx skills add rob-balfre/dryui`. `/plugins` refers to the in-app Claude or Codex install flow, not a repo directory.
- Skill install is via `npx skills add rob-balfre/dryui` (skills.sh standard). Sources live under top-level [`skills/`](./skills/); validate with `bun run validate:skills`.

## Agent skills

### Issue tracker

Issues and PRDs are tracked in GitHub Issues for `rob-balfre/dryui`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five-label triage vocabulary: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout: root `CONTEXT.md` plus root `docs/adr/`. See `docs/agents/domain.md`.

## Canonical Links

- Repo-wide agent rules: [`AGENTS.md`](./AGENTS.md)
- Layout skill source: [`skills/dryui-layout/SKILL.md`](./skills/dryui-layout/SKILL.md)
- CSS discipline and token rules: [`skills/dryui/rules/theming.md`](./skills/dryui/rules/theming.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)
