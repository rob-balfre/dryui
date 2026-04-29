# DryUI

160+ components and theme controls, plus a CLI, MCP, and feedback engine to keep AI on track.

Docs and editor setup: <https://dryui.dev/getting-started>

## Workspace Packages

| Package                  | Description                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                                                                |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming                                                      |
| `@dryui/lint`            | Svelte preprocessor that enforces DryUI CSS discipline                                                                    |
| `@dryui/cli`             | CLI for setup, discovery, install planning, static contract checks, tokens, and feedback tooling                          |
| `@dryui/mcp`             | MCP server exposing `ask` and `check` for in-editor component discovery, contract validation, a11y, and token correctness |
| `@dryui/theme-wizard`    | Optional guided theme generator                                                                                           |
| `@dryui/feedback`        | Optional feedback annotation UI                                                                                           |
| `@dryui/feedback-server` | Companion feedback server and MCP backend                                                                                 |
| `@dryui/plugin`          | Plugin bundle for Claude Code, Codex, and Gemini CLI                                                                      |

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

Use `dryui check [path]` for static validation of component contracts, a11y, tokens, and CSS discipline. The MCP `check` tool mirrors this surface.

## Design Guidance

DryUI is components + tokens + contracts. It deliberately does not ship design opinion. For design-quality flows (brief, critique, polish, visual review, anti-pattern detection) DryUI delegates to [impeccable](https://impeccable.style), an Apache-2.0 licensed design skill + CLI authored by Paul Bakaus.

`dryui init` offers to install impeccable alongside DryUI, or install later with:

```bash
npx impeccable skills install
```

Then invoke from your AI harness: `/impeccable teach`, `/impeccable craft`, `/impeccable critique`, `/impeccable polish`, `/impeccable audit`. Anti-pattern detection: `npx impeccable detect <path-or-url>`. Full catalog at <https://impeccable.style/cheatsheet>.

`PRODUCT.md` and `DESIGN.md` at the project root are impeccable-owned. DryUI tools do not read or write them.

## Develop From Source

```bash
bun install
bun run docs
bun run validate
```

### Source Mode (DRYUI_DEV)

Run `dryui`, `dryui-mcp`, and `dryui-feedback-mcp` against the live `packages/*/src/` TypeScript instead of `dist/`, without publishing or pointing tools at build folders.

One-time setup:

```bash
bun run build:packages   # populates dist/ as the no-flag fallback
bun run dev:link         # registers the three bins globally via `bun link`
```

Per shell:

```bash
export DRYUI_DEV=1
dryui list               # runs packages/cli/src/index.ts
dryui-mcp                # MCP server straight from src
dryui feedback server    # spawns packages/feedback-server/src/server.ts
```

Edits in `packages/cli/src/`, `packages/mcp/src/`, or `packages/feedback-server/src/` show up on the next invocation. Without `DRYUI_DEV` the same bins import `dist/`, matching the published behaviour.

For the `@dryui/feedback` widget (consumed at build/SSR time, not per-invocation), `dev:link` also registers the package and the launcher swaps `bun add` for `bun link @dryui/feedback` when `DRYUI_DEV=1`. The package's `exports` map carries a `"development"` condition pointing at `src/`, so once linked, `vite dev` in `~/yourproject` resolves through source and picks up edits via HMR — no rebuild needed. Production builds fall through to `dist/`.

For editor MCP entries, point at the linked bin and pass the env flag:

```jsonc
{
	"mcpServers": {
		"dryui": { "command": "dryui-mcp", "env": { "DRYUI_DEV": "1" } },
		"dryui-feedback": { "command": "dryui-feedback-mcp", "env": { "DRYUI_DEV": "1" } }
	}
}
```

The `<Feedback />` widget and `@dryui/ui` components already resolve to source for any workspace consumer (the docs app, tests, etc.) via the `bun`/`svelte` export conditionals, so `bun run docs` HMR picks up Svelte edits with no extra setup. For live rebuilds of the dashboard UI bundle, run `bun run dev:ui:watch` in a sidecar; override the served path with `DRYUI_FEEDBACK_UI_DIR` if needed.

Tear down with `bun run dev:unlink`.

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
