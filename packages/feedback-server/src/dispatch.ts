// Dispatch — public surface.
//
// The agent table lives in `./dispatch/agents.ts` (data only); the four
// launch strategies live in `./dispatch/strategies.ts` (functions). This
// module is the runner: it owns the public API consumed by `http.ts` and
// `server.ts`, plus the snapshot/probe used by the dashboard.
//
// The `build*`, `resolve*With`, and `resolveFeedbackSkillPath*` exports below
// are kept on dispatch.ts so the existing tests keep importing from one
// place. New tests should pull from the focused submodules directly.

import { homedir, platform } from 'node:os';
import {
	AGENTS,
	DISPATCH_AGENTS,
	TERMINAL_APPS,
	type DefaultDispatchAgent,
	type DispatchAgent,
	type DispatchSkillPaths,
	type TerminalApp
} from './dispatch/agents.js';
import { defaultPlatformContext, type PlatformContext } from './dispatch/platform.js';
import {
	missingSkillHint,
	resolveFeedbackSkillPath,
	resolveFeedbackSkillPaths
} from './dispatch/skills.js';
import { launchAgent, probeAgent } from './dispatch/strategies.js';
import type { EventBus } from './events.js';
import { buildFeedbackDispatchPrompt } from './prompts.js';
import type { Submission, SubmissionAgent } from './types.js';

// ---------------------------------------------------------------------------
// Public types & constants
// ---------------------------------------------------------------------------

export type {
	DispatchAgent,
	DefaultDispatchAgent,
	DispatchSkillPaths,
	TerminalApp
} from './dispatch/agents.js';
export { DISPATCH_AGENTS, TERMINAL_APPS } from './dispatch/agents.js';

export interface DispatcherOptions {
	workspace: string;
	defaultAgent: DefaultDispatchAgent;
	terminalApp?: TerminalApp;
	homeDir?: string;
}

interface DispatchTargetsSnapshot {
	defaultAgent: DefaultDispatchAgent;
	configuredAgents: DispatchAgent[];
	skillPaths: DispatchSkillPaths;
	/** Legacy single-path field for older dashboards. */
	skillPath: string | null;
}

// ---------------------------------------------------------------------------
// Test seams — re-exported so the existing test suite keeps importing from
// `dispatch.ts`. New code should import from the submodules directly.
// ---------------------------------------------------------------------------

export {
	resolveFeedbackSkillPath,
	resolveFeedbackSkillPaths,
	resolveLocalPluginDir
} from './dispatch/skills.js';
export {
	buildVsCodeChatArgs,
	buildWindsurfChatArgs,
	buildWorkspaceAppLaunch,
	resolveVsCodeCliWith,
	resolveWindsurfCliWith
} from './dispatch/strategies.js';
export type {
	WorkspaceAppLaunchStrategy,
	WorkspaceAppLaunchPlan,
	WorkspaceAppLaunchContext
} from './dispatch/strategies.js';

// ---------------------------------------------------------------------------
// Public surface
// ---------------------------------------------------------------------------

export function isDispatchPlatformSupported(): boolean {
	const currentPlatform = platform();
	return currentPlatform === 'darwin' || currentPlatform === 'win32';
}

/** What the dashboard sees: which agents are configured + skill paths. */
export function getDispatchTargetsSnapshot(options: DispatcherOptions): DispatchTargetsSnapshot {
	const ctx = defaultPlatformContext(options.homeDir ?? homedir());
	const configuredAgents = DISPATCH_AGENTS.filter((agent) =>
		probeAgent(agent, options.workspace, ctx)
	);
	const skillPaths = resolveFeedbackSkillPaths(
		options.workspace,
		configuredAgents,
		options.homeDir
	);
	const skillPath =
		options.defaultAgent !== 'off'
			? (skillPaths[options.defaultAgent] ?? null)
			: (skillPaths.codex ?? skillPaths.claude ?? null);
	return {
		defaultAgent: options.defaultAgent,
		configuredAgents,
		skillPaths,
		skillPath
	};
}

/** Dispatch a prompt to one agent. Used by the HTTP `/dispatch` endpoint. */
export function dispatchPrompt(
	target: DispatchAgent,
	prompt: string,
	options: Pick<DispatcherOptions, 'workspace' | 'terminalApp' | 'homeDir'>
): void {
	const ctx = defaultPlatformContext(options.homeDir ?? homedir());
	launchAgent(
		target,
		prompt,
		{
			workspace: options.workspace,
			...(options.terminalApp ? { terminalApp: options.terminalApp } : {})
		},
		ctx
	);
}

// ---------------------------------------------------------------------------
// Bus subscription
// ---------------------------------------------------------------------------

function resolveAgent(submission: Submission, defaultAgent: DefaultDispatchAgent): SubmissionAgent {
	const choice = submission.agent;
	if (choice === 'off' || (choice && DISPATCH_AGENTS.includes(choice as DispatchAgent))) {
		return choice;
	}
	return defaultAgent;
}

function dispatchSubmission(
	submission: Submission,
	options: DispatcherOptions,
	ctx: PlatformContext
): void {
	const target = resolveAgent(submission, options.defaultAgent);
	if (target === 'off') {
		console.error(`[dispatch] skip (off) ${submission.id}`);
		return;
	}

	const dispatchWorkspace = submission.workspace ?? options.workspace;
	const skillPath = resolveFeedbackSkillPath(
		dispatchWorkspace,
		target as DispatchAgent,
		options.homeDir
	);
	if (!skillPath) {
		console.error(
			`[dispatch] submission ${submission.id} aborted: ${missingSkillHint(target as DispatchAgent)}`
		);
		return;
	}
	const prompt = buildFeedbackDispatchPrompt(submission, { skillPath });
	console.error(`[dispatch] submission ${submission.id}`);
	launchAgent(
		target as DispatchAgent,
		prompt,
		{
			workspace: dispatchWorkspace,
			...(options.terminalApp ? { terminalApp: options.terminalApp } : {})
		},
		ctx
	);
}

export function attachDispatcher(bus: EventBus, options: DispatcherOptions): () => void {
	const currentPlatform = platform();
	if (currentPlatform !== 'darwin' && currentPlatform !== 'win32') {
		console.error(`[dispatch] unsupported platform ${currentPlatform}; dispatch disabled`);
		return () => {};
	}
	const ctx = defaultPlatformContext(options.homeDir ?? homedir());
	const terminalLabel = currentPlatform === 'win32' ? 'wt' : (options.terminalApp ?? 'terminal');
	console.error(
		`[dispatch] enabled (default=${options.defaultAgent}, workspace=${options.workspace}, terminal=${terminalLabel})`
	);
	return bus.subscribe((event) => dispatchSubmission(event.payload as Submission, options, ctx), {
		agent: true,
		matches: (event) => event.type === 'submission.created'
	});
}

// Used internally by callers that want the catalogue map.
export { AGENTS };
