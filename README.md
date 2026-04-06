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

Accordion, Alert, Alert Dialog, App Bar, Aspect Ratio, Avatar, Backdrop, Badge, Breadcrumb, Button, Button Group, Calendar, Card, Carousel, Chart, Chat Message, Checkbox, Circular Progress, Clipboard, Code Block, Collapsible, Color Picker, Combobox, Command Palette, Container, Context Menu, Data Grid, Date Field, Date Picker, Date Range Picker, Dialog, Drag and Drop, Drawer, Dropdown Menu, Empty State, Field, File Upload, Flex, Float Button, Focus Trap, Format Bytes, Format Date, Format Number, Grid, Hotkey, Hover Card, Image, Image Comparison, Infinite Scroll, Input, Kbd, Label, Link, Link Preview, List, Listbox, Markdown Renderer, Marquee, Menubar, Navigation Menu, Number Input, Pagination, Pin Input, Popover, Portal, Progress, Progress Ring, Prompt Input, QR Code, Radio Group, Range Calendar, Rating, Relative Time, Rich Text Editor, Scroll Area, Scroll To Top, Select, Separator, Sidebar, Skeleton, Slider, Spacer, Spinner, Splitter, Stack, Stepper, Switch, Table, Table Of Contents, Tabs, Tag, Tags Input, Textarea, Time Input, Timeline, Toast, Toggle, Toggle Group, Toolbar, Tooltip, Tour, Transfer, Tree, Typography, Virtual List, Visually Hidden

## AI Integration

The `@dryui/mcp` package provides a [Model Context Protocol](https://modelcontextprotocol.io/) server that lets AI agents look up component APIs, retrieve composed-output source, plan installs and project-aware adds, generate composition guidance, validate components, diagnose theme issues, and audit workspaces. The docs site keeps the current tool and prompt inventory in sync with shared AI-surface data.

A standalone CLI (`@dryui/cli`) mirrors the same planning, lookup, validation, and audit workflows from the terminal, plus `init` for setup snippets.

DryUI also ships a **skill** (`packages/ui/skills/dryui/`) that teaches AI agents _when_ to use the MCP and _how_ to use it effectively. Tools that support skills should install both the MCP server and the skill for best results.

### Core setup

#### Codex

From a clone of this repo, link the DryUI skill into Codex:

```bash
mkdir -p "${CODEX_HOME:-$HOME/.codex}/skills"
ln -sfn "$(pwd)/packages/ui/skills/dryui" "${CODEX_HOME:-$HOME/.codex}/skills/dryui"
```

Then add the MCP server to your project's `.mcp.json`:

```json
{
	"mcpServers": {
		"dryui": {
			"type": "stdio",
			"command": "npx",
			"args": ["@dryui/mcp"]
		}
	}
}
```

Restart Codex after linking the skill. Use the skill for DryUI conventions and the MCP server for planning, lookup, validation, and audit tooling.

#### Claude Code

From a clone of this repo, optionally link the DryUI skill into your project-local Claude Code skills folder:

```bash
mkdir -p .claude/skills
ln -sfn "$(pwd)/packages/ui/skills/dryui" .claude/skills/dryui
```

Then add the MCP server to your project's `.mcp.json`:

```json
{
	"mcpServers": {
		"dryui": {
			"type": "stdio",
			"command": "npx",
			"args": ["@dryui/mcp"]
		}
	}
}
```

The skill is optional but recommended when you want Claude Code to follow DryUI conventions before reaching for MCP tools.

#### Cursor

Cursor uses MCP configuration only. Add the server to `.cursor/mcp.json` in your project root:

```json
{
	"mcpServers": {
		"dryui": {
			"command": "npx",
			"args": ["@dryui/mcp"]
		}
	}
}
```

The bundled DryUI skill does not apply to Cursor.

### Additional MCP clients

If you use another MCP client, keep the same `npx @dryui/mcp` command and adapt the config shape to that client.

#### Claude Code global skill install

```bash
mkdir -p ~/.claude/skills
ln -sfn "$(pwd)/packages/ui/skills/dryui" ~/.claude/skills/dryui
```

#### Windsurf

Add to `~/.codeium/windsurf/mcp_config.json`:

```json
{
	"mcpServers": {
		"dryui": {
			"command": "npx",
			"args": ["@dryui/mcp"]
		}
	}
}
```

#### VS Code (Copilot)

Add to `.vscode/mcp.json` in your project root:

```json
{
	"servers": {
		"dryui": {
			"type": "stdio",
			"command": "npx",
			"args": ["@dryui/mcp"]
		}
	}
}
```

#### Zed

Add to your Zed settings (`~/.config/zed/settings.json`):

```json
{
	"context_servers": {
		"dryui": {
			"command": {
				"path": "npx",
				"args": ["@dryui/mcp"]
			}
		}
	}
}
```

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
  primitives/   # @dryui/primitives — headless components
  ui/           # @dryui/ui — styled components
  mcp/          # @dryui/mcp — MCP server + spec generator
  cli/          # @dryui/cli — CLI tool
  lint/         # @dryui/lint — CSS lint preprocessor

apps/
  docs/         # Documentation site (SvelteKit)
  playground/   # Interactive playground (SvelteKit)

tests/
  unit/         # Bun test + happy-dom
  browser/      # Vitest + Playwright
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

## License

MIT
