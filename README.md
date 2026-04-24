# DryUI

160+ components and theme controls, plus a CLI, MCP, and feedback engine to keep AI on track.

Docs and editor setup: <https://dryui.dev/getting-started>

## Workspace Packages

| Package                  | Description                                                                                                                                                  |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                                                                                                   |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming                                                                                         |
| `@dryui/lint`            | Svelte preprocessor that enforces DryUI CSS discipline                                                                                                       |
| `@dryui/cli`             | CLI for setup, discovery, install planning, static checks, DESIGN.md-aware visual checks, tokens, and feedback tooling                                       |
| `@dryui/mcp`             | MCP server exposing `ask`, `check`, and `check-vision` for in-editor discovery, validation, DESIGN.md-aware rendered checks, and feel-better polish critique |
| `@dryui/theme-wizard`    | Optional guided theme generator                                                                                                                              |
| `@dryui/feedback`        | Optional feedback annotation UI                                                                                                                              |
| `@dryui/feedback-server` | Companion feedback server and MCP backend                                                                                                                    |
| `@dryui/plugin`          | Plugin bundle for Claude Code, Codex, and Gemini CLI                                                                                                         |

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

Use `dryui check [path]` for static validation, `dryui check --polish` for polish-only linting, and `dryui check --visual <url>` when a running page needs DESIGN.md-aware screenshot critique against the feel-better polish rubric. The MCP `check` tool mirrors this with `visualUrl`, and `check-vision` remains available as the direct visual tool.

## Develop From Source

```bash
bun install
bun run docs
bun run validate
```

### Testing In A Clean VM

To exercise the published install flow end-to-end without touching your host, use [smolvm](https://github.com/smol-machines/smolvm). Two wrappers are in the root `package.json`:

```bash
bun vm:test              # ephemeral: bunx @dryui/cli init + bun run build, exits when done
bun vm                   # ephemeral: init + vite dev (HMR) at http://localhost:<auto-port>
bun vm:exec dryui list   # run a command inside the live `bun vm` session (any terminal)
```

`bun vm` prints `✓ DryUI dev server ready (HMR): http://localhost:<PORT>` once Vite is actually serving; Ctrl+C tears the VM down. `bun vm:exec <args>` runs the given command in the scaffolded VM via a shared-volume relay, so you can drive the CLI (`dryui list`, `dryui info Button`, etc.) against the live project from any other tab. Install smolvm with `curl -sSL https://smolmachines.com/install.sh | /bin/bash` (use `/bin/bash` explicitly so a Homebrew Intel `bash` on your PATH does not request the wrong platform tarball).

Implementation notes and smolvm/Vite gotchas live in [`scripts/vm.ts`](./scripts/vm.ts).

See the supporting docs for the rest:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contributor workflow
- [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) for the accessibility baseline
- [`packages/ui/skills/dryui/rules/theming.md`](./packages/ui/skills/dryui/rules/theming.md) for CSS and token rules
- [`RELEASING.md`](./RELEASING.md) for release and npm-auth guidance

## Design Principles

- Zero-dependency core runtime built on native browser APIs
- Two-tier architecture: headless primitives plus styled UI components
- Svelte 5 runes only
- CSS variable theming via `--dry-*`
- CLI-first workflow with optional MCP and skill integration

## License

MIT
