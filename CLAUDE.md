# CLAUDE.md

Claude Code-specific notes for this repository. Repo-wide rules live in [`AGENTS.md`](./AGENTS.md); if this file and `AGENTS.md` diverge, `AGENTS.md` wins.

## Agent skills

- Issues and PRDs: GitHub Issues at `rob-balfre/dryui`. See [`docs/agents/issue-tracker.md`](./docs/agents/issue-tracker.md).
- Triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See [`docs/agents/triage-labels.md`](./docs/agents/triage-labels.md).
- Domain docs: root `CONTEXT.md` plus root `docs/adr/`. See [`docs/agents/domain.md`](./docs/agents/domain.md).

## DryUI Preflight

- For any DryUI component, route, template, styling, layout, docs, or feedback task, load the relevant top-level `skills/*/SKILL.md` before planning or editing files.
- If the task also involves Svelte or SvelteKit, load the DryUI skill first, then use the Svelte MCP docs/autofixer flow.
- After editing DryUI skill templates or other non-app `.svelte` files, run the direct lint surface against changed files, for example `checkSvelteFile(...)` from `packages/lint/src/rules.ts`, because app/package wrapper checks may not scan templates.

## Canonical Links

- Repo-wide agent rules: [`AGENTS.md`](./AGENTS.md)
- CSS discipline and token rules: [`skills/dryui/rules/theming.md`](./skills/dryui/rules/theming.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)
