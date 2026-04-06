import { resolve } from 'node:path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

const browserConditions = process.env.VITEST ? ['browser'] : undefined;

export default defineConfig({
	plugins: [svelte()],
	resolve: {
		conditions: browserConditions,
		alias: [
			{ find: '$app/paths', replacement: resolve(__dirname, 'tests/mocks/app-paths.ts') },
			{ find: '$lib', replacement: resolve(__dirname, 'apps/docs/src/lib') },
			{
				find: /^@dryui\/primitives\/internal\/motion$/,
				replacement: resolve(__dirname, 'packages/primitives/src/internal/motion.ts')
			},
			{
				find: /^@dryui\/primitives\/(.*)$/,
				replacement: resolve(__dirname, 'packages/primitives/src/$1/index.ts')
			},
			{
				find: /^@dryui\/primitives$/,
				replacement: resolve(__dirname, 'packages/primitives/src/index.ts')
			},
			{
				find: /^@dryui\/ui\/themes\/(.*)$/,
				replacement: resolve(__dirname, 'packages/ui/src/themes/$1')
			},
			{
				find: /^@dryui\/ui\/(.*)$/,
				replacement: resolve(__dirname, 'packages/ui/src/$1/index.ts')
			},
			{ find: /^@dryui\/ui$/, replacement: resolve(__dirname, 'packages/ui/src/index.ts') },
			{
				find: '@dryui/mcp/architecture',
				replacement: resolve(__dirname, 'packages/mcp/src/architecture.ts')
			},
			{
				find: '@dryui/mcp/architecture.json',
				replacement: resolve(__dirname, 'packages/mcp/src/architecture.json')
			},
			{
				find: '@dryui/mcp/project-planner',
				replacement: resolve(__dirname, 'packages/mcp/src/project-planner.ts')
			},
			{
				find: '@dryui/mcp/reviewer',
				replacement: resolve(__dirname, 'packages/mcp/src/reviewer.ts')
			},
			{
				find: '@dryui/mcp/theme-checker',
				replacement: resolve(__dirname, 'packages/mcp/src/theme-checker.ts')
			},
			{ find: '@dryui/mcp/spec', replacement: resolve(__dirname, 'packages/mcp/src/spec.json') },
			{
				find: '@dryui/feedback-server',
				replacement: resolve(__dirname, 'packages/feedback-server/src/index.ts')
			},
			{ find: '@dryui/canvas', replacement: resolve(__dirname, 'packages/canvas/src/index.ts') },
			{
				find: '@dryui/hand-tracking',
				replacement: resolve(__dirname, 'packages/hand-tracking/src/index.ts')
			},
			{ find: /^@dryui\/mcp$/, replacement: resolve(__dirname, 'packages/mcp/src/index.ts') },
			{
				find: '@dryui/studio-server',
				replacement: resolve(__dirname, 'packages/studio-server/src/index.ts')
			},
			{
				find: '@dryui/studio-server/command-parser',
				replacement: resolve(__dirname, 'packages/studio-server/src/command-parser.ts')
			},
			{
				find: '@dryui/studio-server/protocol',
				replacement: resolve(__dirname, 'packages/studio-server/src/protocol.ts')
			}
		]
	},
	test: {
		include: ['tests/browser/**/*.browser.test.ts'],
		exclude: ['tests/browser/launcher-cli-card.browser.test.ts'],
		browser: {
			enabled: true,
			headless: true,
			provider: playwright(),
			instances: [{ browser: 'chromium' }]
		}
	}
});
