import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { dryuiLint } from '../../lint/src/index.js';

const UI_DIR = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root: UI_DIR,
	plugins: [
		svelte({
			preprocess: [
				dryuiLint({
					// The feedback dashboard is a first-party Vite app with bespoke SVG
					// icons and dense card markup. Keep lint diagnostics visible, but do
					// not block the package build on consumer-layout rules here.
					strict: false,
					includeDryuiPackages: true,
					include: [UI_DIR],
					exclude: ['/dist/']
				})
			]
		})
	],
	base: '/ui/',
	publicDir: false,
	build: {
		outDir: resolve(UI_DIR, '../dist/ui'),
		emptyOutDir: false,
		rollupOptions: {
			input: {
				feedback: resolve(UI_DIR, 'index.html')
			}
		}
	}
});
