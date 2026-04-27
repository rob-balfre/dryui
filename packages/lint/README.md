# `@dryui/lint`

Svelte preprocessor for DryUI projects.

It validates component code against DryUI rules during Svelte preprocessing. It is designed to catch layout, markup, and style violations early in dev and build.

This package does not ship a CLI binary. The public API is a library function:

```ts
import { dryuiLint } from '@dryui/lint';
```

## What It Enforces

- Grid-only layout rules
- No `display: flex` in scoped component styles
- No inline styles
- No `width` or `inline-size` layout sizing in scoped styles
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

## API

### `dryuiLint(options?)`

Returns a Svelte `PreprocessorGroup`.

Options:

- `strict?: boolean`
  When `true`, violations throw and fail the build. When `false`, violations are logged as warnings.
- `exclude?: string[]`
  Substring patterns used to skip matching filenames.
- `forbidRawGrid?: boolean`
  Experimental migration mode. Flags raw CSS grid declarations so layout moves through `AreaGrid.Root`.
- `componentsOnly?: boolean`
  Experimental migration mode. Flags raw native markup tags such as `<div>` and `<span>` so app markup goes through DryUI/Svelte components.

## Notes

- This package validates code. It does not rewrite or transform your source.
- It is meant to be used from `preprocess` in Svelte or SvelteKit config.
- If you need component lookup, design guidance, or workspace auditing, use the DryUI MCP server or CLI packages instead of this package.
