# CLAUDE.md

Claude Code-specific notes for this repository.

Repo-wide rules live in [`AGENTS.md`](./AGENTS.md). If this file and `AGENTS.md` ever diverge, `AGENTS.md` wins.

## Claude-specific notes

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- Use `bun vm:test` (one-shot scaffold + build) or `bun vm` (scaffold + Vite dev with HMR) to exercise the public `bunx @dryui/cli` flow in a throwaway smolvm microVM. Use `bun vm:exec <cmd>` from another tab to run commands inside the live session (e.g. `bun vm:exec dryui list`). Source and gotchas live in [`scripts/vm.ts`](./scripts/vm.ts) and [`scripts/vm-exec.ts`](./scripts/vm-exec.ts).
- The optional Claude SessionStart hook is installed with:

```bash
dryui install-hook
```

- Editor setup snippets, MCP config examples, and plugin install text live in [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts).
- The local plugin source is [`packages/plugin`](./packages/plugin). `/plugins` refers to the in-app install flow, not a repo directory.

## Canonical Links

- Repo-wide agent rules: [`AGENTS.md`](./AGENTS.md)
- CSS discipline and token rules: [`packages/ui/skills/dryui/rules/theming.md`](./packages/ui/skills/dryui/rules/theming.md)
- Contributor workflow: [`CONTRIBUTING.md`](./CONTRIBUTING.md)
- Accessibility policy: [`ACCESSIBILITY.md`](./ACCESSIBILITY.md)
- Release flow: [`RELEASING.md`](./RELEASING.md)
