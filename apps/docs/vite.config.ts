import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const __dirname = dirname(fileURLToPath(import.meta.url));
const uiPackage = JSON.parse(
	readFileSync(resolve(__dirname, '../../packages/ui/package.json'), 'utf8')
) as { version: string };

export default defineConfig({
	plugins: [sveltekit()],
	define: {
		__DRYUI_VERSION__: JSON.stringify(uiPackage.version),
		__BUILD_TIMESTAMP__: JSON.stringify(new Date().toISOString())
	},
	build: {
		chunkSizeWarningLimit: 2000
	}
});
