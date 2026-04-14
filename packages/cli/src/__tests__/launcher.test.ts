import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import {
	buildLauncherTargets,
	buildLauncherUrl,
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

	test('builds launcher targets and url with the expected routes', () => {
		const feedbackBaseUrl = 'http://127.0.0.1:4748';
		const docsBaseUrl = 'http://127.0.0.1:5173';
		const targets = buildLauncherTargets(feedbackBaseUrl, docsBaseUrl);
		const launcherUrl = buildLauncherUrl(feedbackBaseUrl, docsBaseUrl, 42);

		expect(targets).toEqual({
			view: 'http://127.0.0.1:5173/view/bench/visual',
			feedback: 'http://127.0.0.1:4748/ui',
			docs: 'http://127.0.0.1:5173/',
			theme: 'http://127.0.0.1:5173/theme-wizard'
		});
		expect(launcherUrl).toContain('http://127.0.0.1:4748/ui/launcher.html?v=42');
		expect(decodeURIComponent(launcherUrl)).toContain(
			'view=http://127.0.0.1:5173/view/bench/visual'
		);
		expect(decodeURIComponent(launcherUrl)).toContain('feedback=http://127.0.0.1:4748/ui');
		expect(decodeURIComponent(launcherUrl)).toContain('docs=http://127.0.0.1:5173/');
		expect(decodeURIComponent(launcherUrl)).toContain('theme=http://127.0.0.1:5173/theme-wizard');
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

	test('prints the launcher url without opening a browser when --no-open is set', async () => {
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
		expect(result.logs[0]).toContain('DryUI launcher');
		expect(result.logs[0]).toContain(`Workspace: ${root}`);
		expect(result.logs[0]).toContain('Launcher: http://127.0.0.1:4748/ui/launcher.html?v=42');
		expect(result.logs[0]).toContain('Docs: already running');
		expect(result.logs[0]).toContain('Feedback: already running');
		expect(result.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(result.exitCode).toBe(0);
	});
});
