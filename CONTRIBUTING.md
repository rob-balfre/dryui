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

These are enforced by `@dryui/lint`:

- **Grid-only layout** — `display: grid`, no flexbox
- **Container queries** for responsive — no `@media` for sizing
- **No inline styles** — no `style="..."` or `style:` directives
- **No `!important`** — fix specificity at the source
- **Scoped `<style>` only** — no CSS modules, no `:global()`
- **`data-*` attributes** for variants, `--dry-*` CSS vars for consumer overrides

## Versioning

We use [changesets](https://github.com/changesets/changesets) for versioning. If your PR changes published package behavior:

```bash
bun run changeset
```

## Reporting Bugs

Open a [GitHub issue](https://github.com/rob-balfre/dryui/issues) with reproduction steps, expected behavior, and your environment (browser, OS, DryUI version).

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
