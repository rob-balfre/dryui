// dryui init — Print setup snippets for a new DryUI app

import type { Spec } from './types.js';
import { runCommand } from '../run.js';

export function getInit(spec: Spec): { output: string; error: string | null; exitCode: number } {
	const output = [
		'DryUI setup checklist',
		'',
		'1. Import the theme in your root layout or global app entry:',
		'```svelte',
		'<script lang="ts">',
		`  import '${spec.themeImports.default}';`,
		`  import '${spec.themeImports.dark}';`,
		'</script>',
		'```',
		'',
		'2. Default the document to automatic light/dark theming:',
		'```html',
		'<html class="theme-auto">',
		'```',
		'',
		'3. If you are developing against a linked local package and want subpath imports, keep Vite from collapsing the symlink boundary:',
		'```ts',
		"import { defineConfig } from 'vite';",
		"import { sveltekit } from '@sveltejs/kit/vite';",
		'',
		'export default defineConfig({',
		'  plugins: [sveltekit()],',
		'  resolve: {',
		'    preserveSymlinks: true,',
		'  },',
		'});',
		'```'
	].join('\n');

	return { output, error: null, exitCode: 0 };
}

export function runInit(args: string[], spec: Spec): void {
	if (args[0] === '--help') {
		console.log('Usage: dryui init');
		console.log('');
		console.log('Print setup snippets for a DryUI app.');
		process.exit(0);
	}

	runCommand(getInit(spec));
}
