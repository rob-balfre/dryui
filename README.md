# DryUI

160+ components and theme controls, plus a CLI, MCP, and feedback engine to keep AI on track.

Docs and editor setup: <https://dryui.dev/getting-started>

## Workspace Packages

| Package                  | Description                                                                                                               |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------- |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                                                                |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming                                                      |
| `@dryui/lint`            | Svelte preprocessor and Vite plugin that enforce DryUI CSS discipline                                                     |
| `@dryui/cli`             | CLI for setup, discovery, install planning, static contract checks, tokens, and feedback tooling                          |
| `@dryui/mcp`             | MCP server exposing `ask` and `check` for in-editor component discovery, contract validation, a11y, and token correctness |
| `@dryui/theme-wizard`    | Optional guided theme generator                                                                                           |
| `@dryui/feedback`        | Optional feedback annotation UI                                                                                           |
| `@dryui/feedback-server` | Companion feedback server and MCP backend                                                                                 |
| `@dryui/plugin`          | Plugin bundle for Claude Code, Codex, and Gemini CLI                                                                      |

## Quick Start

Start with the CLI. Always check for a local DryUI link before installing globally:

```bash
readlink ~/.bun/install/global/node_modules/@dryui/cli
```

If the link points at this repo's `packages/cli`, keep it and use local source mode:

```bash
bun run dev:link
DRYUI_DEV=1 dryui
```

Only install the published CLI when no local link exists and you are not iterating on DryUI source:

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

## Layout CSS Discipline

DryUI ships no layout component. Page and section structure lives as grid, flex, and container-query CSS in root `src/layout.css`, scoped under `[data-layout="<name>"]`. Page-level `display: grid` and `display: flex` declarations live there (or in `@container` blocks within it).

`src/layout.css` is imported last from `src/routes/+layout.svelte`, after DryUI theme CSS and `../app.css`. Mobile-first base; use `@container` queries for responsive shifts, never `@media` for layout breakpoints.

Wire both lint surfaces:

```js
// svelte.config.js
import { dryuiLint } from '@dryui/lint';

export default {
	preprocess: [dryuiLint({ strict: true })]
};
```

```ts
// vite.config.ts
import { sveltekit } from '@sveltejs/kit/vite';
import { dryuiLayoutCss } from '@dryui/lint';

export default {
	plugins: [dryuiLayoutCss(), sveltekit()]
};
```

`dryuiLayoutCss()` runs during Vite dev startup, HMR updates, and builds. Missing `src/layout.css` logs a warning only; violations throw.

## Design Guidance

DryUI is components + tokens + contracts. It deliberately does not ship design opinion. For design-quality flows (brief, critique, polish, visual review, anti-pattern detection) DryUI delegates to [impeccable](https://impeccable.style), an Apache-2.0 licensed design skill + CLI authored by Paul Bakaus.

Install impeccable separately when you want design guidance:

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
bun run build:packages   # populates dist/ as the DRYUI_DEV=0 fallback
bun run dev:link         # registers each workspace package globally via `bun link`
```

That's it. The bins ship with workspace auto-detect: when invoked through the `bun link` symlink they spot the surrounding `packages/<name>/package.json` and `.git`, switch to source mode, and propagate `DRYUI_DEV=1` to their child process. So:

```bash
dryui list               # auto-runs packages/cli/src/index.ts
dryui-mcp                # MCP server straight from src
dryui-feedback-mcp       # feedback MCP server from src
```

Each invocation prints a one-line `DRYUI_DEV=1 — LOCAL SOURCE MODE` banner so you can tell at a glance which path you're on. Edits in `packages/*/src/` show up on the next invocation — no rebuild required. To force the published path (e.g. to test the dist artifact), set `DRYUI_DEV=0` before running.

Workspace packages registered by `dev:link` (`@dryui/ui`, `@dryui/primitives`, `@dryui/feedback`, `@dryui/lint`) all carry a `"development"` exports condition pointing at `src/` and ship `src/` in their tarballs. Combined with the launcher's `DRYUI_DEV` flow — which rewrites tarball overrides in your project's `package.json` to `link:<pkg>` and adds the packages to `ssr.noExternal` — `vite dev` in `~/yourproject` resolves through workspace source and picks up Svelte edits via HMR. Production builds fall through to `dist/` automatically.

For editor MCP entries, point at the linked bin. Auto-detect handles the rest, but the explicit env flag is fine to keep:

```jsonc
{
	"mcpServers": {
		"dryui": { "command": "dryui-mcp" },
		"dryui-feedback": { "command": "dryui-feedback-mcp" }
	}
}
```

The `<Feedback />` widget and `@dryui/ui` components already resolve to source for any in-repo consumer (the docs app, tests, etc.) via the `bun`/`svelte` export conditionals, so `bun run docs` HMR picks up Svelte edits with no extra setup. For live rebuilds of the dashboard UI bundle, run `bun run dev:ui:watch` in a sidecar; override the served path with `DRYUI_FEEDBACK_UI_DIR` if needed.

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
