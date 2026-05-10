# DryUI

Human-led, agent-assisted UI for building web apps with reusable components, theme tokens, route patterns, and checks that keep interfaces consistent.

Docs and skill setup: <https://dryui.dev/getting-started>

## What DryUI Does

DryUI gives engineers and their coding agents a shared UI system: reusable components, themeable defaults, route and interface patterns, and validation before changes ship.

## Workspace Packages

| Package                  | Description                                                                                         |
| ------------------------ | --------------------------------------------------------------------------------------------------- |
| `@dryui/primitives`      | Headless, unstyled components built on native browser APIs                                          |
| `@dryui/ui`              | Styled components with scoped Svelte styles and CSS variable theming                                |
| `@dryui/lint`            | Svelte preprocessor and Vite plugin that enforce DryUI CSS discipline                               |
| `@dryui/feedback`        | Optional feedback annotation UI                                                                     |
| `@dryui/feedback-server` | Feedback server, MCP backend (`dryui-feedback-mcp`), and dashboard launcher (`bunx dryui-feedback`) |

## Quick Start

Add the DryUI skill to your coding agent first:

```bash
npx skills add rob-balfre/dryui
```

Run the local feedback dashboard when you need it:

```bash
bunx dryui-feedback
```

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

The skill install is the recommended first step. Use skills for project inspection, setup guidance, and implementation guidance.

Repo contributors should treat [`apps/docs/src/lib/ai-setup.ts`](./apps/docs/src/lib/ai-setup.ts) as the canonical source for skill install snippets and MCP config examples.

Use package-level lint, build, and test commands for deterministic validation.

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

## Develop From Source

```bash
bun install
bun run docs
bun run validate
```

### Skill install via npx skills

DryUI setup is owned by the upstream skills installer from `vercel-labs/skills`. Install or refresh the DryUI skills with:

```bash
npx skills add rob-balfre/dryui
```

Use `--agent <flag>` when you want the upstream installer to target one supported agent.

The `<Feedback />` widget and `@dryui/ui` components resolve to source for any in-repo consumer (the docs app, tests, etc.) via the `bun`/`svelte` export conditionals, so `bun run docs` HMR picks up Svelte edits with no extra setup. For live rebuilds of the dashboard UI bundle, run `bun run dev:ui:watch` in a sidecar; override the served path with `DRYUI_FEEDBACK_UI_DIR` if needed.

### End-To-End Testing

To exercise the install flow end-to-end without publishing packages, use the tarball-based E2E harness:

```bash
bun run e2e:full                 # pack local packages, then run every scenario
bun run e2e:one dashboard        # run a single scenario
bun run e2e:pack                 # build and pack local package tarballs only
```

The E2E runner packs the current workspace packages into `reports/e2e-tarballs/`, scaffolds fresh projects against those tarballs, and writes the HTML run report to `reports/e2e-runs/index.html`.

The scaffold step goes through `scripts/e2e/scaffold-adapter.ts`, the concrete Adapter for the `dryui-init` golden consumer setup contract.

See the supporting docs for the rest:

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) for contributor workflow
- [`ACCESSIBILITY.md`](./ACCESSIBILITY.md) for the accessibility baseline
- [`skills/dryui-build/SKILL.md`](./skills/dryui-build/SKILL.md) for CSS, token, layout, and component rules
- [`RELEASING.md`](./RELEASING.md) for release and npm-auth guidance

## Design Principles

- Zero-dependency core runtime built on native browser APIs
- Two-tier architecture: headless primitives plus styled UI components
- Human-led, agent-assisted workflow
- Route and interface patterns for coherent web apps
- Svelte 5 runes only
- CSS variable theming via `--dry-*`
- Skill-first workflow with feedback tooling

## License

MIT
