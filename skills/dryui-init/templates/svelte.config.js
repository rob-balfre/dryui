import adapter from '@sveltejs/adapter-auto';
import { dryuiLint } from '@dryui/lint';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [dryuiLint({ strict: true })],
	compilerOptions: {
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter()
	}
};

export default config;
