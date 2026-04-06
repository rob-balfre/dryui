import type { CliId } from './cli-definitions.ts';
import type { SessionData } from './session-types.ts';
import { SvelteMap } from 'svelte/reactivity';

export type ValidationStatus = 'idle' | 'checking' | 'found' | 'not-found' | 'needs-auth' | 'error';

export interface CliValidation {
	status: ValidationStatus;
	version?: string;
	path?: string;
	error?: string;
}

export interface CliVersionInfo {
	installed?: string;
	latest?: string;
	updateAvailable?: boolean;
}

const INITIAL_VALIDATION: CliValidation = { status: 'idle' };
const ABSOLUTE_PATH_RE = /^(\/|[A-Za-z]:[\\/])/;

function isAbsoluteProjectPath(path: string | null | undefined): path is string {
	return typeof path === 'string' && ABSOLUTE_PATH_RE.test(path);
}

let selectedCli = $state<CliId | null>(null);
let wsConnected = $state(false);
let validations = $state<Record<CliId, CliValidation>>({
	'claude-code': { ...INITIAL_VALIDATION },
	codex: { ...INITIAL_VALIDATION },
	'gemini-cli': { ...INITIAL_VALIDATION },
	'copilot-cli': { ...INITIAL_VALIDATION },
	opencode: { ...INITIAL_VALIDATION },
	cursor: { ...INITIAL_VALIDATION }
});
let versionInfo = $state<Record<CliId, CliVersionInfo>>({
	'claude-code': {},
	codex: {},
	'gemini-cli': {},
	'copilot-cli': {},
	opencode: {},
	cursor: {}
});
let ptyOutput = $state('');
let ptyExited = $state(false);
let ptyError = $state<string | null>(null);
let devServerOutput = $state('');
let devServerRunning = $state(false);
let devServerUrl = $state<string | null>(null);
let devServerError = $state<string | null>(null);

export interface AgentSessionState {
	output: string;
	exited: boolean;
	exitCode: number | null;
	error: string | null;
	prompt: string;
	startedAt: number;
}

let agentSessions = new SvelteMap<string, AgentSessionState>();

let projectPath = $state<string | null>(null);

export type ProjectAnalysisStatus = 'idle' | 'analyzing' | 'greenfield' | 'installed' | 'error';

export interface ProjectAnalysis {
	status: ProjectAnalysisStatus;
	framework?: string;
	packageManager?: string;
	installedVersion?: string;
	latestVersion?: string;
	updateAvailable?: boolean;
	error?: string;
}

let projectAnalysis = $state<ProjectAnalysis>({ status: 'idle' });

export type SetupStatus = 'idle' | 'running' | 'complete' | 'failed';

export interface SetupStepState {
	status: 'pending' | 'running' | 'done' | 'failed';
	output?: string;
}

let setupStatus = $state<SetupStatus>('idle');
let setupSteps = $state<Record<string, SetupStepState>>({});
let setupError = $state<{ step: string; error: string } | null>(null);
let cliValidated = $state<Record<string, boolean>>({});
let currentStep = $state<string>('cli-selection');
let themeRecipe = $state<string | null>(null);

function resetTransientWorkspaceState() {
	ptyOutput = '';
	ptyExited = false;
	ptyError = null;
	devServerOutput = '';
	devServerRunning = false;
	devServerUrl = null;
	devServerError = null;
	projectAnalysis = { status: 'idle' };
	setupStatus = 'idle';
	setupSteps = {};
	setupError = null;
	agentSessions.clear();
}

function shouldResetTransientWorkspaceState(
	nextSelectedCli: CliId | null,
	nextProjectPath: string | null
): boolean {
	return nextSelectedCli !== selectedCli || nextProjectPath !== projectPath;
}

