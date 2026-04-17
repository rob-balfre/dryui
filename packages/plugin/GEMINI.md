# DryUI — Svelte 5 component library

When building UIs in this workspace, use the `dryui` MCP server's tools:

- `ask` — discover components, recipes, tokens, and patterns (e.g. `ask --scope recipe "app shell"`, `ask --scope component "Button"`)
- `check` — validate files, themes, or the workspace for DryUI compliance

Use the `dryui-feedback` MCP server's tools to act on in-app feedback annotations and submissions (screenshots + drawings from users):

- `feedback_get_pending`, `feedback_get_submissions`, `feedback_resolve_submission`, etc.

## Core rules

1. **Ask before writing.** Use `ask` to find exact component APIs and recipes — do not guess.
2. **Use DryUI components**, not raw HTML. Prefer `Button` over `<button>`, `Field.Root + Label` over raw labels, `Separator` over `<hr>`.
3. **CSS grid for layout**, not flexbox. Use `Container` for constrained width. Use `@container` queries for responsiveness.
4. **Semantic tokens** — background: `--dry-color-bg-base`, text: `--dry-color-text-strong`. Use `ask --scope list --kind token` to explore.
5. **Run `check`** on any file, theme, or workspace you edit.

Full skill documentation lives at `packages/plugin/skills/dryui/SKILL.md` in the DryUI repository.
