import { CLI_DEFINITIONS, type CliId } from './cli-definitions.ts';
import { launcherState } from './launcher-state.svelte.ts';
import { saveCliValidation, saveSession } from '../routes/session.remote.ts';

type ServerMessage =
	| { type: 'welcome' }
	| { type: 'pong' }
	| {
			type: 'validation-result';
			cli: CliId;
			status: 'found' | 'not-found' | 'error';
			version?: string;
			path?: string;
			error?: string;
	  }
	| { type: 'pty-output'; data: string; process?: 'cli' | 'dev-server' }
	| { type: 'pty-exit'; code: number | null; process?: 'cli' | 'dev-server' }
	| { type: 'pty-error'; error: string; process?: 'cli' | 'dev-server' }
	| { type: 'dev-server-ready'; url: string }
	| {
			type: 'version-check';
			cli: CliId;
			installed: string;
			latest: string;
			updateAvailable: boolean;
	  }
	| { type: 'folder-picked'; path: string | null }
	| {
			type: 'project-analysis';
			status: 'greenfield' | 'installed' | 'error';
			framework?: string;
			packageManager?: string;
			installedVersion?: string;
			latestVersion?: string;
			updateAvailable?: boolean;
			error?: string;
	  }
	| { type: 'setup-progress'; step: string; status: 'running' | 'done' | 'failed'; output?: string }
	| { type: 'setup-complete' }
	| { type: 'setup-error'; step: string; error: string }
	| { type: 'agent-output'; sessionId: string; data: string }
	| { type: 'agent-exit'; sessionId: string; code: number | null }
	| { type: 'agent-error'; sessionId: string; error: string }
	| {
			type: 'agent-sessions-list';
			sessions: Array<{
				sessionId: string;
				annotationId: string | null;
				prompt: string;
				startedAt: number;
			}>;
	  }
	| { type: 'theme-applied'; success: boolean; error?: string };

type SetupMessage = Extract<
	ServerMessage,
	{ type: 'setup-progress' | 'setup-complete' | 'setup-error' }
>;

let ws: WebSocket | null = null;
let folderResolve: ((path: string | null) => void) | null = null;
let themeAppliedResolve: ((result: { success: boolean; error?: string }) => void) | null = null;
let setupQueue = Promise.resolve();
let setupRunId = 0;

const SETUP_STEP_HOLD_MS = 180;
const SETUP_COMPLETE_HOLD_MS = 240;

const AUTH_PATTERNS = [
	/not logged in/i,
	/please run \/login/i,
	/401 unauthorized/i,
	/authentication required/i,
	/no authentication/i,
	/please run .* login/i,
	/missing api.?key/i,
	/invalid api.?key/i,
	/login first/i,
	/please .* log in/i,
	/press any key to log in/i
];

function needsCliAuth(output: string): boolean {
	return AUTH_PATTERNS.some((pattern) => pattern.test(output));
}

function persistCliValidationSuccess(cliId: CliId) {
	if (launcherState.cliValidated[cliId]) return;

	launcherState.setCliValidated(cliId, true);
	launcherState.setCurrentStep('project');

	const validation = launcherState.validations[cliId];

	void saveCliValidation({
		cliId,
		status: 'found',
		version: validation.version ?? null,
		path: validation.path ?? null
	});

	void saveSession({
		selected_cli: cliId,
		project_path: launcherState.projectPath,
		current_step: 'project'
	});
}

