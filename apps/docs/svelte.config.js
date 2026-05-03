import adapter from '@sveltejs/adapter-static';
import { dryuiLint } from '@dryui/lint';

const isDevCommand = process.env.npm_lifecycle_event === 'dev' || process.argv.includes('dev');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [
		dryuiLint({
			strict: true,
			exclude: ['.svelte-kit/', 'packages/primitives/', '/dist/', '/tour/']
		})
	],
	kit: {
		adapter: adapter({ pages: 'build', assets: 'build' }),
		experimental: {
			remoteFunctions: true
		},
		output: {
			// `single` currently generates a broken client route dictionary in docs dev.
			bundleStrategy: 'split'
		},
		prerender: {
			entries: isDevCommand ? [] : ['*'],
			// Demos use placeholder hash hrefs (e.g. `#overview`, `#deploys`) to
			// stand in for real navigation targets. The docs themselves don't rely
			// on anchor IDs for navigation, so warn rather than fail when those
			// fragments don't resolve to an element on the page.
			handleMissingId: 'warn'
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
