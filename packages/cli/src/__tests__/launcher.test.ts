import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import {
	buildDashboardUrl,
	findLauncherWorkspaceRoot,
	isHealthyProbeStatus,
	runLauncher
} from '../commands/launcher.js';
import { captureAsyncCommandIO, cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

describe('launcher helpers', () => {
	test('finds the DryUI workspace root from a nested path', () => {
		const root = createTempTree({
			'apps/docs/package.json': '{"name":"@dryui/docs"}',
			'packages/cli/package.json': '{"name":"@dryui/cli"}',
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}',
			'apps/docs/src/routes/+page.svelte': '<h1>Docs</h1>'
		});

		expect(findLauncherWorkspaceRoot(resolve(root, 'apps/docs/src/routes'))).toBe(root);
	});

	test('builds the dashboard url with the dev target encoded as a query param', () => {
		const dashboardUrl = buildDashboardUrl('http://127.0.0.1:4748', 'http://127.0.0.1:5173', 42);

		expect(dashboardUrl).toBe(
			'http://127.0.0.1:4748/ui/?v=42&dev=http%3A%2F%2F127.0.0.1%3A5173%2F%3Fdryui-feedback%3D1'
		);
	});

	test('only treats 2xx probe responses as healthy', () => {
		expect(isHealthyProbeStatus(200)).toBe(true);
		expect(isHealthyProbeStatus(204)).toBe(true);
		expect(isHealthyProbeStatus(302)).toBe(false);
		expect(isHealthyProbeStatus(401)).toBe(false);
		expect(isHealthyProbeStatus(404)).toBe(false);
		expect(isHealthyProbeStatus(500)).toBe(false);
	});
});

describe('runLauncher', () => {
	test('returns false when the current directory is not the DryUI workspace', async () => {
		const root = createTempTree({
			'package.json': '{"name":"example"}'
		});

		const launched = await runLauncher(['--no-open'], { cwd: root });
		expect(launched).toBe(false);
	});

	test('prints the dashboard url without opening a browser when --no-open is set', async () => {
		const root = createTempTree({
			'apps/docs/package.json': '{"name":"@dryui/docs"}',
			'packages/cli/package.json': '{"name":"@dryui/cli"}',
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});

		const result = await captureAsyncCommandIO(() =>
			runLauncher(['--no-open'], {
				cwd: resolve(root, 'apps/docs'),
				runtime: {
					ensureFeedbackUiBuilt: () => null,
					ensureFeedbackServer: async () => 'already running',
					ensureDocsServer: async () => 'already running',
					now: () => 42,
					openBrowser: () => {
						throw new Error('browser should not be opened');
					}
				}
			})
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback dashboard');
		expect(result.logs[0]).toContain(`Workspace: ${root}`);
		expect(result.logs[0]).toContain(
			'Dashboard: http://127.0.0.1:4748/ui/?v=42&dev=http%3A%2F%2F127.0.0.1%3A5173%2F%3Fdryui-feedback%3D1'
		);
		expect(result.logs[0]).toContain('Docs: already running');
		expect(result.logs[0]).toContain('Feedback: already running');
		expect(result.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(result.exitCode).toBe(0);
	});

	test('reports progress before waiting for startup checks', async () => {
		const root = createTempTree({
			'apps/docs/package.json': '{"name":"@dryui/docs"}',
			'packages/cli/package.json': '{"name":"@dryui/cli"}',
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});
		const events: string[] = [];

		await captureAsyncCommandIO(() =>
			runLauncher([], {
				cwd: root,
				runtime: {
					ensureFeedbackUiBuilt: () => null,
					onProgress: ({ workspaceRoot, noOpen }) => {
						events.push(`progress:${workspaceRoot}:${noOpen}`);
					},
					ensureFeedbackServer: async () => {
						events.push('feedback');
						return 'already running';
					},
					ensureDocsServer: async () => {
						events.push('docs');
						return 'already running';
					},
					now: () => 42,
					openBrowser: () => false
				}
			})
		);

		expect(events).toEqual([`progress:${root}:false`, 'feedback', 'docs']);
	});
});
