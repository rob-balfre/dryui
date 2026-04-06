import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({ fallback: undefined }),
		alias: {
			'@dryui/canvas': '../../packages/canvas/src/index.ts',
			'@dryui/hand-tracking': '../../packages/hand-tracking/src/index.ts',
			'@dryui/studio-server': '../../packages/studio-server/src/index.ts',
			'@dryui/studio-server/command-parser': '../../packages/studio-server/src/command-parser.ts',
			'@dryui/studio-server/protocol': '../../packages/studio-server/src/protocol.ts',
			'@dryui/ui/themes/*': '../../packages/ui/src/themes/*',
			'@dryui/ui': '../../packages/ui/src/index.ts'
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
