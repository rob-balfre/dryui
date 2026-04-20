# Contributing to DryUI

## Setup

```bash
git clone https://github.com/rob-balfre/dryui.git
cd dryui
bun install
```

## Optional Docs Setup

The docs build works without `PUBLIC_MAPBOX_TOKEN`; map demos fall back to a placeholder. Copy `apps/docs/.env.example` to `apps/docs/.env` only if you want the live Mapbox demo locally.

## Before Opening A PR

1. Run `bun run validate`.
2. If you edited `.svelte` files in `packages/ui/`, also run `bun run --filter '@dryui/ui' build`.
3. If you changed skill content or editor setup guidance, run `bun run sync:skills`.
4. If you changed docs-site content, run `bun run docs:check` and `bun run build:docs`.

## Contributor Checklist

- Read the CSS rules in [`docs/policies/css-discipline.md`](./docs/policies/css-discipline.md).
- Read the accessibility baseline in [`ACCESSIBILITY.md`](./ACCESSIBILITY.md).
- When changing exported component behaviour, update composition or spec sources as needed and rebuild `@dryui/mcp`.
- Add or update browser coverage for interactive or accessibility-sensitive changes.

## Adding Or Changing A Component

1. Implement the primitive and or UI layer in `packages/primitives` and `packages/ui`.
2. Update composition data in `packages/mcp/src/composition-data.ts` if the public usage story changed.
3. Rebuild MCP artifacts with `bun run --filter '@dryui/mcp' build`.
4. Add tests in `tests/unit/` and or `tests/browser/`.

## Manual Scripts

These are on-demand tools, not part of `bun run validate`:

- `bun run test:coverage` runs the unit and browser coverage commands, then writes the canonical repo summary under `coverage/summary/`.
- `bun run coverage:summary` re-reads existing coverage artifacts and refreshes `coverage/summary/coverage-summary.json` plus `coverage-summary.md`.
- `bun run bench:visual` checks screenshot runner performance.
- `bun run audit:dogfood` scans for raw HTML or styling patterns that should use DryUI components.
- `bun run figma:inventory` exports a Figma file inventory under `docs/research/figma`.
- `bun run screenshots:components` writes component screenshots to `tmp/component-screenshots/`.

If `bun run coverage:summary` reports missing artifacts, re-run the matching producer command first: `bun run test:coverage:unit` for `coverage/unit/lcov.info` and `bun run test:coverage:browser` for `coverage/browser/coverage-summary.json` plus `coverage/browser/index.html`.

## Reporting Bugs

Open a GitHub issue with reproduction steps, expected behaviour, and environment details.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
