# Contributing to DryUI

## Setup

```bash
git clone https://github.com/rob-balfre/dryui.git
cd dryui
bun install
```

`bun install` wires `core.hooksPath` to [`.githooks/`](./.githooks/) via a postinstall step, so every clone inherits the shared pre-commit (spec/contract regen + prettier check) and pre-push (changeset gate) hooks. Re-run with `bun run setup:hooks` if you ever unset it.

## Optional Docs Setup

The docs build works without `PUBLIC_MAPBOX_TOKEN`; map demos fall back to a placeholder. Copy `apps/docs/.env.example` to `apps/docs/.env` only if you want the live Mapbox demo locally.

## Before Opening A PR

1. Run `bun run validate`.
2. If you edited `.svelte` files in `packages/ui/`, also run `bun run --filter '@dryui/ui' build`.
3. If you changed skill content or editor setup guidance, run `bun run sync:skills`.
4. If you changed docs-site content, run `bun run docs:check` and `bun run build:docs`.

## Contributor Checklist

- Read the CSS and token rules in [`packages/ui/skills/dryui/rules/theming.md`](./packages/ui/skills/dryui/rules/theming.md).
- Read the accessibility baseline in [`ACCESSIBILITY.md`](./ACCESSIBILITY.md).
- When changing exported component behaviour, update composition or spec sources as needed and rebuild `@dryui/mcp`.
- Add or update browser coverage for interactive or accessibility-sensitive changes.
- If browser coverage is not practical for an interactive component change, call out the exemption in the PR and link the follow-up issue.

## Adding Or Changing A Component

1. Implement the primitive and or UI layer in `packages/primitives` and `packages/ui`.
2. Update composition data in `packages/mcp/src/composition-data.ts` if the public usage story changed.
3. Rebuild MCP artifacts with `bun run --filter '@dryui/mcp' build`.
4. Add tests in `tests/unit/` and or `tests/browser/`.
5. If the change materially affects docs layout, theming, or representative demo states, run `bun run test:docs-visual`.

## Manual Scripts

These are on-demand tools, not part of `bun run validate`:

- `bun run test:coverage` runs the unit and browser coverage commands, then writes the canonical repo summary under `coverage/summary/`.
- `bun run coverage:summary` re-reads existing coverage artifacts and refreshes `coverage/summary/coverage-summary.json` plus `coverage-summary.md`.
- `bun run coverage:matrix` regenerates `reports/component-coverage-matrix.json` and `.md` from the public component spec plus matching tests and docs surfaces.
- `bun run test:docs-visual` is the slower docs regression suite for docs shell, representative component pages, and theming or layout changes. It runs locally only; run it before merging docs, theming, or layout changes.
- `bun run bump-deps` uses the repo-pinned `npm-check-updates` binary to update all workspace dependency ranges to latest, then refreshes the Bun install. Treat the resulting diff as a deliberate dependency-upgrade PR, not a drive-by cleanup.

If `bun run coverage:summary` reports missing artifacts, re-run the matching producer command first: `bun run test:coverage:unit` for `coverage/unit/lcov.info` and `bun run test:coverage:browser` for `coverage/browser/coverage-summary.json` plus `coverage/browser/index.html`.

## Reporting Bugs

Open a GitHub issue with reproduction steps, expected behaviour, and environment details.

## License

By contributing, you agree that your contributions are licensed under the [MIT License](LICENSE).
