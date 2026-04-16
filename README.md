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

### Start with the CLI

```bash
bun install -g @dryui/cli@latest
dryui
```

No global install? Prefix commands with `bunx @dryui/cli` or `npx -y @dryui/cli`.

### Install the UI package

```bash
npm install @dryui/ui
```

### Use the UI package

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

The entry point for working with DryUI is the CLI. Install `@dryui/cli`, start with bare `dryui` so it can walk you through editor integration and feedback, then use `dryui init` for new apps or `dryui install` / `dryui detect` for existing ones. Keep `dryui info`, `compose`, `review`, `diagnose`, and `doctor` in the loop while you work.

```bash
bun install -g @dryui/cli@latest
dryui                # default onboarding entry point
dryui init my-app    # scaffold a new SvelteKit + DryUI app
dryui install .      # print an install plan for an existing project
dryui detect .
```

No global install? Prefix commands with `bunx @dryui/cli` or `npx -y @dryui/cli`.

The DryUI skill and MCP server are the editor integration layer on top of that CLI workflow. The skill teaches conventions (compound components, theming, CSS rules, accessibility), and MCP exposes the same discovery/validation loop inside supported editors with `ask` / `check`.

Canonical install snippets, config paths, and MCP JSON/TOML for Claude Code, Codex, Cursor, Windsurf, Copilot, and Zed live in [`apps/docs/src/lib/ai-setup.ts`](apps/docs/src/lib/ai-setup.ts) and render to the docs [getting-started page](https://dryui.dev/getting-started). Update that source instead of duplicating client setup here.

Codex users on 0.121.0+ can install DryUI with `codex marketplace add rob-balfre/dryui`, then start `codex`, run `/plugins`, and install `DryUI`.

### From Source

If you've cloned the repo and want to use a local build instead of the npm package:

```bash
bun install
bun run --filter '@dryui/cli' build
bun run --filter '@dryui/mcp' build
```

Run the CLI locally with `node packages/cli/dist/index.js <command>`.

For MCP clients, replace `"command": "npx", "args": ["-y", "@dryui/mcp"]` with `"command": "node", "args": ["packages/mcp/dist/index.js"]`.

## Development

This is a Bun monorepo.

```bash
bun install
```

### Scripts

```bash
# Build packages + docs production output
bun run build

# Run the docs site
bun run docs

# Build docs deps + docs site (same path CI deploy uses)
bun run build:docs

# Type-check everything
bun run check

# Run tests
bun run test

# Lint CSS rules
bun run check:lint

# Full validation (check + test + build)
bun run validate

# Release validation gate (validate without browser tests)
bun run release:gate

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

### Generating llms.txt

The MCP package can generate an `llms.txt` file containing the full component spec in a format optimised for AI context:

```bash
bun run --filter '@dryui/mcp' generate-llms
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

See [RELEASING.md](./RELEASING.md) for the canonical Changesets workflow, manual release command, and npm token rotation guidance.

## License

MIT
