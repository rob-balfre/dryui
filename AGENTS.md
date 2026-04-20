# AGENTS.md

Repo-wide instructions for AI coding agents working in this repository.

## Canonical Docs

- Public overview: [`README.md`](./README.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- CSS discipline: [`docs/policies/css-discipline.md`](./docs/policies/css-discipline.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)

## Canonical Sources

- Editor install snippets and MCP config examples live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts). Do not duplicate them elsewhere.
- Skill sources live in:
  - [`packages/ui/skills/dryui/`](./packages/ui/skills/dryui/)
  - [`packages/feedback/skills/live-feedback/`](./packages/feedback/skills/live-feedback/)
  - [`packages/cli/skills/init/`](./packages/cli/skills/init/)
- Sync generated skill copies with `bun run sync:skills`. Do not edit `packages/plugin/skills/` or `.cursor/rules/` directly.
- The local plugin source is [`packages/plugin`](./packages/plugin). `/plugins` refers to the in-app Codex or Claude install flow, not a repo directory.

## Repo Rules

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- DryUI is pre-alpha. Prefer the current shape over compatibility shims unless a task explicitly asks for backwards compatibility.
- Use the DryUI CLI as the default entry point:

```bash
bun install -g @dryui/cli@latest
dryui
```

- Keep root-level Markdown durable. One-off audits, scratch TODOs, and generated reports belong under `docs/`, `reports/`, or ignored local directories, not the repo root.
- Repo-local editor install output such as `.agents/skills/`, `.github/skills/`, `.opencode/`, and `opencode.json` is not canonical source.

## Verification

- After editing `.svelte` files in `packages/ui/`, run `bun run --filter '@dryui/ui' build`.
- For docs work, prefer the root wrappers so local runs match CI: `bun run docs`, `bun run docs:build`, `bun run docs:check`, and `bun run build:docs`.
- After changing skill content or setup guidance, run `bun run sync:skills`.
