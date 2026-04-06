import { spawn, type ChildProcess } from 'node:child_process';
import { readFile, access } from 'node:fs/promises';
import { isAbsolute, join } from 'node:path';
import {
	getAgentSession,
	insertAgentSession,
	listAgentSessions,
	updateAgentSession,
	type AgentSessionRow
} from './agent-store.ts';
import { validateCli, CLI_DEFINITIONS } from './validator.ts';
import {
	applyTheme,
	getInstalledPackageVersion,
	getLocalDryuiVersion,
	runInstallPipeline,
	runUpdatePipeline
} from './setup-pipeline.ts';
import { AgentManager } from './agent-manager.ts';
import {
	clearSession,
	deleteCliValidation,
	deleteProject,
	getAllProjects,
	getDb,
	getSessionSnapshot,
	saveThemeRecipe,
	setActiveProject,
	upsertCliValidation,
	upsertSession
} from './session-db.ts';
import type { ClientMessage, ServerMessage, CliId, Framework, PackageManager } from './types.ts';
import type { SaveCliValidationInput, SaveSessionInput } from '../src/lib/session-types.ts';

const PORT = Number(process.env['DRYUI_LAUNCHER_PORT'] ?? '4210');
const HOST = process.env['DRYUI_LAUNCHER_HOST'] ?? '127.0.0.1';
const DEV_SERVER_ERROR_PATTERNS = [
	/error/i,
	/failed/i,
	/\u2718/,
	/Cannot find/i,
	/ReferenceError/i,
	/TypeError/i
];
const MAX_DEV_SERVER_LOG_LINES = 200;
const MAX_DEV_SERVER_ERROR_LINES = 10;

interface ProcessEntry {
	process: ChildProcess;
	buffer: string;
}

interface CliSession {
	processes: Map<string, ProcessEntry>;
}

/** One session per WebSocket connection */
const sessions = new Map<object, CliSession>();

const JSON_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};
const devServerLogs = new Map<string, string[]>();

function appendDevServerLog(projectPath: string, text: string): void {
	const trimmedLines = text
		.split('\n')
		.map((line) => line.trim())
		.filter(Boolean);

	if (trimmedLines.length === 0) return;

	const existing = devServerLogs.get(projectPath) ?? [];
	existing.push(...trimmedLines);
	if (existing.length > MAX_DEV_SERVER_LOG_LINES) {
		existing.splice(0, existing.length - MAX_DEV_SERVER_LOG_LINES);
	}
	devServerLogs.set(projectPath, existing);
}

function resetDevServerLog(projectPath: string): void {
	devServerLogs.set(projectPath, []);
}

function getProjectDiagnostics(projectPath: string): string | null {
	const lines = devServerLogs.get(projectPath) ?? [];
	const errors = lines.filter((line) =>
		DEV_SERVER_ERROR_PATTERNS.some((pattern) => pattern.test(line))
	);
	if (errors.length === 0) return null;
	return errors.slice(-MAX_DEV_SERVER_ERROR_LINES).join('\n');
}

function cleanupProcess(ws: object, name: string) {
	const session = sessions.get(ws);
	if (!session) return;
	const entry = session.processes.get(name);
	if (entry) {
		entry.process.kill('SIGTERM');
		session.processes.delete(name);
	}
	if (session.processes.size === 0) sessions.delete(ws);
}

function cleanupSession(ws: object) {
	const session = sessions.get(ws);
	if (!session) return;
	for (const entry of session.processes.values()) {
		entry.process.kill('SIGTERM');
	}
	sessions.delete(ws);
}

function getOrCreateSession(ws: object): CliSession {
	let session = sessions.get(ws);
	if (!session) {
		session = { processes: new Map() };
		sessions.set(ws, session);
	}
	return session;
}

function encode(msg: ServerMessage): string {
	return JSON.stringify(msg);
}

