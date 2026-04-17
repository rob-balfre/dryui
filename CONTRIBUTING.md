# Contributing to DryUI

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/rob-balfre/dryui.git
cd dryui
bun install
bun run build
bun run test
```

### Environment variables

The docs build runs without `PUBLIC_MAPBOX_TOKEN`; Map-related demo routes
show a placeholder card instead. Copy `apps/docs/.env.example` to
`apps/docs/.env` and set `PUBLIC_MAPBOX_TOKEN` to enable the live map.

## Workflow

1. Fork the repo and create a feature branch
2. Make your changes
3. Run `bun run validate` (this is the CI gate — it runs lint, build, type-check, and tests in parallel)
4. Submit a PR against `main`

## Adding a Component

1. Create the component in `packages/primitives` (headless) and/or `packages/ui` (styled)
2. Update composition data: `packages/mcp/src/composition-data.ts`
3. Rebuild MCP spec: `bun run --filter '@dryui/mcp' build`
4. Add tests in `tests/unit/` and/or `tests/browser/`

## CSS Rules

See [CLAUDE.md § CSS Discipline](./CLAUDE.md#css-discipline) for the full list. `@dryui/lint` enforces these rules as a Svelte preprocessor — violations break the build.

## Versioning

We use [changesets](https://github.com/changesets/changesets) for versioning. If your PR changes published package behavior:

```bash
bun run changeset
```

## Manual / on-demand scripts

These scripts in `scripts/` are not wired into `bun run validate` or CI — run them manually when the situation calls for it.

- `bun run bench:visual` (`scripts/benchmark-visual-checks.ts`) — spins up the docs app and times the Vitest browser, Playwright, Puppeteer, and chromedp visual-check runners against `/view/bench/visual`. Run when evaluating or tuning the screenshot-diff story.
- `bun run audit:dogfood` (`scripts/dogfood-audit.ts`) — scans `.svelte` files for raw HTML, CSS patterns, and imports that should use DryUI components instead. Run before a large docs/app refactor to catch dogfooding regressions.
- `bun run figma:inventory` (`scripts/export-figma-file-inventory.ts`) — pulls a Figma file inventory via the Figma REST API (requires `FIGMA_FILE_KEY` / token) and writes it under `docs/research/figma`. Run when refreshing the design-source catalog.
- `bun run screenshots:components` (`scripts/generate-component-screenshots.ts`) — boots the docs app and captures per-component screenshots into `tmp/component-screenshots/`. Run when producing marketing / docs imagery; output is gitignored.

## Reporting Bugs

Open a [GitHub issue](https://github.com/rob-balfre/dryui/issues) with reproduction steps, expected behavior, and your environment (browser, OS, DryUI version).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
