# `@dryui/lint`

Svelte preprocessor for DryUI projects.

It validates component code against DryUI rules during Svelte preprocessing. It is designed to catch layout, markup, and style violations early in dev and build.

This package does not ship a CLI binary. The public API is a library function:

```ts
import { dryuiLint, dryuiLayoutCss } from '@dryui/lint';
```

## What It Enforces

- Page layout rules for grid/flex/container CSS
- No `display: flex` in scoped component styles
- No inline styles
- No `width` or `inline-size` layout sizing in scoped styles
- Strict `src/layout.css` checks for page-level grid, flex, container, spacing, and alignment CSS
- No `<!-- svelte-ignore css_unused_selector -->`
- Additional DryUI markup and component usage rules

## Install

```bash
npm install -D @dryui/lint
```

## Use In `svelte.config.js`

```js
import { dryuiLint } from '@dryui/lint';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		dryuiLint({
			strict: true,
			exclude: ['.svelte-kit/', '/dist/']
		}),
		vitePreprocess()
	]
};

export default config;
```

## Use In `vite.config.ts`

```ts
import { dryuiLayoutCss } from '@dryui/lint';

export default {
	plugins: [dryuiLayoutCss()]
};
```

`dryuiLayoutCss()` checks the canonical `src/layout.css` file during Vite dev
startup, HMR updates, and builds. Missing `src/layout.css` logs a warning only.
Violations throw because this file is reserved for page-level layout CSS.

## API

### `dryuiLint(options?)`

Returns a Svelte `PreprocessorGroup`.

Options:

- `strict?: boolean`
  When `true`, violations throw and fail the build. When `false`, violations are logged as warnings.
- `include?: string[]`
  Substring patterns that opt files into linting. When set, non-matching files are skipped.
- `exclude?: string[]`
  Substring patterns used to skip matching filenames.
- `includeDryuiPackages?: boolean`
  First-party mode. Lints linked `@dryui/*` package source instead of skipping it as upstream dependency code.

Rules are always-on; there is no way to opt out of `dryui/no-raw-element` (raw native HTML tags) or `dryui/no-raw-grid` (raw CSS grid outside `src/layout.css`). Use `[data-layout]`/`[data-layout-area]` hooks for shell elements and route page-layout grid through `src/layout.css`.

### `checkLayoutCss(content, filename?, options?)`

Validates canonical layout CSS. Allowed declarations cover page-level `display`,
CSS grid, flexbox, container queries, spacing, block sizing, and box-alignment.
Spacing declarations still use `var(--dry-space-*)`, `0`, token-only `calc()`
values, and `auto` for margins. Selectors must target `[data-layout]` or
`[data-layout-area]` hooks. `@container` wrappers are allowed.

### `dryuiLayoutCss(options?)`

Returns a Vite-compatible plugin that checks `src/layout.css` in dev and build.

Options:

- `root?: string`
  Project root. Defaults to Vite's resolved root.
- `file?: string`
  Canonical layout CSS path relative to root. Defaults to `src/layout.css`.

## Notes

- This package validates code. It does not rewrite or transform your source.
- It is meant to be used from `preprocess` in Svelte or SvelteKit config.
- If you need component lookup, design guidance, or workspace auditing, use the DryUI MCP server or CLI packages instead of this package.