function decode(raw: string | ArrayBufferLike): ClientMessage | null {
	try {
		const text = typeof raw === 'string' ? raw : new TextDecoder().decode(raw as ArrayBuffer);
		return JSON.parse(text) as ClientMessage;
	} catch {
		return null;
	}
}

function json(data: unknown, status = 200): Response {
	return Response.json(data, {
		status,
		headers: JSON_HEADERS
	});
}

function methodNotAllowed(): Response {
	return new Response('Method not allowed', {
		status: 405,
		headers: JSON_HEADERS
	});
}

async function fileExists(path: string): Promise<boolean> {
	try {
		await access(path);
		return true;
	} catch {
		return false;
	}
}

function hasAbsoluteProjectPath(projectPath: string): boolean {
	return isAbsolute(projectPath);
}

async function detectFramework(
	projectPath: string,
	deps: Record<string, string>,
	devDeps: Record<string, string>
): Promise<Framework> {
	const allDeps = { ...deps, ...devDeps };
	const hasSvelteConfig =
		(await fileExists(join(projectPath, 'svelte.config.js'))) ||
		(await fileExists(join(projectPath, 'svelte.config.ts')));
	if (hasSvelteConfig) return 'sveltekit';
	if (allDeps['svelte']) return 'svelte';
	if (allDeps['react'] || allDeps['react-dom']) return 'react';
	if (allDeps['@angular/core']) return 'angular';
	if (allDeps['vue']) return 'vue';
	return 'unknown';
}

async function detectPackageManager(projectPath: string): Promise<PackageManager> {
	if (
		(await fileExists(join(projectPath, 'bun.lock'))) ||
		(await fileExists(join(projectPath, 'bun.lockb')))
	)
		return 'bun';
	if (await fileExists(join(projectPath, 'pnpm-lock.yaml'))) return 'pnpm';
	if (await fileExists(join(projectPath, 'package-lock.json'))) return 'npm';
	return 'npm';
}

const agentManager = new AgentManager(getDb(), { getProjectDiagnostics });

