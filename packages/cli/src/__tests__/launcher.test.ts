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
		dependencies: { ui: true, primitives: true, lint: true, feedback: true },
		files: {
			appHtml: resolve(root, 'src/app.html'),
			appCss: resolve(root, 'src/app.css'),
			rootLayout: resolve(root, 'src/routes/+layout.svelte'),
			rootPage: resolve(root, 'src/routes/+page.svelte'),
			svelteConfig: resolve(root, 'svelte.config.js')
		},
		theme: { defaultImported: true, darkImported: true, themeAuto: true },
		lint: { preprocessorWired: true },
		feedback: { layoutPath: resolve(root, 'src/routes/+layout.svelte') },
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
		promptFeedbackSetup: async () => false,
		installPackage: () => true,
		mountFeedbackInLayout: () => true,
		findViteConfig: () => null,
		viteConfigHasFeedbackNoExternal: () => true,
		patchViteConfigFeedbackNoExternal: () => true,
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

	test('warns when @dryui/feedback is not installed', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			feedback: { layoutPath: null }
		};

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true
				})
			})
		);

		expect(result.logs[0]).toContain(
			'Feedback widget: not installed — run `bun add @dryui/feedback`'
		);
	});

	test('warns when Feedback component is not mounted in any layout', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const detection: ProjectDetection = {
			...readyDetection(root),
			feedback: { layoutPath: null }
		};

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true
				})
			})
		);

		expect(result.logs[0]).toContain('Feedback widget: not mounted');
	});

	test('auto-installs, mounts, and patches vite config when the user confirms', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const viteConfigPath = resolve(root, 'vite.config.ts');
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			feedback: { layoutPath: null }
		};
		const installCalls: Array<{ pm: string; pkg: string }> = [];
		const mountCalls: string[] = [];
		const patchCalls: string[] = [];
		const promptCalls: Array<{
			install: boolean;
			mount: boolean;
			viteConfig: boolean;
		}> = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true,
					findViteConfig: () => viteConfigPath,
					viteConfigHasFeedbackNoExternal: () => false,
					promptFeedbackSetup: async (plan) => {
						promptCalls.push({
							install: plan.install,
							mount: plan.mount,
							viteConfig: plan.viteConfig
						});
						return true;
					},
					installPackage: (_cwd, pm, pkg) => {
						installCalls.push({ pm, pkg });
						return true;
					},
					mountFeedbackInLayout: (layoutPath) => {
						mountCalls.push(layoutPath);
						return true;
					},
					patchViteConfigFeedbackNoExternal: (configPath) => {
						patchCalls.push(configPath);
						return true;
					}
				})
			})
		);

		expect(promptCalls).toEqual([{ install: true, mount: true, viteConfig: true }]);
		expect(installCalls).toEqual([{ pm: 'bun', pkg: '@dryui/feedback' }]);
		expect(mountCalls).toEqual([detection.files.rootLayout!]);
		expect(patchCalls).toEqual([viteConfigPath]);
		expect(result.logs[0]).toContain(`Feedback widget: mounted in ${detection.files.rootLayout}`);
		expect(result.logs[0]).toContain(
			`Vite config: added @dryui/feedback to ssr.noExternal in ${viteConfigPath}`
		);
	});

	test('only patches vite config when install and mount are already done', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const viteConfigPath = resolve(root, 'vite.config.ts');
		const detection = readyDetection(root);
		const installCalls: number[] = [];
		const mountCalls: number[] = [];
		const patchCalls: string[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true,
					findViteConfig: () => viteConfigPath,
					viteConfigHasFeedbackNoExternal: () => false,
					promptFeedbackSetup: async (plan) => {
						expect(plan).toEqual({
							install: false,
							mount: false,
							layoutPath: detection.files.rootLayout,
							viteConfig: true,
							viteConfigPath
						});
						return true;
					},
					installPackage: () => {
						installCalls.push(1);
						return true;
					},
					mountFeedbackInLayout: () => {
						mountCalls.push(1);
						return true;
					},
					patchViteConfigFeedbackNoExternal: (configPath) => {
						patchCalls.push(configPath);
						return true;
					}
				})
			})
		);

		expect(installCalls).toEqual([]);
		expect(mountCalls).toEqual([]);
		expect(patchCalls).toEqual([viteConfigPath]);
		expect(result.logs[0]).toContain('Vite config: added @dryui/feedback');
	});

	test('reports when the vite patch fails', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const viteConfigPath = resolve(root, 'vite.config.ts');
		const detection = readyDetection(root);

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true,
					findViteConfig: () => viteConfigPath,
					viteConfigHasFeedbackNoExternal: () => false,
					promptFeedbackSetup: async () => true,
					patchViteConfigFeedbackNoExternal: () => false
				})
			})
		);

		expect(result.logs[0]).toContain(
			`Vite config: could not patch ${viteConfigPath} — add @dryui/feedback to ssr.noExternal manually`
		);
	});

	test('reports when the install step fails', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			feedback: { layoutPath: null }
		};

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true,
					promptFeedbackSetup: async () => true,
					installPackage: () => false
				})
			})
		);

		expect(result.logs[0]).toContain(
			'Feedback widget: install failed — run `bun add @dryui/feedback` manually'
		);
	});

	test('reports when no src/routes/+layout.svelte exists', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			files: { ...readyDetection(root).files, rootLayout: null },
			feedback: { layoutPath: null }
		};

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true
				})
			})
		);

		expect(result.logs[0]).toContain(
			'Feedback widget: no src/routes/+layout.svelte — create one and rerun'
		);
	});

	test('emits no feedback widget note when installed and mounted', async () => {
		const root = createTempTree({ 'package.json': '{}' });

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => true
				})
			})
		);

		expect(result.logs[0]).not.toContain('Feedback widget:');
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