export const launcherState = {
	get selectedCli() {
		return selectedCli;
	},
	get wsConnected() {
		return wsConnected;
	},
	get validations() {
		return validations;
	},
	get ptyOutput() {
		return ptyOutput;
	},
	get ptyExited() {
		return ptyExited;
	},
	get ptyError() {
		return ptyError;
	},
	get devServerOutput() {
		return devServerOutput;
	},
	get devServerRunning() {
		return devServerRunning;
	},
	get devServerUrl() {
		return devServerUrl;
	},
	get devServerError() {
		return devServerError;
	},
	get versionInfo() {
		return versionInfo;
	},
	get projectPath() {
		return projectPath;
	},
	get projectAnalysis() {
		return projectAnalysis;
	},
	get setupStatus() {
		return setupStatus;
	},
	get setupSteps() {
		return setupSteps;
	},
	get setupError() {
		return setupError;
	},
	get cliValidated() {
		return cliValidated;
	},
	get currentStep() {
		return currentStep;
	},
	get agentSessions() {
		return agentSessions;
	},
	get themeRecipe() {
		return themeRecipe;
	},

	setProjectPath(path: string | null) {
		if (shouldResetTransientWorkspaceState(selectedCli, path)) {
			resetTransientWorkspaceState();
		}
		projectPath = path;
	},

	setProjectAnalysis(analysis: ProjectAnalysis) {
		projectAnalysis = { ...analysis };
	},

	resetProjectAnalysis() {
		projectAnalysis = { status: 'idle' };
	},

	setSetupStatus(status: SetupStatus) {
		setupStatus = status;
	},

	updateSetupStep(step: string, state: SetupStepState) {
		setupSteps = { ...setupSteps, [step]: { ...state } };
	},

	setSetupError(error: { step: string; error: string } | null) {
		setupError = error ? { ...error } : null;
	},

	resetSetup() {
		setupStatus = 'idle';
		setupSteps = {};
		setupError = null;
	},

	setCliValidated(cli: string, validated: boolean) {
		cliValidated = { ...cliValidated, [cli]: validated };
	},

	setCurrentStep(step: string) {
		currentStep = step;
	},

	setThemeRecipe(recipe: string | null) {
		themeRecipe = recipe;
	},

	clearSession() {
		selectedCli = null;
		projectPath = null;
		currentStep = 'cli-selection';
		resetTransientWorkspaceState();
	},

	hydrate(data: SessionData) {
		const session = data.session;
		const persistedProjectPath = session?.project_path ?? null;
		const savedProjectPath = isAbsoluteProjectPath(persistedProjectPath)
			? persistedProjectPath
			: null;
		const hasInvalidPersistedPath =
			typeof persistedProjectPath === 'string' &&
			persistedProjectPath.length > 0 &&
			savedProjectPath === null;
		const savedStep = session?.current_step ?? 'cli-selection';
		const nextSelectedCli = session?.selected_cli ?? null;
		const nextStep =
			savedProjectPath === null &&
			(savedStep === 'setup' || savedStep === 'theme' || savedStep === 'workspace')
				? 'project'
				: savedStep;

		if (
			session === null ||
			hasInvalidPersistedPath ||
			shouldResetTransientWorkspaceState(nextSelectedCli, savedProjectPath)
		) {
			resetTransientWorkspaceState();
		}

		selectedCli = nextSelectedCli;
		projectPath = savedProjectPath;
		currentStep = nextStep;

		const nextValidated = { ...cliValidated };

		for (const row of data.cliValidations) {
			if (row.status !== 'found') continue;

			validations[row.cli_id] = {
				status: 'found',
				...(row.version ? { version: row.version } : {}),
				...(row.path ? { path: row.path } : {})
			};
			nextValidated[row.cli_id] = true;
		}

		cliValidated = nextValidated;
	},

	select(cli: CliId) {
		if (shouldResetTransientWorkspaceState(cli, projectPath)) {
			resetTransientWorkspaceState();
		}
		selectedCli = cli;
	},

	setWsConnected(connected: boolean) {
		wsConnected = connected;
	},

	setValidating(cli: CliId) {
		validations[cli] = { status: 'checking' };
	},

	get canContinue() {
		return selectedCli !== null && validations[selectedCli].status === 'found';
	},

	setValidationResult(
		cli: CliId,
		result: {
			status: 'found' | 'not-found' | 'error';
			version?: string;
			path?: string;
			error?: string;
		}
	) {
		validations[cli] = { ...result };
	},

	setVersionInfo(cli: CliId, info: CliVersionInfo) {
		versionInfo[cli] = { ...info };
	},

	appendPtyOutput(data: string) {
		ptyOutput += (ptyOutput && !ptyOutput.endsWith('\n') ? '\n' : '') + data;
	},

	setPtyExited(exited: boolean) {
		ptyExited = exited;
	},

	setPtyError(error: string | null) {
		ptyError = error;
	},

	resetPty() {
		ptyOutput = '';
		ptyExited = false;
		ptyError = null;
	},

	appendDevServerOutput(data: string) {
		devServerOutput += (devServerOutput && !devServerOutput.endsWith('\n') ? '\n' : '') + data;
	},

	setDevServerRunning(running: boolean) {
		devServerRunning = running;
	},

	setDevServerUrl(url: string | null) {
		devServerUrl = url;
	},

	setDevServerError(error: string | null) {
		devServerError = error;
	},

	resetDevServer() {
		devServerOutput = '';
		devServerRunning = false;
		devServerUrl = null;
		devServerError = null;
	},

	initAgentSession(sessionId: string, prompt: string, startedAt: number) {
		agentSessions.set(sessionId, {
			output: '',
			exited: false,
			exitCode: null,
			error: null,
			prompt,
			startedAt
		});
	},

	appendAgentOutput(sessionId: string, data: string) {
		const session = agentSessions.get(sessionId);
		if (!session) return;
		agentSessions.set(sessionId, {
			...session,
			output: session.output + (session.output && !session.output.endsWith('\n') ? '\n' : '') + data
		});
	},

	setAgentExited(sessionId: string, code: number | null) {
		const session = agentSessions.get(sessionId);
		if (!session) return;
		agentSessions.set(sessionId, { ...session, exited: true, exitCode: code });
	},

	setAgentError(sessionId: string, error: string) {
		const session = agentSessions.get(sessionId);
		if (!session) return;
		agentSessions.set(sessionId, { ...session, error });
	},

	removeAgentSession(sessionId: string) {
		agentSessions.delete(sessionId);
	},

	clearAgentSessions() {
		agentSessions.clear();
	}
};
