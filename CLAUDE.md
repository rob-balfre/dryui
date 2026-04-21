# CLAUDE.md

Claude Code-specific notes for this repository.

Repo-wide rules live in [`AGENTS.md`](./AGENTS.md). If this file and `AGENTS.md` ever diverge, `AGENTS.md` wins.

## Claude-specific notes

- Use `gh-axi` for GitHub and `chrome-devtools-axi` for browser automation.
- Use `smolvm` to test the public `bunx @dryui/cli` install flow in a throwaway Linux VM without touching the host Mac. Command shapes and install notes live in the Isolated Testing section of [`AGENTS.md`](./AGENTS.md).
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
