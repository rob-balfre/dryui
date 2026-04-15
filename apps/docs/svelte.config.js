import adapter from '@sveltejs/adapter-cloudflare';
import { dryuiLint } from '@dryui/lint';

const useSingleBundle = process.env.NODE_ENV !== 'production';
const isDevCommand = process.env.npm_lifecycle_event === 'dev' || process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		dryuiLint({
			strict: true,
			exclude: ['.svelte-kit/', 'packages/primitives/', 'packages/feedback/', '/dist/', '/tour/']
		})
	],
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		output: {
			bundleStrategy: useSingleBundle ? 'single' : 'split'
		},
		prerender: {
			entries: isDevCommand ? [] : ['*']
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
