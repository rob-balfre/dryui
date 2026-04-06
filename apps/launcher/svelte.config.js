import adapter from '@sveltejs/adapter-node';
import { dryuiLint } from '@dryui/lint';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [dryuiLint({ strict: true })],
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
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
