import adapter from '@sveltejs/adapter-cloudflare';
import { dryuiLint } from '@dryui/lint';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		dryuiLint({
			strict: true,
			exclude: ['.svelte-kit/', 'packages/primitives/', '/dist/', '/thumbnail/', '/tour/']
		})
	],
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		prerender: {
			entries: ['*']
		}
	},
	compilerOptions: {
		css: 'injected',
		experimental: {
			async: true
		}
	}
};

export default config;