const server = Bun.serve({
	hostname: HOST,
	port: PORT,
	idleTimeout: 255,

	async fetch(request, server) {
		const url = new URL(request.url);

		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: JSON_HEADERS
			});
		}

		if (url.pathname === '/api/session') {
			if (request.method === 'GET') {
				return json(getSessionSnapshot());
			}

			if (request.method === 'PUT') {
				return request
					.json()
					.then((body) => {
						upsertSession(body as SaveSessionInput);
						return json({ ok: true });
					})
					.catch((error) =>
						json({ error: error instanceof Error ? error.message : String(error) }, 400)
					);
			}

			if (request.method === 'DELETE') {
				clearSession();
				return json({ ok: true });
			}

			return methodNotAllowed();
		}

		if (url.pathname === '/api/session/cli-validation') {
			if (request.method === 'PUT') {
				return request
					.json()
					.then((body) => {
						const payload = body as SaveCliValidationInput;
						upsertCliValidation(payload);
						return json({ ok: true });
					})
					.catch((error) =>
						json({ error: error instanceof Error ? error.message : String(error) }, 400)
					);
			}

			return methodNotAllowed();
		}

		if (url.pathname.startsWith('/api/session/cli-validation/')) {
			if (request.method === 'DELETE') {
				const cliId = decodeURIComponent(
					url.pathname.slice('/api/session/cli-validation/'.length)
				) as CliId;
				deleteCliValidation(cliId);
				return json({ ok: true });
			}

			return methodNotAllowed();
		}

		if (url.pathname === '/api/projects') {
			if (request.method === 'GET') {
				return json(getAllProjects());
			}
			return methodNotAllowed();
		}

		if (url.pathname.startsWith('/api/projects/')) {
			const projectPath = decodeURIComponent(url.pathname.slice('/api/projects/'.length));

			if (request.method === 'PUT') {
				// Switch to this project
				setActiveProject(projectPath);
				return json({ ok: true });
			}

			if (request.method === 'DELETE') {
				deleteProject(projectPath);
				return json({ ok: true });
			}

			return methodNotAllowed();
		}

		if (url.pathname === '/api/agent-sessions') {
			if (request.method === 'POST') {
				return request
					.json()
					.then((body) => {
						const input = body as Partial<AgentSessionRow>;
						const row: AgentSessionRow = {
							id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
							annotation_id: typeof input.annotation_id === 'string' ? input.annotation_id : null,
							project_path: typeof input.project_path === 'string' ? input.project_path : '',
							cli: typeof input.cli === 'string' ? input.cli : '',
							prompt: typeof input.prompt === 'string' ? input.prompt : '',
							status: typeof input.status === 'string' ? input.status : 'running',
							progress_state:
								typeof input.progress_state === 'string' ? input.progress_state : 'working',
							attempt: typeof input.attempt === 'number' ? input.attempt : 1,
							retry_of_session_id:
								typeof input.retry_of_session_id === 'string' ? input.retry_of_session_id : null,
							exit_code: typeof input.exit_code === 'number' ? input.exit_code : null,
							started_at: typeof input.started_at === 'number' ? input.started_at : Date.now(),
							spawned_at: typeof input.spawned_at === 'number' ? input.spawned_at : null,
							first_output_at:
								typeof input.first_output_at === 'number' ? input.first_output_at : null,
							first_edit_at: typeof input.first_edit_at === 'number' ? input.first_edit_at : null,
							last_output_at:
								typeof input.last_output_at === 'number' ? input.last_output_at : null,
							finished_at: typeof input.finished_at === 'number' ? input.finished_at : null,
							terminal_reason:
								typeof input.terminal_reason === 'string' ? input.terminal_reason : null,
							failure_reason: typeof input.failure_reason === 'string' ? input.failure_reason : null
						};
						insertAgentSession(getDb(), row);
						return json(row, 201);
					})
					.catch((error) =>
						json({ error: error instanceof Error ? error.message : String(error) }, 400)
					);
			}

			if (request.method === 'GET') {
				return json(
					listAgentSessions(getDb(), {
						status: url.searchParams.get('status') ?? undefined,
						project_path: url.searchParams.get('project_path') ?? undefined,
						annotation_id: url.searchParams.get('annotation_id') ?? undefined
					})
				);
			}

			return methodNotAllowed();
		}

		if (url.pathname.startsWith('/api/agent-sessions/')) {
			const sessionId = decodeURIComponent(url.pathname.slice('/api/agent-sessions/'.length));

			if (request.method === 'GET') {
				const session = getAgentSession(getDb(), sessionId);
				return session ? json(session) : json({ error: 'Not found' }, 404);
			}

			if (request.method === 'PATCH') {
				return request
					.json()
					.then((body) => {
						const session = updateAgentSession(
							getDb(),
							sessionId,
							body as Partial<Omit<AgentSessionRow, 'id'>>
						);
						return session ? json(session) : json({ error: 'Not found' }, 404);
					})
					.catch((error) =>
						json({ error: error instanceof Error ? error.message : String(error) }, 400)
					);
			}

			return methodNotAllowed();
		}

		if (url.pathname === '/ws') {
			if (server.upgrade(request)) {
				return new Response(null, { status: 101 });
			}
			return new Response('WebSocket upgrade failed', { status: 400 });
		}

		return new Response('DryUI Launcher Server', { status: 200 });
	},

	websocket: {
		open(ws) {
			ws.send(encode({ type: 'welcome' }));
		},

		async message(ws, raw) {
			const msg = decode(typeof raw === 'string' ? raw : (raw.buffer as ArrayBuffer));
			if (!msg) return;

			switch (msg.type) {
				case 'ping':
					ws.send(encode({ type: 'pong' }));
					break;

				case 'validate': {
					validateCli(msg.cli).then((result) => ws.send(encode(result)));
					break;
				}

				case 'spawn-cli': {
					cleanupProcess(ws, 'cli');

					const CLI_DEFS: Record<string, { command: string; args: string[] }> = {
						'claude-code': {
							command: 'claude',
							args: [
								'--print',
								'--verbose',
								'--output-format',
								'stream-json',
								'--permission-mode',
								'bypassPermissions'
							]
						},
						codex: { command: 'codex', args: ['exec', '--json', '--skip-git-repo-check'] },
						'gemini-cli': {
							command: 'gemini',
							args: ['--output-format', 'stream-json', '--prompt']
						},
						'copilot-cli': { command: 'copilot', args: ['--output-format', 'json', '-p'] },
						opencode: { command: 'opencode', args: ['run', '--format', 'json'] },
						cursor: { command: 'agent', args: ['-p', '--output-format', 'stream-json'] }
					};
					const cliCmd = CLI_DEFS[msg.cli];
					if (!cliCmd) {
						ws.send(
							encode({ type: 'pty-error', error: `Unknown CLI: ${msg.cli}`, process: 'cli' })
						);
						break;
					}

					try {
						// The prompt is appended as the last arg for CLIs that take it positionally
						const prompt = msg.prompt || 'Respond with: ok';
						const args = [...cliCmd.args, prompt];

						const child = spawn(cliCmd.command, args, {
							cwd: msg.cwd || undefined,
							stdio: ['pipe', 'pipe', 'pipe'],
							env: { ...process.env, PATH: process.env['PATH'], NO_COLOR: '1' }
						});

						child.stdin.end();
						const session = getOrCreateSession(ws);
						const entry: ProcessEntry = { process: child, buffer: '' };
						session.processes.set('cli', entry);

						// Stream stdout line-by-line — each line is a JSON event
						child.stdout?.on('data', (chunk: Buffer) => {
							entry.buffer += chunk.toString();
							const lines = entry.buffer.split('\n');
							entry.buffer = lines.pop() ?? '';
							for (const line of lines) {
								const trimmed = line.trim();
								if (!trimmed) continue;
								ws.send(encode({ type: 'pty-output', data: trimmed, process: 'cli' }));
							}
						});

						// Stderr — could be auth errors or warnings
						child.stderr?.on('data', (chunk: Buffer) => {
							ws.send(encode({ type: 'pty-output', data: chunk.toString(), process: 'cli' }));
						});

						child.on('error', (err) => {
							ws.send(encode({ type: 'pty-error', error: err.message, process: 'cli' }));
							session.processes.delete('cli');
							if (session.processes.size === 0) sessions.delete(ws);
						});

						child.on('close', (code) => {
							// Flush remaining buffer
							if (entry.buffer.trim()) {
								ws.send(encode({ type: 'pty-output', data: entry.buffer.trim(), process: 'cli' }));
							}
							ws.send(encode({ type: 'pty-exit', code, process: 'cli' }));
							session.processes.delete('cli');
							if (session.processes.size === 0) sessions.delete(ws);
						});
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err);
						ws.send(encode({ type: 'pty-error', error: message, process: 'cli' }));
					}
					break;
				}

				case 'spawn-agent': {
					const ok = agentManager.spawn({
						sessionId: msg.sessionId,
						annotationId: msg.annotationId,
						cli: msg.cli,
						prompt: msg.prompt,
						cwd: msg.cwd
					});
					if (ok) {
						agentManager.subscribe(msg.sessionId, ws);
					} else {
						ws.send(
							encode({
								type: 'agent-error',
								sessionId: msg.sessionId,
								error: 'Failed to spawn agent'
							})
						);
					}
					break;
				}

				case 'subscribe-session': {
					const ok = agentManager.subscribe(msg.sessionId, ws);
					if (!ok) {
						ws.send(encode({ type: 'agent-exit', sessionId: msg.sessionId, code: null }));
					}
					break;
				}

				case 'unsubscribe-session': {
					agentManager.unsubscribe(msg.sessionId, ws);
					break;
				}

				case 'pty-input': {
					const session = sessions.get(ws);
					const entry = session?.processes.get('cli');
					if (entry) {
						entry.process.stdin?.write(msg.data);
					}
					break;
				}

				case 'pty-resize':
					break;

				case 'pick-folder': {
					try {
						const proc = Bun.spawn(
							[
								'osascript',
								'-e',
								'POSIX path of (choose folder with prompt "Select project folder")'
							],
							{ stdout: 'pipe', stderr: 'pipe' }
						);
						const exitCode = await proc.exited;
						if (exitCode === 0) {
							const stdout = await new Response(proc.stdout).text();
							const folderPath = stdout.trim().replace(/\/$/, '');
							ws.send(encode({ type: 'folder-picked', path: folderPath }));
						} else {
							ws.send(encode({ type: 'folder-picked', path: null }));
						}
					} catch {
						ws.send(encode({ type: 'folder-picked', path: null }));
					}
					break;
				}

				case 'check-versions': {
					Promise.all(
						CLI_DEFINITIONS.filter((def) => def.npmPackage).map(async (def) => {
							try {
								const result = await validateCli(def.id);
								if (result.status !== 'found' || !result.version) return;

								const semverMatch = result.version.match(/(\d+\.\d+\.\d+)/);
								const installed = semverMatch?.[1] ?? result.version;

								const resp = await fetch(`https://registry.npmjs.org/${def.npmPackage}/latest`);
								if (!resp.ok) return;
								const data = (await resp.json()) as { version: string };
								const latest = data.version;

								ws.send(
									encode({
										type: 'version-check',
										cli: def.id,
										installed,
										latest,
										updateAvailable: installed !== latest
									})
								);
							} catch {}
						})
					);
					break;
				}

				case 'analyze-project': {
					try {
						if (!hasAbsoluteProjectPath(msg.path)) {
							ws.send(
								encode({
									type: 'project-analysis',
									status: 'error',
									error:
										'Select a project folder from the launcher picker so DryUI can use an absolute path.'
								})
							);
							break;
						}

						const pkgPath = join(msg.path, 'package.json');
						let pkgJson: {
							dependencies?: Record<string, string>;
							devDependencies?: Record<string, string>;
						};
						try {
							const raw = await readFile(pkgPath, 'utf-8');
							pkgJson = JSON.parse(raw);
						} catch {
							ws.send(
								encode({
									type: 'project-analysis',
									status: 'greenfield',
									framework: 'unknown',
									packageManager: 'npm'
								})
							);
							break;
						}

						const deps = pkgJson.dependencies ?? {};
						const devDeps = pkgJson.devDependencies ?? {};
						const framework = await detectFramework(msg.path, deps, devDeps);
						const packageManager = await detectPackageManager(msg.path);
						const specifier = deps['@dryui/ui'] ?? devDeps['@dryui/ui'];

						if (!specifier) {
							ws.send(
								encode({
									type: 'project-analysis',
									status: 'greenfield',
									framework,
									packageManager
								})
							);
							break;
						}

						const installedVersion = await getInstalledPackageVersion(msg.path, '@dryui/ui');
						if (!installedVersion) {
							ws.send(
								encode({
									type: 'project-analysis',
									status: 'greenfield',
									framework,
									packageManager
								})
							);
							break;
						}

						let latestVersion: string | undefined;
						let updateAvailable = false;
						try {
							const resp = await fetch('https://registry.npmjs.org/@dryui/ui/latest');
							if (resp.ok) {
								const data = (await resp.json()) as { version: string };
								latestVersion = data.version;
								if (installedVersion && latestVersion) {
									const installedClean = installedVersion.replace(/^[\^~>=<]*/g, '');
									updateAvailable = installedClean !== latestVersion;
								}
							}
						} catch {}

						if (!latestVersion) {
							latestVersion = (await getLocalDryuiVersion()) ?? undefined;
							if (installedVersion && latestVersion) {
								const installedClean = installedVersion.replace(/^[\^~>=<]*/g, '');
								updateAvailable = installedClean !== latestVersion;
							}
						}

						ws.send(
							encode({
								type: 'project-analysis',
								status: 'installed',
								framework,
								packageManager,
								installedVersion,
								latestVersion,
								updateAvailable
							})
						);
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err);
						ws.send(encode({ type: 'project-analysis', status: 'error', error: message }));
					}
					break;
				}

				case 'start-dev-server': {
					cleanupProcess(ws, 'dev-server');
					resetDevServerLog(msg.cwd);

					const PM_INSTALL: Record<PackageManager, { command: string; args: string[] }> = {
						bun: { command: 'bun', args: ['install'] },
						npm: { command: 'npm', args: ['install'] },
						pnpm: { command: 'pnpm', args: ['install'] }
					};

					const PM_DEV: Record<PackageManager, { command: string; args: string[] }> = {
						bun: { command: 'bun', args: ['run', 'dev'] },
						npm: { command: 'npm', args: ['run', 'dev'] },
						pnpm: { command: 'pnpm', args: ['dev'] }
					};

					const pmInstall = PM_INSTALL[msg.packageManager] ?? PM_INSTALL.npm;
					const pm = PM_DEV[msg.packageManager] ?? PM_DEV.npm;

					const spawnEnv = { ...process.env, PATH: process.env['PATH'], NO_COLOR: '1' };

					const startDevServer = () => {
						const child = spawn(pm.command, pm.args, {
							cwd: msg.cwd,
							stdio: ['pipe', 'pipe', 'pipe'],
							env: spawnEnv
						});

						const session = getOrCreateSession(ws);
						const entry: ProcessEntry = { process: child, buffer: '' };
						session.processes.set('dev-server', entry);

						child.stdout?.on('data', (chunk: Buffer) => {
							const text = chunk.toString();
							entry.buffer += text;
							const lines = entry.buffer.split('\n');
							entry.buffer = lines.pop() ?? '';
							for (const line of lines) {
								const trimmed = line.trim();
								if (!trimmed) continue;
								appendDevServerLog(msg.cwd, trimmed);
								ws.send(encode({ type: 'pty-output', data: trimmed, process: 'dev-server' }));
								const urlMatch = trimmed.match(/Local:\s+(https?:\/\/\S+)/);
								if (urlMatch?.[1]) {
									ws.send(encode({ type: 'dev-server-ready', url: urlMatch[1] }));
								}
							}
						});

						child.stderr?.on('data', (chunk: Buffer) => {
							const text = chunk.toString();
							appendDevServerLog(msg.cwd, text);
							ws.send(encode({ type: 'pty-output', data: text, process: 'dev-server' }));
						});

						child.on('error', (err) => {
							appendDevServerLog(msg.cwd, err.message);
							ws.send(encode({ type: 'pty-error', error: err.message, process: 'dev-server' }));
						});

						child.on('close', (code) => {
							if (entry.buffer.trim()) {
								appendDevServerLog(msg.cwd, entry.buffer.trim());
								ws.send(
									encode({ type: 'pty-output', data: entry.buffer.trim(), process: 'dev-server' })
								);
							}
							ws.send(encode({ type: 'pty-exit', code, process: 'dev-server' }));
							session.processes.delete('dev-server');
							if (session.processes.size === 0) sessions.delete(ws);
						});
					};

					try {
						appendDevServerLog(msg.cwd, `$ ${pmInstall.command} ${pmInstall.args.join(' ')}`);
						ws.send(
							encode({
								type: 'pty-output',
								data: `$ ${pmInstall.command} ${pmInstall.args.join(' ')}`,
								process: 'dev-server'
							})
						);
						const install = spawn(pmInstall.command, pmInstall.args, {
							cwd: msg.cwd,
							stdio: ['pipe', 'pipe', 'pipe'],
							env: spawnEnv
						});

						install.stdout?.on('data', (chunk: Buffer) => {
							const text = chunk.toString();
							appendDevServerLog(msg.cwd, text);
							ws.send(encode({ type: 'pty-output', data: text, process: 'dev-server' }));
						});

						install.stderr?.on('data', (chunk: Buffer) => {
							const text = chunk.toString();
							appendDevServerLog(msg.cwd, text);
							ws.send(encode({ type: 'pty-output', data: text, process: 'dev-server' }));
						});

						install.on('close', (installCode) => {
							if (installCode !== 0) {
								appendDevServerLog(msg.cwd, `Install failed (exit ${installCode})`);
								ws.send(
									encode({
										type: 'pty-error',
										error: `Install failed (exit ${installCode})`,
										process: 'dev-server'
									})
								);
								ws.send(encode({ type: 'pty-exit', code: installCode, process: 'dev-server' }));
								return;
							}
							startDevServer();
						});
					} catch (err) {
						const message = err instanceof Error ? err.message : String(err);
						appendDevServerLog(msg.cwd, message);
						ws.send(encode({ type: 'pty-error', error: message, process: 'dev-server' }));
					}
					break;
				}

				case 'stop-dev-server': {
					cleanupProcess(ws, 'dev-server');
					break;
				}

				case 'setup-project': {
					if (!hasAbsoluteProjectPath(msg.path)) {
						ws.send(
							encode({
								type: 'setup-error',
								step: msg.mode === 'install' ? 'install-package' : 'update-package',
								error:
									'Select a project folder from the launcher picker so DryUI can install into an absolute path.'
							})
						);
						break;
					}

					const onProgress: import('./setup-pipeline.ts').ProgressCallback = (
						step,
						status,
						output
					) => {
						if (status === 'failed') {
							ws.send(encode({ type: 'setup-error', step, error: output ?? 'Unknown error' }));
						} else {
							ws.send(encode({ type: 'setup-progress', step, status, output }));
						}
					};

					const ctx = {
						path: msg.path,
						cli: msg.cli,
						packageManager: msg.packageManager,
						onProgress
					};

					if (msg.mode === 'install') {
						runInstallPipeline(ctx)
							.then((result) => {
								if (result.success) {
									ws.send(encode({ type: 'setup-complete' }));
								}
							})
							.catch((error) => {
								const message = error instanceof Error ? error.message : String(error);
								ws.send(encode({ type: 'setup-error', step: 'install-package', error: message }));
							});
					} else {
						getInstalledPackageVersion(msg.path, '@dryui/ui')
							.then((version) => version ?? 'unknown')
							.then((oldVersion) => {
								return fetch('https://registry.npmjs.org/@dryui/ui/latest')
									.then(async (r) => {
										if (!r.ok) {
											return (await getLocalDryuiVersion()) ?? 'latest';
										}

										const data = (await r.json()) as { version: string };
										return data.version;
									})
									.catch(async () => (await getLocalDryuiVersion()) ?? 'latest')
									.then((newVersion) => runUpdatePipeline(ctx, oldVersion, newVersion));
							})
							.then((result) => {
								if (result.success) {
									ws.send(encode({ type: 'setup-complete' }));
								}
							})
							.catch((error) => {
								const message = error instanceof Error ? error.message : String(error);
								ws.send(encode({ type: 'setup-error', step: 'update-package', error: message }));
							});
					}
					break;
				}

				case 'apply-theme': {
					try {
						await applyTheme(msg.projectPath, msg.defaultCss, msg.darkCss);
						saveThemeRecipe(msg.projectPath, msg.recipe);
						ws.send(encode({ type: 'theme-applied', success: true }));
					} catch (e) {
						const message = e instanceof Error ? e.message : String(e);
						ws.send(encode({ type: 'theme-applied', success: false, error: message }));
					}
					break;
				}
			}
		},

		close(ws) {
			agentManager.unsubscribeAll(ws);
			cleanupSession(ws);
		}
	}
});

console.log(`DryUI Launcher server listening on http://${HOST}:${PORT}`);

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, () => {
		agentManager.killAll();
		for (const session of sessions.values()) {
			for (const entry of session.processes.values()) {
				entry.process.kill('SIGTERM');
			}
		}
		sessions.clear();
		server.stop(true);
		process.exit(0);
	});
}
