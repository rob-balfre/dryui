# DryUI

Zero-dependency Svelte 5 core. Headless primitives. Styled defaults. CLI and MCP tooling for agent-assisted workflows. Optional add-ons cover theme generation and feedback collection.

Docs and editor setup: <https://dryui.dev/getting-started>

## Workspace Packages

| Package                  | Description                                                                  |
| ------------------------ | ---------------------------------------------------------------------------- |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                   |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming         |
| `@dryui/lint`            | Svelte preprocessor that enforces DryUI CSS discipline                       |
| `@dryui/cli`             | CLI for setup, discovery, install planning, tokens, and feedback tooling     |
| `@dryui/mcp`             | MCP server exposing `ask` and `check` for in-editor discovery and validation |
| `@dryui/theme-wizard`    | Optional guided theme generator                                              |
| `@dryui/feedback`        | Optional feedback annotation UI                                              |
| `@dryui/feedback-server` | Companion feedback server and MCP backend                                    |
| `@dryui/plugin`          | Plugin bundle for Claude Code, Codex, and Gemini CLI                         |

## Quick Start

Start with the CLI:

```bash
bun install -g @dryui/cli@latest
dryui
```

No global install? Use `bunx @dryui/cli` or `npx -y @dryui/cli`.

Install the UI package:

```bash
npm install @dryui/ui
```

Use it in Svelte:

```svelte
<script>
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css';
	import { Button, Card } from '@dryui/ui';
</script>

<Card.Root>
	<Card.Header>
		<h2>Hello</h2>
	</Card.Header>
	<Card.Content>
		<Button>Click me</Button>
	</Card.Content>
</Card.Root>
```

Prefer `<html class="theme-auto">` so DryUI follows the system color scheme by default. Use `data-theme="light"` or `data-theme="dark"` only for explicit overrides.

## AI And Editor Integration

The CLI is the default entry point. Once it is working, add the skill and MCP layer for your editor from <https://dryui.dev/getting-started>.

Repo contributors should treat [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts) as the canonical setup source for editor snippets and MCP config examples.

## Develop From Source

```bash
bun install
bun run docs
bun run validate
```

See the supporting docs for the rest:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contributor workflow
- [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) for the accessibility baseline
- [`docs/policies/css-discipline.md`](./docs/policies/css-discipline.md) for CSS rules
- [`RELEASING.md`](./RELEASING.md) for release and npm-auth guidance

## Design Principles

- Zero-dependency core runtime built on native browser APIs
- Two-tier architecture: headless primitives plus styled UI components
- Svelte 5 runes only
- CSS variable theming via `--dry-*`
- CLI-first workflow with optional MCP and skill integration

## License

MIT
