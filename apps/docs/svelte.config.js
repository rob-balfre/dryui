import adapter from '@sveltejs/adapter-static';
import { dryuiLint } from '@dryui/lint';

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
		adapter: adapter({ pages: 'build', assets: 'build' }),
		experimental: {
			remoteFunctions: true
		},
		output: {
			// `single` currently generates a broken client route dictionary in docs dev,
			// which makes /theme-wizard hydrate as /components/[slug].
			bundleStrategy: 'split'
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
