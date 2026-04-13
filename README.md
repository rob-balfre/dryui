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

Canonical install snippets, config paths, and MCP JSON/TOML for Claude Code, Codex, Cursor, Windsurf, Copilot, and Zed live in [`apps/docs/src/lib/ai-setup.ts`](apps/docs/src/lib/ai-setup.ts) and render to the docs [getting-started page](https://dryui.dev/getting-started). Update that source instead of duplicating client setup here.

When working inside this repository with Codex, install the repo-local plugin via `codex` → `/plugins` → `DryUI Local`.

### From Source

If you've cloned the repo and want to use a local build instead of the npm package:

```bash
bun install
bun run --filter '@dryui/mcp' build
```

Then replace `"command": "npx", "args": ["-y", "@dryui/mcp"]` with `"command": "node", "args": ["packages/mcp/dist/index.js"]`.

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

See [RELEASING.md](./RELEASING.md) for the canonical Changesets workflow, manual release command, and npm token rotation guidance.

## License

MIT
