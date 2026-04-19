import { afterEach, describe, expect, test } from 'bun:test';
import { resolve } from 'node:path';
import type { ProjectDetection } from '@dryui/mcp/project-planner';
import {
	buildDashboardUrl,
	findLauncherWorkspaceRoot,
	isHealthyProbeStatus,
	runLauncher,
	runUserProjectLauncher,
	type UserProjectLauncherRuntime
} from '../commands/launcher.js';
import type { PortHolder } from '../commands/launch-utils.js';
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

const STUB_SPEC = {
	themeImports: { default: '@dryui/ui/themes/default.css', dark: '@dryui/ui/themes/dark.css' }
};

function readyDetection(root: string): ProjectDetection {
	return {
		inputPath: root,
		root,
		packageJsonPath: resolve(root, 'package.json'),
		framework: 'sveltekit',
		packageManager: 'bun',
		status: 'ready',
		dependencies: { ui: true, primitives: true, lint: true },
		files: {
			appHtml: resolve(root, 'src/app.html'),
			appCss: resolve(root, 'src/app.css'),
			rootLayout: resolve(root, 'src/routes/+layout.svelte'),
			rootPage: resolve(root, 'src/routes/+page.svelte'),
			svelteConfig: resolve(root, 'svelte.config.js')
		},
		theme: { defaultImported: true, darkImported: true, themeAuto: true },
		lint: { preprocessorWired: true },
		warnings: []
	};
}

function partialDetection(root: string): ProjectDetection {
	return { ...readyDetection(root), status: 'partial' };
}

function buildRuntime(
	overrides: Partial<UserProjectLauncherRuntime> = {}
): Partial<UserProjectLauncherRuntime> {
	return {
		readProjectDevScript: () => 'vite dev',
		ensureFeedbackServer: async () => 'already running',
		ensureFeedbackUiBuilt: () => null,
		urlResponds: async () => false,
		findPortHolder: () => null,
		killPortHolder: () => true,
		spawnProjectDevServer: () => {},
		waitForUrl: async () => true,
		promptKillPortHolder: async () => false,
		sleep: async () => {},
		now: () => 42,
		openBrowser: () => false,
		onProgress: () => {},
		...overrides
	};
}

describe('buildDashboardUrl', () => {
	test('omits dev param when docsBaseUrl is null', () => {
		const url = buildDashboardUrl('http://127.0.0.1:4748', null, 42);
		expect(url).toBe('http://127.0.0.1:4748/ui/?v=42');
	});
});

describe('runUserProjectLauncher', () => {
	test('returns false when project is not ready', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const launched = await runUserProjectLauncher(['--no-open'], {
			cwd: root,
			spec: STUB_SPEC,
			runtime: buildRuntime({ detectProject: () => partialDetection(root) })
		});
		expect(launched).toBe(false);
	});

	test('returns false when no dev script exists', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const launched = await runUserProjectLauncher(['--no-open'], {
			cwd: root,
			spec: STUB_SPEC,
			runtime: buildRuntime({
				detectProject: () => readyDetection(root),
				readProjectDevScript: () => null
			})
		});
		expect(launched).toBe(false);
	});

	test('uses existing dev server when port 5173 already responds', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		let killed = false;
		let spawned = false;
		let prompted = false;

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => true,
					killPortHolder: () => {
						killed = true;
						return true;
					},
					spawnProjectDevServer: () => {
						spawned = true;
					},
					promptKillPortHolder: async () => {
						prompted = true;
						return true;
					}
				})
			})
		);

		expect(killed).toBe(false);
		expect(spawned).toBe(false);
		expect(prompted).toBe(false);
		expect(result.logs[0]).toContain('Project dev: already running at http://127.0.0.1:5173');
		expect(result.logs[0]).toContain(
			'Dashboard: http://127.0.0.1:4748/ui/?v=42&dev=http%3A%2F%2F127.0.0.1%3A5173%2F%3Fdryui-feedback%3D1'
		);
	});

	test('spawns the dev server when port 5173 is free', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		let spawned = false;

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					spawnProjectDevServer: () => {
						spawned = true;
					},
					waitForUrl: async () => true
				})
			})
		);

		expect(spawned).toBe(true);
		expect(result.logs[0]).toContain('Project dev: started in the background');
		expect(result.logs[0]).toContain('dev=http%3A%2F%2F127.0.0.1%3A5173');
	});

	test('prompts to kill when port is busy and spawns after user confirms', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const killedPids: number[] = [];
		let spawned = false;
		const promptCalls: PortHolder[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => ({ pid: 12345, command: 'bun' }),
					promptKillPortHolder: async (holder) => {
						promptCalls.push(holder);
						return true;
					},
					killPortHolder: (pid) => {
						killedPids.push(pid);
						return true;
					},
					spawnProjectDevServer: () => {
						spawned = true;
					},
					waitForUrl: async () => true
				})
			})
		);

		expect(promptCalls).toEqual([{ pid: 12345, command: 'bun' }]);
		expect(killedPids).toEqual([12345]);
		expect(spawned).toBe(true);
		expect(result.logs[0]).toContain('Project dev: started in the background');
	});

	test('skips the dev server when user declines to kill port holder', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		let spawned = false;

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => ({ pid: 12345, command: 'bun' }),
					promptKillPortHolder: async () => false,
					spawnProjectDevServer: () => {
						spawned = true;
					}
				})
			})
		);

		expect(spawned).toBe(false);
		expect(result.logs[0]).toContain('Project dev: skipped (port 5173 busy (PID 12345 bun))');
		expect(result.logs[0]).toContain('Dashboard: http://127.0.0.1:4748/ui/?v=42');
		expect(result.logs[0]).not.toContain('dev=');
	});

	test('skips the dev server when spawn times out waiting for ready', async () => {
		const root = createTempTree({ 'package.json': '{}' });

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					waitForUrl: async () => false
				})
			})
		);

		expect(result.logs[0]).toContain(
			'Project dev: skipped (dev server did not respond within 30s)'
		);
		expect(result.logs[0]).not.toContain('dev=');
	});
});
