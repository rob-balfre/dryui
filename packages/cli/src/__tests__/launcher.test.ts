import { afterEach, describe, expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { resolve } from 'node:path';
import type { ProjectDetection } from '@dryui/mcp/project-planner';
import {
	buildDashboardUrl,
	findLauncherWorkspaceRoot,
	isHealthyProbeStatus,
	runLauncher,
	runUserProjectLauncher,
	waitForShutdownSignal,
	type UserProjectLauncherRuntime
} from '../commands/launcher.js';
import type { PortHolder } from '../commands/launch-utils.js';
import { captureAsyncCommandIO, cleanupTempDirs, createTempTree } from './helpers.js';

const FEEDBACK_BASE_URL = 'http://127.0.0.1:4748';
const FEEDBACK_DEV_SITE_URL =
	'http://127.0.0.1:5173/?dryui-feedback=1&dryui-feedback-server=http%3A%2F%2F127.0.0.1%3A4748';
const FEEDBACK_DASHBOARD_URL =
	'http://127.0.0.1:4748/ui/?v=42&dev=http%3A%2F%2F127.0.0.1%3A5173%2F%3Fdryui-feedback%3D1%26dryui-feedback-server%3Dhttp%253A%252F%252F127.0.0.1%253A4748';

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
		const dashboardUrl = buildDashboardUrl(FEEDBACK_BASE_URL, 'http://127.0.0.1:5173', 42);

		expect(dashboardUrl).toBe(FEEDBACK_DASHBOARD_URL);
	});

	test('only treats 2xx probe responses as healthy', () => {
		expect(isHealthyProbeStatus(200)).toBe(true);
		expect(isHealthyProbeStatus(204)).toBe(true);
		expect(isHealthyProbeStatus(302)).toBe(false);
		expect(isHealthyProbeStatus(401)).toBe(false);
		expect(isHealthyProbeStatus(404)).toBe(false);
		expect(isHealthyProbeStatus(500)).toBe(false);
	});

	test('shutdown wait handles raw Ctrl-C input bytes', async () => {
		class FakeInput extends EventEmitter {
			isTTY = true;
			isRaw = true;
			paused = true;
			rawModes: boolean[] = [];

			isPaused(): boolean {
				return this.paused;
			}

			setRawMode(mode: boolean): void {
				this.rawModes.push(mode);
				this.isRaw = mode;
			}

			resume(): this {
				this.paused = false;
				return this;
			}

			pause(): this {
				this.paused = true;
				return this;
			}
		}

		const input = new FakeInput();
		const killed: number[] = [];
		const promise = captureAsyncCommandIO(() =>
			waitForShutdownSignal({
				ownedPids: [111, 222],
				killOwnedProcess: (pid) => {
					killed.push(pid);
				},
				input
			})
		);

		await new Promise((r) => setTimeout(r, 20));
		input.emit('data', Buffer.from([3]));

		const result = await promise;
		expect(input.rawModes).toEqual([false, false]);
		expect(input.isRaw).toBe(false);
		expect(input.paused).toBe(true);
		expect(killed).toEqual([111, 222]);
		expect(result.logs.join('\n')).toContain('Stopping servers...');
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

	test('prints the site and dashboard urls without opening a browser when --no-open is set', async () => {
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
					ensureFeedbackServer: async () => ({
						baseUrl: FEEDBACK_BASE_URL,
						message: 'already running',
						ownedPid: null
					}),
					ensureDocsServer: async () => ({ message: 'already running', ownedPid: null }),
					now: () => 42,
					openBrowser: () => {
						throw new Error('browser should not be opened');
					}
				}
			})
		);

		expect(result.logs).toHaveLength(1);
		expect(result.logs[0]).toContain('DryUI feedback');
		expect(result.logs[0]).toContain(`Workspace: ${root}`);
		expect(result.logs[0]).toContain(`Site: ${FEEDBACK_DEV_SITE_URL}`);
		expect(result.logs[0]).toContain(`Dashboard: ${FEEDBACK_DASHBOARD_URL}`);
		expect(result.logs[0]).toContain('Docs: already running');
		expect(result.logs[0]).toContain(`Feedback: already running at ${FEEDBACK_BASE_URL}`);
		expect(result.logs[0]).toContain('Browser: skipped (--no-open)');
		expect(result.exitCode).toBe(0);
	});

	test('opens the site url (not the dashboard) when --no-open is absent', async () => {
		const root = createTempTree({
			'apps/docs/package.json': '{"name":"@dryui/docs"}',
			'packages/cli/package.json': '{"name":"@dryui/cli"}',
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});

		let openedUrl: string | null = null;
		await captureAsyncCommandIO(() =>
			runLauncher([], {
				cwd: root,
				runtime: {
					ensureFeedbackUiBuilt: () => null,
					ensureFeedbackServer: async () => ({
						baseUrl: FEEDBACK_BASE_URL,
						message: 'already running',
						ownedPid: null
					}),
					ensureDocsServer: async () => ({ message: 'already running', ownedPid: null }),
					now: () => 42,
					openBrowser: (url) => {
						openedUrl = url;
						return true;
					}
				}
			})
		);

		expect(openedUrl).toBe(FEEDBACK_DEV_SITE_URL);
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
						return {
							baseUrl: FEEDBACK_BASE_URL,
							message: 'already running',
							ownedPid: null
						};
					},
					ensureDocsServer: async () => {
						events.push('docs');
						return { message: 'already running', ownedPid: null };
					},
					now: () => 42,
					openBrowser: () => false
				}
			})
		);

		expect(events).toEqual([`progress:${root}:false`, 'feedback', 'docs']);
	});

	test('kills feedback server pid when docs server startup rejects', async () => {
		const root = createTempTree({
			'apps/docs/package.json': '{"name":"@dryui/docs"}',
			'packages/cli/package.json': '{"name":"@dryui/cli"}',
			'packages/feedback-server/package.json': '{"name":"@dryui/feedback-server"}'
		});
		const killed: number[] = [];

		const result = await captureAsyncCommandIO(() =>
			runLauncher(['--no-open'], {
				cwd: root,
				runtime: {
					ensureFeedbackUiBuilt: () => null,
					ensureFeedbackServer: async () => ({
						baseUrl: FEEDBACK_BASE_URL,
						message: 'started in the background',
						ownedPid: 12345
					}),
					ensureDocsServer: async () => {
						throw new Error('docs boom');
					},
					killOwnedProcess: (pid) => {
						killed.push(pid);
					},
					now: () => 42,
					openBrowser: () => false
				}
			})
		);

		expect(killed).toEqual([12345]);
		expect(result.exitCode).toBe(1);
		expect(result.logs.join('\n')).toContain('docs boom');
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
		ensureFeedbackServer: async () => ({
			baseUrl: FEEDBACK_BASE_URL,
			message: 'already running',
			ownedPid: null
		}),
		ensureFeedbackUiBuilt: () => null,
		urlResponds: async () => false,
		findPortHolder: () => null,
		killPortHolder: () => true,
		killOwnedProcess: () => {},
		isInteractiveTTY: () => false,
		spawnProjectDevServer: () => null,
		waitForUrlDetailed: async () => ({ ok: true, status: 200 }),
		readProjectDevLogTail: () => [],
		promptKillPortHolder: async () => false,
		promptFeedbackSetup: async () => false,
		projectHasDependency: () => true,
		installPackage: () => true,
		linkPackage: () => true,
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
		const url = buildDashboardUrl(FEEDBACK_BASE_URL, null, 42);
		expect(url).toBe(`${FEEDBACK_BASE_URL}/ui/?v=42`);
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
					findPortHolder: () => ({ pid: 12345, command: 'node', cwd: root }),
					killPortHolder: () => {
						killed = true;
						return true;
					},
					spawnProjectDevServer: () => {
						spawned = true;
						return null;
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
		expect(result.logs[0]).toContain(`Dashboard: ${FEEDBACK_DASHBOARD_URL}`);
	});

	test('prompts to kill when port 5173 responds for a different project', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const otherRoot = createTempTree({ 'package.json': '{}' });
		const killedPids: number[] = [];
		let spawned = false;
		const promptCalls: PortHolder[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => true,
					findPortHolder: () => ({ pid: 12345, command: 'node', cwd: otherRoot }),
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
						return null;
					},
					waitForUrlDetailed: async () => ({ ok: true, status: 200 })
				})
			})
		);

		expect(promptCalls).toEqual([{ pid: 12345, command: 'node', cwd: otherRoot }]);
		expect(killedPids).toEqual([12345]);
		expect(spawned).toBe(true);
		expect(result.logs[0]).toContain('Project dev: started in the background');
		expect(result.logs[0]).not.toContain('Project dev: already running');
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
						return null;
					},
					waitForUrlDetailed: async () => ({ ok: true, status: 200 })
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
						return null;
					},
					waitForUrlDetailed: async () => ({ ok: true, status: 200 })
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

	test('auto-installs @dryui/feedback plus its lucide peer, mounts, and patches vite config', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const viteConfigPath = resolve(root, 'vite.config.ts');
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			feedback: { layoutPath: null }
		};
		const installCalls: Array<{ pm: string; pkgs: string[] }> = [];
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
					projectHasDependency: (_root, name) => name !== 'lucide-svelte',
					promptFeedbackSetup: async (plan) => {
						promptCalls.push({
							install: plan.install,
							mount: plan.mount,
							viteConfig: plan.viteConfig
						});
						return true;
					},
					installPackage: (_cwd, pm, pkgs) => {
						installCalls.push({ pm, pkgs });
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
		expect(installCalls).toEqual([{ pm: 'bun', pkgs: ['@dryui/feedback', 'lucide-svelte'] }]);
		expect(mountCalls).toEqual([detection.files.rootLayout!]);
		expect(patchCalls).toEqual([viteConfigPath]);
		expect(result.logs[0]).toContain(
			'Feedback icons: installed lucide-svelte (peer dependency of @dryui/feedback)'
		);
		expect(result.logs[0]).toContain(`Feedback widget: mounted in ${detection.files.rootLayout}`);
		expect(result.logs[0]).toContain(
			`Vite config: added @dryui/feedback and lucide-svelte to ssr.noExternal in ${viteConfigPath}`
		);
	});

	test('under DRYUI_DEV, links @dryui/feedback from the workspace instead of installing it', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const viteConfigPath = resolve(root, 'vite.config.ts');
		const detection: ProjectDetection = {
			...readyDetection(root),
			dependencies: { ui: true, primitives: true, lint: true, feedback: false },
			feedback: { layoutPath: null }
		};
		const installCalls: Array<{ pm: string; pkgs: string[] }> = [];
		const linkCalls: Array<{ pm: string; pkgs: string[] }> = [];

		const previousDev = process.env['DRYUI_DEV'];
		process.env['DRYUI_DEV'] = '1';
		let result;
		try {
			result = await captureAsyncCommandIO(() =>
				runUserProjectLauncher(['--no-open'], {
					cwd: root,
					spec: STUB_SPEC,
					runtime: buildRuntime({
						detectProject: () => detection,
						urlResponds: async () => true,
						findViteConfig: () => viteConfigPath,
						viteConfigHasFeedbackNoExternal: () => true,
						projectHasDependency: () => true,
						promptFeedbackSetup: async () => true,
						installPackage: (_cwd, pm, pkgs) => {
							installCalls.push({ pm, pkgs });
							return true;
						},
						linkPackage: (_cwd, pm, pkgs) => {
							linkCalls.push({ pm, pkgs });
							return true;
						},
						mountFeedbackInLayout: () => true
					})
				})
			);
		} finally {
			if (previousDev === undefined) delete process.env['DRYUI_DEV'];
			else process.env['DRYUI_DEV'] = previousDev;
		}

		expect(installCalls).toEqual([]);
		expect(linkCalls).toEqual([{ pm: 'bun', pkgs: ['@dryui/feedback'] }]);
		expect(result.logs[0]).toContain('Feedback widget: linked from workspace (DRYUI_DEV=1)');
	});

	test('installs the lucide peer even when @dryui/feedback is already present', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const detection = readyDetection(root);
		const installCalls: Array<{ pm: string; pkgs: string[] }> = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => detection,
					urlResponds: async () => true,
					projectHasDependency: (_root, name) => name !== 'lucide-svelte',
					promptFeedbackSetup: async () => true,
					installPackage: (_cwd, pm, pkgs) => {
						installCalls.push({ pm, pkgs });
						return true;
					}
				})
			})
		);

		expect(installCalls).toEqual([{ pm: 'bun', pkgs: ['lucide-svelte'] }]);
		expect(result.logs[0]).toContain(
			'Feedback icons: installed lucide-svelte (peer dependency of @dryui/feedback)'
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
		expect(result.logs[0]).toContain(
			'Vite config: added @dryui/feedback and lucide-svelte to ssr.noExternal'
		);
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
			`Vite config: could not patch ${viteConfigPath}: add @dryui/feedback and lucide-svelte to ssr.noExternal manually`
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
			'Feedback widget: install failed: run `bun add @dryui/feedback` manually'
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

	test('reports HTTP status and error summary when the dev server returns 5xx', async () => {
		const root = createTempTree({ 'package.json': '{}' });

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					waitForUrlDetailed: async () => ({
						ok: false,
						status: 500,
						errorSummary:
							"Cannot find module '/p/node_modules/lucide-svelte/dist/icons/index' imported from /p/node_modules/lucide-svelte/dist/lucide-svelte.js"
					}),
					readProjectDevLogTail: () => [
						'[vite] ready in 326 ms',
						'[vite] (ssr) Error when evaluating SSR module /src/routes/+layout.svelte'
					]
				})
			})
		);

		expect(result.logs[0]).toContain('Project dev: failed: HTTP 500 after 30s');
		expect(result.logs[0]).toContain('Project dev error:');
		expect(result.logs[0]).toContain('Cannot find module');
		expect(result.logs[0]).toContain('Project dev log tail:');
		expect(result.logs[0]).toContain('[vite] ready in 326 ms');
		expect(result.logs[0]).toContain('Project dev log: ');
		expect(result.logs[0]).not.toContain('dev=');
	});

	test('reports transport error when the dev server never binds the port', async () => {
		const root = createTempTree({ 'package.json': '{}' });

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					waitForUrlDetailed: async () => ({
						ok: false,
						transportError: 'fetch failed: ECONNREFUSED 127.0.0.1:5173'
					})
				})
			})
		);

		expect(result.logs[0]).toContain(
			'Project dev: failed: no response after 30s (fetch failed: ECONNREFUSED 127.0.0.1:5173)'
		);
		expect(result.logs[0]).not.toContain('dev=');
	});

	test('stays attached in a TTY and kills owned servers on SIGINT', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const killed: number[] = [];

		const promise = captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					spawnProjectDevServer: () => ({ pid: 91234 }),
					ensureFeedbackServer: async () => ({
						baseUrl: FEEDBACK_BASE_URL,
						message: 'started in the background',
						ownedPid: 91235
					}),
					waitForUrlDetailed: async () => ({ ok: true, status: 200 }),
					isInteractiveTTY: () => true,
					killOwnedProcess: (pid) => {
						killed.push(pid);
					}
				})
			})
		);

		// Give the launcher a tick to print output and install signal handlers.
		await new Promise((r) => setTimeout(r, 20));
		process.emit('SIGINT');

		const result = await promise;
		expect(result.logs[0]).toContain('Tip: press Ctrl-C to stop servers and exit');
		expect(result.logs.join('\n')).toContain('Stopping servers...');
		expect(killed.sort()).toEqual([91234, 91235]);
		expect(result.exitCode).toBe(0);
	});

	test('--detach exits immediately without waiting even in a TTY', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const killed: number[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open', '--detach'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					spawnProjectDevServer: () => ({ pid: 77777 }),
					ensureFeedbackServer: async () => ({
						baseUrl: FEEDBACK_BASE_URL,
						message: 'started in the background',
						ownedPid: 77778
					}),
					waitForUrlDetailed: async () => ({ ok: true, status: 200 }),
					isInteractiveTTY: () => true,
					killOwnedProcess: (pid) => {
						killed.push(pid);
					}
				})
			})
		);

		expect(result.logs[0]).not.toContain('Tip: press Ctrl-C');
		expect(killed).toEqual([]);
		expect(result.exitCode).toBe(0);
	});

	test('does not wait when all servers were already running', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const killed: number[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => true,
					isInteractiveTTY: () => true,
					killOwnedProcess: (pid) => {
						killed.push(pid);
					}
				})
			})
		);

		expect(result.logs[0]).not.toContain('Tip: press Ctrl-C');
		expect(killed).toEqual([]);
		expect(result.exitCode).toBe(0);
	});

	test('kills dev server pid when feedback server startup rejects', async () => {
		const root = createTempTree({ 'package.json': '{}' });
		const killed: number[] = [];

		const result = await captureAsyncCommandIO(() =>
			runUserProjectLauncher(['--no-open'], {
				cwd: root,
				spec: STUB_SPEC,
				runtime: buildRuntime({
					detectProject: () => readyDetection(root),
					urlResponds: async () => false,
					findPortHolder: () => null,
					spawnProjectDevServer: () => ({ pid: 55555 }),
					waitForUrlDetailed: async () => ({ ok: true, status: 200 }),
					ensureFeedbackServer: async () => {
						throw new Error('feedback boom');
					},
					killOwnedProcess: (pid) => {
						killed.push(pid);
					}
				})
			})
		);

		expect(killed).toEqual([55555]);
		expect(result.exitCode).toBe(1);
		expect(result.logs.join('\n')).toContain('feedback boom');
	});
});
