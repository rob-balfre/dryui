# DRYui

Zero-dependency Svelte 5 components. Headless primitives. Styled defaults. AI-ready.

## Packages

| Package             | Description                                                                                         |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| `@dryui/primitives` | Headless, unstyled components built on native browser APIs                                          |
| `@dryui/ui`         | Styled production-ready components with CSS variables theming                                       |
| `@dryui/mcp`        | MCP server for lookup, source retrieval, planning, validation, theme diagnosis, and workspace audit |
| `@dryui/cli`        | CLI tool for setup snippets, planning, lookup, validation, and workspace audit                      |
| `@dryui/lint`       | Svelte preprocessor enforcing CSS grid-only layout, container queries, no flexbox/inline styles     |

## Quick Start

### Install

```bash
npm install @dryui/ui
```

### Use

```svelte
<script>
	import { Button, Dialog, Card } from '@dryui/ui';
	import '@dryui/ui/themes/default.css';
	import '@dryui/ui/themes/dark.css'; /* add for dark mode + system theme support */
</script>

<div class="cards">
	<Card.Root>
		<Card.Header>
			<h3>Hello</h3>
		</Card.Header>
		<Card.Content>
			<p>Zero dependencies. Native browser APIs.</p>
		</Card.Content>
	</Card.Root>
</div>

<style>
	.cards {
		display: grid;
		gap: var(--dry-space-4);
	}
</style>
```

Recommended theme behavior:

- Default to `<html class="theme-auto">` so the UI follows the browser or OS color scheme.
- Use `<html data-theme="light">` or `<html data-theme="dark">` only for explicit overrides.
- If you add a theme switcher, persist the user's explicit light/dark choice and keep system mode as the fallback.

### Headless Only

If you only need behaviour without styles:

```bash
npm install @dryui/primitives
```

```svelte
<script>
	import { Dialog, Popover, Tabs } from '@dryui/primitives';
</script>
```

Advanced primitives are available via subpath exports:

```js
import { VirtualList } from '@dryui/primitives/virtual-list';
import { InfiniteScroll } from '@dryui/primitives/infinite-scroll';
import { RichTextEditor } from '@dryui/primitives/rich-text-editor';
import { Tour } from '@dryui/primitives/tour';
import { Marquee } from '@dryui/primitives/marquee';
import { QrCode } from '@dryui/primitives/qr-code';
import { CodeBlock } from '@dryui/primitives/code-block';
import { MarkdownRenderer } from '@dryui/primitives/markdown-renderer';
```

## Components

Accordion, Adjust, Alert, Alert Dialog, Alpha Slider, Aspect Ratio, Aurora, Avatar, Backdrop, Badge, Beam, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart, Chat Thread, Checkbox, Chip, Chip Group, Chromatic Aberration, Chromatic Shift, Clipboard, Code Block, Collapsible, Color Picker, Combobox, Command Palette, Container, Context Menu, Country Select, Data Grid, Date Field, Date Picker, Date Range Picker, Date Time Input, Description List, Diagram, Dialog, Displacement, Drag and Drop, Drawer, Drop Zone, Dropdown Menu, Field, Fieldset, File Select, File Upload, Flip Card, Float Button, Focus Trap, Format Bytes, Format Date, Format Number, Gauge, Glass, Glow, God Rays, Gradient Mesh, Halftone, Heading, Hotkey, Hover Card, Icon, Image, Image Comparison, Infinite Scroll, Input, Input Group, Kbd, Label, Link, Link Preview, List, Listbox, Logo Mark, Map, Markdown Renderer, Marquee, Mask Reveal, Mega Menu, Menubar, Multi Select Combobox, Navigation Menu, Noise, Notification Center, Number Input, Option Swatch Group, Pagination, Phone Input, Pin Input, Popover, Portal, Progress, Progress Ring, Prompt Input, QR Code, Radio Group, Range Calendar, Rating, Relative Time, Reveal, Rich Text Editor, Scroll Area, Scroll To Top, Segmented Control, Select, Separator, Shader Canvas, Sidebar, Skeleton, Slider, Spacer, Sparkline, Spinner, Splitter, Spotlight, Star Rating, Stepper, Svg, Table, Table Of Contents, Tabs, Tag, Tags Input, Text, Textarea, Time Input, Timeline, Toast, Toggle, Toggle Group, Toolbar, Tooltip, Tour, Transfer, Tree, Typing Indicator, Typography, Video Embed, Virtual List, Visually Hidden

## AI Integration

DryUI ships two things for AI agents: a **skill** that teaches conventions (compound components, theming, CSS rules, accessibility) and an **MCP server** for live component lookup, code validation, and composition guidance. The skill is the most important part — without it, agents guess APIs and make structural mistakes.

### Claude Code

Install the plugin (bundles both skill + MCP server):

```bash
claude plugin marketplace add rob-balfre/dryui
claude plugin install dryui@dryui
```

### Codex

Codex now supports plugins, but DryUI is not in a public Codex marketplace yet. Today there are two install paths.

Public install in any repo:

```bash
$skill-installer install https://github.com/rob-balfre/dryui/tree/main/packages/ui/skills/dryui
codex mcp add dryui -- npx -y @dryui/mcp
```

Repo-local plugin when you are working inside this repository:

1. Restart Codex so it picks up `.agents/plugins/marketplace.json`.
2. Run `codex`, then `/plugins`.
3. Open the `DryUI Local` marketplace and install `DryUI` from `./packages/plugin`.

The repo-local plugin bundles three skills:

- `dryui` for component conventions and composition checks
- `init` for bootstrapping DryUI in a new or existing SvelteKit project
- `live-feedback` for the feedback workflow

### VS Code / Copilot