function delay(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function resetSetupQueue() {
	setupRunId += 1;
	setupQueue = Promise.resolve();
}

function queueSetupMessage(message: SetupMessage) {
	const runId = setupRunId;

	setupQueue = setupQueue.then(async () => {
		if (runId !== setupRunId) return;

		switch (message.type) {
			case 'setup-progress': {
				const state = {
					status: message.status,
					...(message.output !== undefined ? { output: message.output } : {})
				} satisfies Parameters<typeof launcherState.updateSetupStep>[1];

				launcherState.updateSetupStep(message.step, state);
				if (message.status === 'done' || message.status === 'failed') {
					await delay(SETUP_STEP_HOLD_MS);
				}
				return;
			}

			case 'setup-complete':
				await delay(SETUP_COMPLETE_HOLD_MS);
				if (runId === setupRunId) launcherState.setSetupStatus('complete');
				return;

			case 'setup-error':
				launcherState.setSetupError({ step: message.step, error: message.error });
				launcherState.setSetupStatus('failed');
				await delay(SETUP_COMPLETE_HOLD_MS);
				return;
		}
	});
}

function handleMessage(event: MessageEvent) {
	let msg: ServerMessage;
	try {
		msg = JSON.parse(event.data as string) as ServerMessage;
	} catch {
		return;
	}

	switch (msg.type) {
		case 'welcome':
			launcherState.setWsConnected(true);
			break;

		case 'validation-result':
			launcherState.setValidationResult(msg.cli, {
				status: msg.status,
				...(msg.version !== undefined ? { version: msg.version } : {}),
				...(msg.path !== undefined ? { path: msg.path } : {}),
				...(msg.error !== undefined ? { error: msg.error } : {})
			});
			break;

		case 'pty-output':
			if (msg.process === 'dev-server') {
				launcherState.appendDevServerOutput(msg.data);
			} else {
				launcherState.appendPtyOutput(msg.data);
			}
			break;

		case 'pty-exit':
			if (msg.process === 'dev-server') {
				launcherState.setDevServerRunning(false);
			} else {
				launcherState.setPtyExited(true);
				if (
					launcherState.selectedCli &&
					!launcherState.ptyError &&
					!needsCliAuth(launcherState.ptyOutput)
				) {
					persistCliValidationSuccess(launcherState.selectedCli);
				}
			}
			break;

		case 'pty-error':
			if (msg.process === 'dev-server') {
				launcherState.setDevServerError(msg.error);
			} else {
				launcherState.setPtyError(msg.error);
			}
			break;

		case 'dev-server-ready':
			launcherState.setDevServerUrl(msg.url);
			break;

		case 'version-check':
			launcherState.setVersionInfo(msg.cli, {
				installed: msg.installed,
				latest: msg.latest,
				updateAvailable: msg.updateAvailable
			});
			break;

		case 'folder-picked':
			launcherState.setProjectPath(msg.path);
			if (folderResolve) {
				folderResolve(msg.path);
				folderResolve = null;
			}
			break;

		case 'project-analysis': {
			const analysis: Parameters<typeof launcherState.setProjectAnalysis>[0] = {
				status: msg.status
			};
			if (msg.installedVersion !== undefined) analysis.installedVersion = msg.installedVersion;
			if (msg.latestVersion !== undefined) analysis.latestVersion = msg.latestVersion;
			if (msg.updateAvailable !== undefined) analysis.updateAvailable = msg.updateAvailable;
			if (msg.error !== undefined) analysis.error = msg.error;
			if (msg.framework !== undefined) analysis.framework = msg.framework;
			if (msg.packageManager !== undefined) analysis.packageManager = msg.packageManager;
			launcherState.setProjectAnalysis(analysis);
			break;
		}

		case 'setup-progress':
			queueSetupMessage(msg);
			break;

		case 'setup-complete':
			queueSetupMessage(msg);
			break;

		case 'setup-error':
			queueSetupMessage(msg);
			break;

		case 'agent-output':
			launcherState.appendAgentOutput(msg.sessionId, msg.data);
			break;

		case 'agent-exit':
			launcherState.setAgentExited(msg.sessionId, msg.code);
			break;

		case 'agent-error':
			launcherState.setAgentError(msg.sessionId, msg.error);
			break;

		case 'theme-applied':
			if (themeAppliedResolve) {
				themeAppliedResolve({
					success: msg.success,
					...(msg.error !== undefined ? { error: msg.error } : {})
				});
				themeAppliedResolve = null;
			}
			break;
	}
}

export function connect(url = 'ws://127.0.0.1:4210/ws') {
	if (ws) return;

	const socket = new WebSocket(url);
	ws = socket;

	socket.addEventListener('open', () => {
		if (ws === socket) launcherState.setWsConnected(true);
	});
	socket.addEventListener('message', (event) => {
		if (ws === socket) handleMessage(event);
	});
	socket.addEventListener('close', () => {
		// Only update state if this is still the active connection
		// (prevents stale close events from overwriting a new connection)
		if (ws === socket) {
			launcherState.setWsConnected(false);
			ws = null;
		}
	});
	socket.addEventListener('error', () => {
		if (ws === socket) launcherState.setWsConnected(false);
	});
}

/** Wait until the WebSocket is open, or reject after timeout. */
export function waitForConnection(timeoutMs = 5000): Promise<void> {
	return new Promise((resolve, reject) => {
		if (ws && ws.readyState === WebSocket.OPEN) {
			resolve();
			return;
		}
		const timer = setTimeout(() => {
			reject(new Error('WebSocket connection timeout'));
		}, timeoutMs);
		const check = () => {
			if (ws && ws.readyState === WebSocket.OPEN) {
				clearTimeout(timer);
				resolve();
			} else {
				setTimeout(check, 50);
			}
		};
		check();
	});
}

export function disconnect() {
	resetSetupQueue();
	const old = ws;
	ws = null;
	old?.close();
}

export function requestValidation(cli: CliId) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	launcherState.setValidating(cli);
	ws.send(JSON.stringify({ type: 'validate', cli }));
}

