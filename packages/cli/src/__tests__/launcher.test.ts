import { afterEach, describe, expect, test } from 'bun:test';
import { EventEmitter } from 'node:events';
import { resolve } from 'node:path';
import {
	buildDashboardUrl,
	findLauncherWorkspaceRoot,
	isHealthyProbeStatus,
	runLauncher,
	waitForShutdownSignal
} from '../commands/launcher.js';
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

	test('omits dev param when docsBaseUrl is null', () => {
		const url = buildDashboardUrl(FEEDBACK_BASE_URL, null, 42);
		expect(url).toBe(`${FEEDBACK_BASE_URL}/ui/?v=42`);
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

	test('opens the site url when --no-open is absent', async () => {
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
