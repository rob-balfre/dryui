import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

const UI_DIR = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
	root: UI_DIR,
	plugins: [svelte()],
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
