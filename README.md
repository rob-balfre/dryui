# DryUI

Human-led, agent-assisted UI for building web apps with reusable components, theme tokens, route patterns, and checks that keep interfaces consistent.

Docs and editor setup: <https://dryui.dev/getting-started>

## What DryUI Does

DryUI gives engineers and their coding agents a shared UI system: reusable components, themeable defaults, route and interface patterns, and validation before changes ship.

## Workspace Packages

| Package                  | Description                                                                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                                                                                          |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming                                                                                |
| `@dryui/lint`            | Svelte preprocessor and Vite plugin that enforce DryUI CSS discipline                                                                               |
| `@dryui/cli`             | Small CLI for skill/editor setup and feedback tooling                                                                                               |
| `@dryui/mcp`             | Lightweight context server for editors that expect a DryUI MCP entry; guidance lives in skills and deterministic validation lives in package checks |
| `@dryui/feedback`        | Optional feedback annotation UI                                                                                                                     |
| `@dryui/feedback-server` | Companion feedback server and MCP backend                                                                                                           |

## Quick Start

Add the DryUI skill to your coding agent first:

```bash
npx skills add rob-balfre/dryui
```

Then use the CLI only for editor/agent setup and feedback tooling:

```bash
dryui setup
dryui feedback
```

When working inside this monorepo, always check for a local DryUI link before installing the CLI globally:

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
	import { Button } from '@dryui/ui';
</script>

<section>
	<h2>Hello</h2>
	<Button>Click me</Button>
</section>
```

Prefer `<html class="theme-auto">` so DryUI follows the system color scheme by default. Use `data-theme="light"` or `data-theme="dark"` only for explicit overrides.

## Human-Led Agent-Assisted Workflow

DryUI gives humans and agents a shared way to discuss, edit, theme, and validate web app UI without losing consistency.

The skill install is the recommended first step. Use skills for project inspection and implementation guidance; keep the CLI focused on setup and feedback.

Repo contributors should treat [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts) as the canonical setup source for editor snippets and MCP config examples.

Use package-level lint, build, and test commands for deterministic validation. The CLI intentionally does not own project detection, install planning, component lookup, token listing, or broad checking.

## Public Docs Surface

The public docs are intentionally focused: Home, Getting Started, and individual component pages. Removed exploration pages such as `/tools`, `/how-it-works`, `/how-we-work`, `/grid-rules`, `/theme-wizard`, and a `/components` index page are not current product surfaces.

The docs brand is deliberately simple for now: a font-based `DryUI` wordmark and a black-and-white favicon with no underline. Keep route pages focused on content; the shared header lives in the docs layout.

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

Run `dryui` and `dryui-feedback-mcp` against the live `packages/*/src/` TypeScript instead of `dist/`, without publishing or pointing tools at build folders.

One-time setup:

```bash
bun run build:packages   # populates dist/ as the DRYUI_DEV=0 fallback
bun run dev:link         # registers each workspace package globally via `bun link`
```

That's it. The bins ship with workspace auto-detect: when invoked through the `bun link` symlink they spot the surrounding `packages/<name>/package.json` and `.git`, switch to source mode, and propagate `DRYUI_DEV=1` to their child process. So:

```bash
dryui setup              # auto-runs packages/cli/src/index.ts
dryui-feedback-mcp       # feedback MCP server from src
```

Each invocation prints a one-line `DRYUI_DEV=1 — LOCAL SOURCE MODE` banner so you can tell at a glance which path you're on. Edits in `packages/*/src/` show up on the next invocation — no rebuild required. To force the published path (e.g. to test the dist artifact), set `DRYUI_DEV=0` before running.

#### Skill install via npx skills

`dryui setup` installs the dryui skill via the upstream `npx skills` CLI (skills.sh standard). Copilot/cursor/opencode/windsurf shell out to `npx skills@^1.1.1 add rob-balfre/dryui --agent <flag> --copy --yes`, which writes to the upstream-blessed install location for each agent. Zed uses the legacy degit copy: it is not in the npx skills supported-agents list.

Set `DRYUI_SKILLS_LEGACY=1` to opt back into the legacy degit copy (one-release escape hatch):

```bash
DRYUI_SKILLS_LEGACY=1 dryui setup --editor cursor
```

Failures (offline, missing npx) fall through to the legacy degit copy automatically with a one-line warning, so the default path is safe even on flaky networks.

Workspace packages registered by `dev:link` (`@dryui/ui`, `@dryui/primitives`, `@dryui/feedback`, `@dryui/lint`) all carry a `"development"` exports condition pointing at `src/` and ship `src/` in their tarballs. Combined with the launcher's `DRYUI_DEV` flow — which rewrites tarball overrides in your project's `package.json` to `link:<pkg>` and adds the packages to `ssr.noExternal` — `vite dev` in `~/yourproject` resolves through workspace source and picks up Svelte edits via HMR. Production builds fall through to `dist/` automatically.

For feedback MCP entries, point at the linked bin. Auto-detect handles the rest, but the explicit env flag is fine to keep:

```jsonc
{
	"mcpServers": {
		"dryui-feedback": { "command": "dryui-feedback-mcp" }
	}
}
```

The `<Feedback />` widget and `@dryui/ui` components already resolve to source for any in-repo consumer (the docs app, tests, etc.) via the `bun`/`svelte` export conditionals, so `bun run docs` HMR picks up Svelte edits with no extra setup. For live rebuilds of the dashboard UI bundle, run `bun run dev:ui:watch` in a sidecar; override the served path with `DRYUI_FEEDBACK_UI_DIR` if needed.

Tear down with `bun run dev:unlink`.

### End-To-End Testing

To exercise the install flow end-to-end without publishing packages, use the tarball-based E2E harness:

```bash
bun run e2e:full                 # pack local packages, then run every scenario
bun run e2e:one dashboard        # run a single scenario
bun run e2e:pack                 # build and pack local package tarballs only
```

The E2E runner packs the current workspace packages into `reports/e2e-tarballs/`, scaffolds fresh projects against those tarballs, and writes the HTML run report to `reports/e2e-runs/index.html`.

See the supporting docs for the rest:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contributor workflow
- [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) for the accessibility baseline
- [`skills/dryui/rules/theming.md`](./skills/dryui/rules/theming.md) for CSS and token rules
- [`RELEASING.md`](./RELEASING.md) for release and npm-auth guidance

## Design Principles

- Zero-dependency core runtime built on native browser APIs
- Two-tier architecture: headless primitives plus styled UI components
- Human-led, agent-assisted workflow
- Route and interface patterns for coherent web apps
- Svelte 5 runes only
- CSS variable theming via `--dry-*`
- Skill-first workflow with small setup and feedback tooling

## License

MIT
