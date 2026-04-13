# @dryui/lint

## 0.3.0

### Minor Changes

- [`06e99c6`](https://github.com/rob-balfre/dryui/commit/06e99c612e40398b7febb8e1af938ec1bcd73a8e) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add shared state tokens: `--dry-focus-ring` and `--dry-state-disabled-opacity` (duration tokens `--dry-duration-fast`/`--dry-duration-normal`/`--dry-duration-slow` and `--dry-ease-default` already existed and are now the single source of truth).

  Migrated 37 focus-ring sites, 17 disabled-state sites, and 11 raw-duration sites in `@dryui/ui` to consume these tokens (the two flip-card sites intentionally retain `var(--dry-flip-card-duration, 0.6s)` for the long flip animation). Consumers can now restyle focus and disabled state by overriding a single CSS variable.

  `@dryui/lint` gains a new `dryui/prefer-focus-ring-token` rule that flags any new occurrences of `outline: 2px solid var(--dry-color-focus-ring)` literals in scoped styles.

## 0.2.0

### Minor Changes

- [`2b501d2`](https://github.com/rob-balfre/dryui/commit/2b501d258f4f7397e0d5642d72d0867a407372a3) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Review-driven improvements from dogfooding a flight search app.

  **@dryui/ui**
  - Add `LogoMark` component for brand marks, status indicators, and category badges
  - Add `options` prop shorthand to `Select.Root` for simple dropdowns (`<Select.Root options={['A','B']} />`)

  **@dryui/primitives**
  - Add `options` and `placeholder` props to `SelectRootProps`

  **@dryui/mcp**
  - Add `tokens` tool for `--dry-*` CSS token discovery with category filtering
  - Batch-friendly `info` tool — accepts comma-separated component names
  - Smarter `prefer-grid-layout` reviewer suggestion — suppresses for complex grids (>3 tracks, named areas, subgrid, minmax, repeat)
  - Add `aligned-card-list` composition recipe (CSS subgrid pattern)

  **@dryui/cli**
  - Add `tokens` command for `--dry-*` CSS token listing
  - Batch-friendly `info` command — accepts comma-separated names

  **@dryui/lint**
  - Allow `display: inline-flex` (no longer flagged by `dryui/no-flex`)
  - Add `/* dryui-allow flex */` comment to suppress flex violations per declaration

## 0.1.0

### Minor Changes

- [`161f077`](https://github.com/rob-balfre/dryui/commit/161f077c053f1755c585932487e92f5ff289ba9b) Thanks [@rob-balfre](https://github.com/rob-balfre)! - Add `dryui/no-global` lint rule that bans `:global()` selectors in `<style>` blocks. Use scoped styles, `data-*` attributes, CSS variables, or component props instead.