export function requestValidateAll() {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	for (const def of CLI_DEFINITIONS) {
		launcherState.setValidating(def.id);
		ws.send(JSON.stringify({ type: 'validate', cli: def.id }));
	}
}

export function requestCheckVersions() {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify({ type: 'check-versions' }));
}

export function spawnCli(cli: CliId, prompt?: string, cwd?: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	launcherState.resetPty();
	ws.send(JSON.stringify({ type: 'spawn-cli', cli, prompt, cwd }));
}

export function sendPtyInput(data: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify({ type: 'pty-input', data }));
}

export function pickFolder(): Promise<string | null> {
	if (!ws || ws.readyState !== WebSocket.OPEN) return Promise.resolve(null);
	return new Promise((resolve) => {
		folderResolve = resolve;
		ws!.send(JSON.stringify({ type: 'pick-folder' }));
	});
}

export function analyzeProject(path: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	resetSetupQueue();
	launcherState.setProjectAnalysis({ status: 'analyzing' });
	ws.send(JSON.stringify({ type: 'analyze-project', path }));
}

export function setupProject(
	path: string,
	cli: CliId,
	mode: 'install' | 'update',
	packageManager: string
) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	resetSetupQueue();
	launcherState.resetSetup();
	launcherState.setSetupStatus('running');
	ws.send(JSON.stringify({ type: 'setup-project', path, cli, mode, packageManager }));
}

export function startDevServer(cwd: string, packageManager: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	launcherState.resetDevServer();
	launcherState.setDevServerRunning(true);
	ws.send(JSON.stringify({ type: 'start-dev-server', cwd, packageManager }));
}

export function stopDevServer() {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify({ type: 'stop-dev-server' }));
	launcherState.setDevServerRunning(false);
}

export function spawnAgent(
	sessionId: string,
	cli: CliId,
	prompt: string,
	cwd: string,
	annotationId?: string
) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	launcherState.initAgentSession(sessionId, prompt, Date.now());
	ws.send(JSON.stringify({ type: 'spawn-agent', sessionId, cli, prompt, cwd, annotationId }));
}

export function subscribeSession(sessionId: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify({ type: 'subscribe-session', sessionId }));
}

export function unsubscribeSession(sessionId: string) {
	if (!ws || ws.readyState !== WebSocket.OPEN) return;
	ws.send(JSON.stringify({ type: 'unsubscribe-session', sessionId }));
}

export function applyTheme(
	projectPath: string,
	defaultCss: string,
	darkCss: string,
	recipe: string
): Promise<{ success: boolean; error?: string }> {
	if (!ws || ws.readyState !== WebSocket.OPEN) {
		return Promise.resolve({ success: false, error: 'WebSocket not connected' });
	}
	return new Promise((resolve) => {
		themeAppliedResolve = resolve;
		ws!.send(JSON.stringify({ type: 'apply-theme', projectPath, defaultCss, darkCss, recipe }));
	});
}
