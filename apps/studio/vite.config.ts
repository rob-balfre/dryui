import { resolve } from 'node:path';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	resolve: {
		alias: {
			'@dryui/canvas': resolve(__dirname, '../../packages/canvas/src/index.ts'),
			'@dryui/hand-tracking': resolve(__dirname, '../../packages/hand-tracking/src/index.ts'),
			'@dryui/studio-server/command-parser': resolve(
				__dirname,
				'../../packages/studio-server/src/command-parser.ts'
			),
			'@dryui/studio-server/protocol': resolve(
				__dirname,
				'../../packages/studio-server/src/protocol.ts'
			)
		}
	}
});
