import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { writeFile, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { compileModule } from 'svelte/compiler';
import type { SessionData } from '../../../apps/launcher/src/lib/session-types.ts';

type LauncherStateModule = typeof import('../../../apps/launcher/src/lib/launcher-state.svelte.ts');

let launcherState: LauncherStateModule['launcherState'];
let compiledModulePath: string | null = null;

function seedTransientWorkspaceState() {
	launcherState.setProjectAnalysis({
		status: 'installed',
		framework: 'sveltekit',
		packageManager: 'bun',
		installedVersion: '1.0.0',
		latestVersion: '1.1.0',
		updateAvailable: true,
		error: 'stale analysis'
	});
	launcherState.setSetupStatus('running');
	launcherState.updateSetupStep('install', { status: 'running', output: 'installing' });
	launcherState.setSetupError({ step: 'install', error: 'setup failed' });
	launcherState.resetPty();
	launcherState.appendPtyOutput('agent stdout');
	launcherState.setPtyExited(true);
	launcherState.setPtyError('pty failed');
	launcherState.resetDevServer();
	launcherState.appendDevServerOutput('vite output');
	launcherState.setDevServerRunning(true);
	launcherState.setDevServerUrl('http://127.0.0.1:5173');
	launcherState.setDevServerError('port in use');
	launcherState.initAgentSession('session-1', 'do the thing', 100);
	launcherState.appendAgentOutput('session-1', 'working');
	launcherState.setAgentExited('session-1', 1);
	launcherState.setAgentError('session-1', 'agent failed');
}

function createSession(overrides: Partial<NonNullable<SessionData['session']>>): SessionData {
	return {
		session: {
			id: 1,
			selected_cli: 'codex',
			project_path: '/tmp/project-a',
			current_step: 'workspace',
			updated_at: 1,
			...overrides
		},
		cliValidations: []
	};
}

beforeEach(() => {
	launcherState.clearSession();
});

beforeAll(async () => {
	const source = await Bun.file('apps/launcher/src/lib/launcher-state.svelte.ts').text();
	const transpiled = new Bun.Transpiler({ loader: 'ts' }).transformSync(source);
	const { js } = compileModule(transpiled, {
		filename: 'apps/launcher/src/lib/launcher-state.svelte.ts'
	});
	const tmpDir = join(process.cwd(), 'tmp');
	await mkdir(tmpDir, { recursive: true });
	compiledModulePath = join(tmpDir, `dryui-launcher-state-${crypto.randomUUID()}.mjs`);
	await writeFile(compiledModulePath, js.code, 'utf8');
	({ launcherState } = (await import(
		pathToFileURL(compiledModulePath).href
	)) as LauncherStateModule);
});

afterAll(async () => {
	if (compiledModulePath) {
		await rm(compiledModulePath, { force: true });
		compiledModulePath = null;
	}
});

describe('launcher state resets', () => {
	test('clearSession resets transient workspace state and returns to the launcher start', () => {
		launcherState.select('codex');
		launcherState.setProjectPath('/tmp/project-a');
		seedTransientWorkspaceState();

		launcherState.clearSession();

		expect(launcherState.selectedCli).toBeNull();
		expect(launcherState.projectPath).toBeNull();
		expect(launcherState.currentStep).toBe('cli-selection');
		expect(launcherState.projectAnalysis.status).toBe('idle');
		expect(launcherState.setupStatus).toBe('idle');
		expect(launcherState.setupSteps).toEqual({});
		expect(launcherState.setupError).toBeNull();
		expect(launcherState.ptyOutput).toBe('');
		expect(launcherState.ptyExited).toBe(false);
		expect(launcherState.ptyError).toBeNull();
		expect(launcherState.devServerOutput).toBe('');
		expect(launcherState.devServerRunning).toBe(false);
		expect(launcherState.devServerUrl).toBeNull();
		expect(launcherState.devServerError).toBeNull();
		expect(launcherState.agentSessions.size).toBe(0);
	});

	test('select clears transient workspace state when switching CLIs', () => {
		launcherState.select('codex');
		launcherState.setProjectPath('/tmp/project-a');
		seedTransientWorkspaceState();

		launcherState.select('claude-code');

		expect(launcherState.selectedCli).toBe('claude-code');
		expect(launcherState.projectPath).toBe('/tmp/project-a');
		expect(launcherState.projectAnalysis.status).toBe('idle');
		expect(launcherState.setupStatus).toBe('idle');
		expect(launcherState.ptyOutput).toBe('');
		expect(launcherState.devServerOutput).toBe('');
		expect(launcherState.agentSessions.size).toBe(0);
	});

	test('setProjectPath clears transient workspace state when switching projects', () => {
		launcherState.select('codex');
		launcherState.setProjectPath('/tmp/project-a');
		seedTransientWorkspaceState();

		launcherState.setProjectPath('/tmp/project-b');

		expect(launcherState.selectedCli).toBe('codex');
		expect(launcherState.projectPath).toBe('/tmp/project-b');
		expect(launcherState.projectAnalysis.status).toBe('idle');
		expect(launcherState.setupStatus).toBe('idle');
		expect(launcherState.ptyOutput).toBe('');
		expect(launcherState.devServerOutput).toBe('');
		expect(launcherState.agentSessions.size).toBe(0);
	});

	test('hydrate clears transient workspace state when the persisted path is invalid', () => {
		launcherState.select('codex');
		launcherState.setProjectPath(null);
		seedTransientWorkspaceState();

		launcherState.hydrate(
			createSession({
				project_path: 'relative/project',
				current_step: 'workspace'
			})
		);

		expect(launcherState.selectedCli).toBe('codex');
		expect(launcherState.projectPath).toBeNull();
		expect(launcherState.currentStep).toBe('project');
		expect(launcherState.projectAnalysis.status).toBe('idle');
		expect(launcherState.setupStatus).toBe('idle');
		expect(launcherState.ptyOutput).toBe('');
		expect(launcherState.devServerOutput).toBe('');
		expect(launcherState.agentSessions.size).toBe(0);
	});

	test('hydrate clears transient workspace state when the session cli or project changes', () => {
		launcherState.select('codex');
		launcherState.setProjectPath('/tmp/project-a');
		seedTransientWorkspaceState();

		launcherState.hydrate(
			createSession({
				selected_cli: 'claude-code',
				project_path: '/tmp/project-b',
				current_step: 'workspace'
			})
		);

		expect(launcherState.selectedCli).toBe('claude-code');
		expect(launcherState.projectPath).toBe('/tmp/project-b');
		expect(launcherState.currentStep).toBe('workspace');
		expect(launcherState.projectAnalysis.status).toBe('idle');
		expect(launcherState.setupStatus).toBe('idle');
		expect(launcherState.ptyOutput).toBe('');
		expect(launcherState.devServerOutput).toBe('');
		expect(launcherState.agentSessions.size).toBe(0);
	});
});
