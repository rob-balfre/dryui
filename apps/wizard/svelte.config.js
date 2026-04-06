import adapter from '@sveltejs/adapter-static';
import { dryuiLint } from '@dryui/lint';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [dryuiLint({ strict: true, exclude: ['.svelte-kit/', 'packages/primitives/', '/thumbnail/'] })],
	kit: {
		adapter: adapter({ fallback: undefined }),
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
