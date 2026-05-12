// Dispatch — public surface.
//
// The agent table lives in `./dispatch/agents.ts` (data only); the four
// launch strategies live in `./dispatch/strategies.ts` (functions). This
// module is the runner: it owns the public API consumed by `http.ts` and
// `server.ts`, plus the snapshot/probe used by the dashboard.
//
// Skill-path resolution (`resolveFeedbackSkillPath*`, `missingSkillHint`,
// `*_SKILL_MISSING_HINT`) lives directly on this module: it's per-agent
// dispatch knowledge — same shape as the warning hints and display labels
// already owned here. Tests and external consumers import from this file.

import { existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
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
import { launchAgent, probeAgent } from './dispatch/strategies.js';
import type { EventBus } from './events.js';
import { buildFeedbackDispatchPrompt } from './prompts.js';
import { ensureSubmissionPresentation } from './submission-presentation.js';
import type { SubmissionPresentation } from './submission-presentation.js';
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
// Skill-path resolution
// ---------------------------------------------------------------------------
//
// `dryui-feedback` is the canonical skill the dispatched agent reads first.
// Prefer the agent's installed global skill when needed, then fall back through
// the project-local skill copies created by dryui-init.

const PROJECT_SKILL_RELATIVES = [
	'.claude/skills/dryui-feedback/SKILL.md',
	'.agents/skills/dryui-feedback/SKILL.md',
	'.codex/skills/dryui-feedback/SKILL.md',
	'skills/dryui-feedback/SKILL.md'
] as const;
const CODEX_SKILL_RELATIVE = '.agents/skills/dryui-feedback/SKILL.md';

export const SKILL_MISSING_HINT =
	'dryui-feedback skill not installed in this project. ' +
	'Run `npx skills add rob-balfre/dryui --skill dryui-feedback`.';

export const CODEX_SKILL_MISSING_HINT =
	'dryui-feedback skill not installed for Codex. ' +
	'Run `npx skills add rob-balfre/dryui --agent codex`, or add a project-local dryui-feedback skill.';

function findProjectSkill(workspace: string): string | null {
	for (const relative of PROJECT_SKILL_RELATIVES) {
		const candidate = join(workspace, relative);
		if (existsSync(candidate)) return candidate;
	}
	return null;
}

function findCodexSkill(homeDir: string): string | null {
	const candidate = join(homeDir, CODEX_SKILL_RELATIVE);
	return existsSync(candidate) ? candidate : null;
}

export function resolveFeedbackSkillPath(
	workspace: string,
	target: DispatchAgent,
	homeDir = homedir()
): string | null {
	const projectSkill = findProjectSkill(workspace);
	if (target !== 'codex') return projectSkill;
	return findCodexSkill(homeDir) ?? projectSkill;
}

export function resolveFeedbackSkillPaths(
	workspace: string,
	agents: readonly DispatchAgent[],
	homeDir = homedir()
): DispatchSkillPaths {
	const projectSkill = findProjectSkill(workspace);
	const codexSkill = findCodexSkill(homeDir);
	const skillPaths: DispatchSkillPaths = {};

	for (const agent of agents) {
		const skillPath = agent === 'codex' ? (codexSkill ?? projectSkill) : projectSkill;
		if (skillPath) skillPaths[agent] = skillPath;
	}

	return skillPaths;
}

function missingSkillHint(target: DispatchAgent): string {
	return target === 'codex' ? CODEX_SKILL_MISSING_HINT : SKILL_MISSING_HINT;
}

// ---------------------------------------------------------------------------
// Test seams — re-exported so the existing test suite keeps importing from
// `dispatch.ts`. New code should import from the submodules directly.
// ---------------------------------------------------------------------------

export {
	buildVsCodeChatArgs,
	buildWindsurfChatArgs,
	buildWorkspaceAppLaunch,
	resolveLocalPluginDir,
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

function resolveAgent(
	submission: Pick<SubmissionPresentation, 'agent'>,
	defaultAgent: DefaultDispatchAgent
): SubmissionAgent {
	const choice = submission.agent;
	if (choice === 'off' || (choice && DISPATCH_AGENTS.includes(choice as DispatchAgent))) {
		return choice;
	}
	return defaultAgent;
}

function dispatchSubmission(
	submission: Submission | SubmissionPresentation,
	options: DispatcherOptions,
	ctx: PlatformContext
): void {
	const presentation = ensureSubmissionPresentation(submission);
	const target = resolveAgent(presentation, options.defaultAgent);
	if (target === 'off') {
		console.error(`[dispatch] skip (off) ${presentation.id}`);
		return;
	}

	const dispatchWorkspace = presentation.workspace ?? options.workspace;
	const skillPath = resolveFeedbackSkillPath(
		dispatchWorkspace,
		target as DispatchAgent,
		options.homeDir
	);
	if (!skillPath) {
		console.error(
			`[dispatch] submission ${presentation.id} aborted: ${missingSkillHint(target as DispatchAgent)}`
		);
		return;
	}
	const prompt = buildFeedbackDispatchPrompt(presentation, { skillPath });
	console.error(`[dispatch] submission ${presentation.id}`);
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