Copy the skill and add the MCP server config:

```bash
npx degit rob-balfre/dryui/packages/ui/skills/dryui .github/skills/dryui
```

Add to `.vscode/mcp.json` (note: root key is `"servers"`, not `"mcpServers"`):

```json
{
	"servers": {
		"dryui": {
			"type": "stdio",
			"command": "npx",
			"args": ["-y", "@dryui/mcp"]
		}
	}
}
```

### Cursor

```bash
npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui
```

Add to `.cursor/mcp.json`:

```json
{
	"mcpServers": {
		"dryui": {
			"command": "npx",
			"args": ["-y", "@dryui/mcp"]
		}
	}
}
```

### Windsurf

```bash
npx degit rob-balfre/dryui/packages/ui/skills/dryui .agents/skills/dryui
```

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
	"mcpServers": {
		"dryui": {
			"command": "npx",
			"args": ["-y", "@dryui/mcp"]
		}
	}
}
```

### Zed

Zed does not yet support Agent Skills. It reads `AGENTS.md` for conventions automatically. Add the MCP server to `~/.config/zed/settings.json`:

```json
{
	"context_servers": {
		"dryui": {
			"command": {
				"path": "npx",
				"args": ["-y", "@dryui/mcp"]
			}
		}
	}
}
```

### Other MCP clients

Use `npx -y @dryui/mcp` as the server command and adapt the config shape to your client.

### From Source

If you've cloned the repo and want to use a local build instead of the npm package:

```bash
bun install
bun run --filter '@dryui/mcp' build
```

Then replace `"command": "npx", "args": ["@dryui/mcp"]` with `"command": "node", "args": ["packages/mcp/dist/index.js"]` in any of the configs above.

## Development

This is a Bun monorepo.

```bash
bun install
```

### Scripts

```bash
# Build all packages
bun run build

# Run the docs site
cd apps/docs && bun dev

# Run the playground
cd apps/playground && bun dev

# Type-check everything
bun run check

# Run tests
bun run test

# Lint CSS rules
bun run check:lint

# Full validation (check + test + build)
bun run validate

# Generate component screenshots to tmp/ (requires Playwright)
bun run screenshots:components
```

### Project Structure

```
packages/
  primitives/       # @dryui/primitives — headless components
  ui/               # @dryui/ui — styled components
  mcp/              # @dryui/mcp — MCP server + spec generator
  cli/              # @dryui/cli — CLI tool
  lint/             # @dryui/lint — CSS lint preprocessor
  feedback/         # @dryui/feedback — feedback annotation UI
  feedback-server/  # @dryui/feedback-server — feedback MCP backend
  theme-wizard/     # @dryui/theme-wizard — theme generation library
  plugin/           # @dryui/plugin — Claude Code + Codex plugin

apps/
  docs/             # Documentation site (SvelteKit)

tests/
  unit/             # Bun test + happy-dom
  browser/          # Vitest + Playwright
```

### Publishing

Uses [changesets](https://github.com/changesets/changesets) for versioning. `@dryui/primitives` and `@dryui/ui` are version-linked.

```bash
bun run changeset    # Add a changeset
bun run version      # Bump versions
bun run publish      # Validate, build, and publish to npm
```

### Generating llms.txt

The MCP package can generate an `llms.txt` file containing the full component spec in a format optimised for AI context:

```bash
cd packages/mcp
bun src/generate-llms-txt.ts
```

## Design Principles

- **Zero dependencies** — every component uses native browser APIs (`<dialog>`, Popover API, CSS Anchor Positioning, `Intl`, Intersection Observer, Resize Observer, Web Animations API, etc.)
- **Two-tier architecture** — headless primitives for full control, styled components for quick builds
- **Svelte 5 runes** — built entirely with `$state`, `$derived`, `$effect`, and `$props`
- **CSS variables** — all styling customisable via `--dry-*` custom properties
- **AI-ready** — MCP server and `llms.txt` give AI agents full spec access

## Acknowledgements

<a href="https://www.practical-ui.com/">
  <img src="https://www.practical-ui.com/wp-content/uploads/2022/04/practical-ui-logo.svg" alt="Practical UI" height="48" />
</a>

<br />

DRYui's design language is heavily influenced by [Practical UI](https://www.practical-ui.com/) by [Adham Dannaway](https://x.com/AdhamDannaway). The book's principles around spacing, colour, typography, hierarchy, and accessibility have shaped how every component looks and behaves out of the box. If you care about building interfaces that just _work_, it's well worth a read.

## Releasing

Releases are automated with [Changesets](https://github.com/changesets/changesets) and GitHub Actions:

1. Create a changeset: `bun run changeset`
2. Push to `main` — CI opens a "Version Packages" PR with bumped versions and changelogs
3. Merge that PR — CI publishes to npm and creates GitHub Releases

For a manual local release: `bun run release`

### npm auth gotcha

A gitignored project-level `.npmrc` at the repo root holds the publish token and takes precedence over `~/.npmrc` when `bun run publish:packages` runs from inside the repo. The GitHub Actions `NPM_TOKEN` secret must match _that_ token, not the one in your user-level `~/.npmrc` — they're usually different (the project one is a classic Publish token with write scope; the user one is often a granular read token without publish rights).

To rotate the CI secret to match the project token:

```bash
awk -F= '/^\/\/registry.npmjs.org\/:_authToken=/{printf "%s", $2}' ./.npmrc \
  | gh secret set NPM_TOKEN --repo rob-balfre/dryui
```

Use `printf` (no trailing newline) and pipe via stdin — never paste tokens through GitHub's web UI, which can introduce invisible whitespace that npm's registry rejects as 401 and reports as 404.

## License

MIT
