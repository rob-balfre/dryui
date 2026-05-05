// Four launch strategies for dispatch.
//
//   terminal-cli            claude, gemini, opencode, copilot
//   deeplink                codex
//   workspace-app-cli-chat  copilot-vscode, windsurf
//   workspace-app-clipboard cursor, zed
//
// Each strategy exposes `probe(agent, workspace, ctx)` and
// `launch(agent, prompt, options, ctx)`. The agent rows in ./agents.ts hold
// the per-agent data; this file holds the per-strategy logic.
//
// Per-agent quirks that don't fit a strategy uniformly (codex prepends a
// plugin chip, claude resolves model/permission/effort from env, vscode and
// windsurf disagree on clipboard timing) are handled with explicit id checks
// inside the relevant strategy. That keeps the strategy honest about which
// agents share its shape and which deviate.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	AGENTS,
	resolveAgentPath,
	type AgentConfig,
	type DeeplinkAgent,
	type DispatchAgent,
	type DispatchConfigWarning,
	type LaunchStrategyId,
	type TerminalApp,
	type TerminalCliAgent,
	type WorkspaceAppCliChatAgent,
	type WorkspaceAppClipboardAgent
} from './agents.js';
import { osaQuote, shellQuote, type PlatformContext } from './platform.js';
import { resolveLocalPluginDir } from './skills.js';

export interface DispatchOptions {
	workspace: string;
	terminalApp?: TerminalApp;
}

export interface LaunchStrategy<A extends AgentConfig = AgentConfig> {
	probe(agent: A, workspace: string, ctx: PlatformContext): boolean;
	launch(agent: A, prompt: string, options: DispatchOptions, ctx: PlatformContext): void;
}

// ---------------------------------------------------------------------------
// Shared probe helpers
// ---------------------------------------------------------------------------

function probeMcpConfig(agent: AgentConfig, workspace: string, ctx: PlatformContext): boolean {
	for (const probe of agent.mcpConfigProbes ?? []) {
		const path = resolveAgentPath(probe.pathTemplate, workspace, ctx.homeDir);
		if (ctx.hasJsonEntry(path, probe.rootKey, probe.entryKey)) return true;
	}
	return false;
}

function probeMacApps(agent: AgentConfig, ctx: PlatformContext): boolean {
	for (const name of agent.macApps ?? []) {
		if (ctx.macAppExists(name)) return true;
	}
	return false;
}

// ---------------------------------------------------------------------------
// Bundled CLI resolution (vscode + windsurf)
// ---------------------------------------------------------------------------
//
// Both editors ship a `code`/`windsurf` binary inside their .app bundle that
// the OS doesn't always expose on PATH. We probe a small list of candidates
// and pick the first that supports `chat --help`. The `…With(context)`
// variants are exported so the dispatch tests can drive the search with a
// stub platform.

export interface VsCodeCliTarget {
	command: string;
	urlScheme: 'vscode' | 'vscode-insiders';
}

interface CliResolverContext {
	currentPlatform: NodeJS.Platform;
	homeDir: string;
	resolveCommand(command: string): string | null;
	pathExists(path: string): boolean;
	supportsChat(command: string): boolean;
}

function firstSupportedCli<T extends { command: string }>(
	candidates: readonly T[],
	context: Pick<CliResolverContext, 'pathExists' | 'supportsChat'>
): T | null {
	for (const candidate of candidates) {
		if (!context.pathExists(candidate.command)) continue;
		if (context.supportsChat(candidate.command)) return candidate;
	}
	return null;
}

export function resolveVsCodeCliWith(context: CliResolverContext): VsCodeCliTarget | null {
	const candidates: VsCodeCliTarget[] = [];
	const seen = new Set<string>();
	const add = (command: string | null, urlScheme: 'vscode' | 'vscode-insiders') => {
		if (!command || seen.has(command)) return;
		seen.add(command);
		candidates.push({ command, urlScheme });
	};

	if (context.currentPlatform === 'darwin') {
		add('/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code', 'vscode');
		add(
			join(
				context.homeDir,
				'Applications',
				'Visual Studio Code.app/Contents/Resources/app/bin/code'
			),
			'vscode'
		);
		add(
			'/Applications/Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code-insiders',
			'vscode-insiders'
		);
		add(
			join(
				context.homeDir,
				'Applications',
				'Visual Studio Code - Insiders.app/Contents/Resources/app/bin/code-insiders'
			),
			'vscode-insiders'
		);
	}

	add(context.resolveCommand('code'), 'vscode');
	add(context.resolveCommand('code-insiders'), 'vscode-insiders');

	return firstSupportedCli(candidates, context);
}

export function resolveWindsurfCliWith(context: CliResolverContext): string | null {
	const candidates: { command: string }[] = [];
	const seen = new Set<string>();
	const add = (command: string | null) => {
		if (!command || seen.has(command)) return;
		seen.add(command);
		candidates.push({ command });
	};

	if (context.currentPlatform === 'darwin') {
		add('/Applications/Windsurf.app/Contents/Resources/app/bin/windsurf');
		add(join(context.homeDir, 'Applications', 'Windsurf.app/Contents/Resources/app/bin/windsurf'));
	}

	add(context.resolveCommand('windsurf'));

	return firstSupportedCli(candidates, context)?.command ?? null;
}

let vscodeCliCache: VsCodeCliTarget | null | undefined;
let windsurfCliCache: string | null | undefined;

function resolveVsCodeCli(ctx: PlatformContext): VsCodeCliTarget | null {
	if (vscodeCliCache !== undefined) return vscodeCliCache;
	vscodeCliCache = resolveVsCodeCliWith({
		currentPlatform: ctx.currentPlatform,
		homeDir: ctx.homeDir,
		resolveCommand: ctx.resolveCommand,
		pathExists: ctx.pathExists,
		supportsChat: ctx.supportsChat
	});
	return vscodeCliCache;
}

function resolveWindsurfCli(ctx: PlatformContext): string | null {
	if (windsurfCliCache !== undefined) return windsurfCliCache;
	windsurfCliCache = resolveWindsurfCliWith({
		currentPlatform: ctx.currentPlatform,
		homeDir: ctx.homeDir,
		resolveCommand: ctx.resolveCommand,
		pathExists: ctx.pathExists,
		supportsChat: ctx.supportsChat
	});
	return windsurfCliCache;
}

function resolveVsCodeUrlScheme(ctx: PlatformContext): 'vscode' | 'vscode-insiders' {
	const cli = resolveVsCodeCli(ctx);
	if (cli) return cli.urlScheme;
	if (
		!ctx.macAppExists('Visual Studio Code') &&
		ctx.macAppExists('Visual Studio Code - Insiders')
	) {
		return 'vscode-insiders';
	}
	return 'vscode';
}

// ---------------------------------------------------------------------------
// Workspace app launch (cursor, zed; also windsurf's fallback)
// ---------------------------------------------------------------------------

export type WorkspaceAppLaunchStrategy = 'cli' | 'mac-open' | 'windows-start';

export interface WorkspaceAppLaunchPlan {
	command: string;
	args: readonly string[];
	strategy: WorkspaceAppLaunchStrategy;
}

export interface WorkspaceAppLaunchContext {
	currentPlatform: NodeJS.Platform;
	commandExists(command: string): boolean;
	macAppExists(name: string): boolean;
}

/**
 * Plan how to open `target` (a workspace-app agent id) on `workspace`.
 * Exported as a test seam; real callers use `launchWorkspaceApp` below.
 */
export function buildWorkspaceAppLaunch(
	target: 'cursor' | 'windsurf' | 'zed',
	workspace: string,
	context: WorkspaceAppLaunchContext
): WorkspaceAppLaunchPlan | null {
	const agent = AGENTS[target];
	const command = agent.cliCommand;
	const macAppName = agent.macApps?.[0];
	if (!command) return null;

	if (context.commandExists(command)) {
		return { command, args: [workspace], strategy: 'cli' };
	}

	if (context.currentPlatform === 'win32') {
		return {
			command: 'cmd.exe',
			args: ['/c', 'start', '', command, workspace],
			strategy: 'windows-start'
		};
	}

	if (context.currentPlatform === 'darwin' && macAppName && context.macAppExists(macAppName)) {
		return {
			command: 'sh',
			// sh -c is intentional: spawn('open', [...]) drops the prompt when fired from
			// the long-lived server process, while sh -c 'open ...' works. Root cause unclear.
			args: ['-c', `open -a ${shellQuote(macAppName)} ${shellQuote(workspace)}`],
			strategy: 'mac-open'
		};
	}

	return null;
}

function launchWorkspaceApp(
	target: 'cursor' | 'windsurf' | 'zed',
	workspace: string,
	ctx: PlatformContext
): void {
	const plan = buildWorkspaceAppLaunch(target, workspace, {
		currentPlatform: ctx.currentPlatform,
		commandExists: ctx.commandExists,
		macAppExists: ctx.macAppExists
	});
	if (!plan) {
		const agent = AGENTS[target];
		console.error(
			`[dispatch] unable to launch ${target}: ${agent.cliCommand} is not on PATH and ${agent.macApps?.[0]}.app was not found`
		);
		return;
	}
	console.error(`[dispatch] launching ${target} via ${plan.strategy}`);
	ctx.spawnDetached(plan.command, plan.args);
}

// ---------------------------------------------------------------------------
// Dispatch warnings (copilot CLI + copilot vscode)
// ---------------------------------------------------------------------------

const dispatchConfigWarnings = new Set<string>();

function warnOnce(key: string, message: string): void {
	if (dispatchConfigWarnings.has(key)) return;
	dispatchConfigWarnings.add(key);
	console.error(message);
}

function checkDispatchWarning(
	warning: DispatchConfigWarning,
	workspace: string,
	homeDir: string
): void {
	const path = resolveAgentPath(warning.pathTemplate, workspace, homeDir);
	let raw: string;
	try {
		raw = readFileSync(path, 'utf8');
	} catch (err: unknown) {
		const code = (err as NodeJS.ErrnoException | null)?.code;
		if (code === 'ENOENT') {
			warnOnce(
				`missing:${path}`,
				[
					`[dispatch] warning: ${path} not found.`,
					`[dispatch] ${warning.readerLabel} reads MCP servers from this file. Without it, the dispatched prompt`,
					`[dispatch] will run but the \`dryui-feedback\` MCP tools will not be available.`,
					`[dispatch] To enable them, create the file with:`,
					...warning.snippet.split('\n').map((line) => `[dispatch]   ${line}`),
					`[dispatch] Proceeding with launch anyway.`
				].join('\n')
			);
			return;
		}
		warnOnce(
			`read:${path}:${code ?? 'unknown'}`,
			`[dispatch] warning: could not read ${path} (${code ?? 'unknown error'}). Proceeding with launch anyway.`
		);
		return;
	}
	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : String(err);
		warnOnce(
			`parse:${path}`,
			`[dispatch] warning: ${path} is not valid JSON (${msg}). Proceeding with launch anyway.`
		);
		return;
	}
	const servers = (
		parsed as { mcpServers?: Record<string, unknown>; servers?: Record<string, unknown> } | null
	)?.[warning.rootKey as 'mcpServers' | 'servers'];
	if (!servers || typeof servers !== 'object' || !(warning.entryKey in servers)) {
		warnOnce(
			`missing-entry:${path}`,
			[
				`[dispatch] warning: ${path} has no \`${warning.entryKey}\` entry under \`${warning.rootKey}\`.`,
				`[dispatch] Add this block so ${warning.readerLabel} can reach the feedback MCP:`,
				...warning.snippet.split('\n').map((line) => `[dispatch]   ${line}`),
				`[dispatch] Proceeding with launch anyway.`
			].join('\n')
		);
	}
}

// ---------------------------------------------------------------------------
// Strategy: terminal-cli  (claude, gemini, opencode, copilot)
// ---------------------------------------------------------------------------

// Default the dispatched claude session to Opus + auto permission mode + auto
// effort. Auto permission mode is gated by model+plan: on Max plans only Opus
// 4.7 carries it. Power users on Team/Enterprise/API plans who want
// Sonnet+auto can set `DRYUI_FEEDBACK_MODEL=sonnet`.
const DEFAULT_CLAUDE_MODEL = 'opus';
const DEFAULT_CLAUDE_PERMISSION_MODE = 'auto';
const DEFAULT_CLAUDE_EFFORT = 'auto';
const VALID_CLAUDE_EFFORT_VALUES = new Set(['low', 'medium', 'high', 'xhigh', 'max', 'auto']);

function resolveClaudeModel(): string {
	const override = process.env['DRYUI_FEEDBACK_MODEL']?.trim();
	return override && override.length > 0 ? override : DEFAULT_CLAUDE_MODEL;
}

function resolveClaudePermissionMode(): string {
	const override = process.env['DRYUI_FEEDBACK_PERMISSION_MODE']?.trim();
	return override && override.length > 0 ? override : DEFAULT_CLAUDE_PERMISSION_MODE;
}

function resolveClaudeEffort(): string {
	const override = process.env['DRYUI_FEEDBACK_EFFORT']?.trim();
	if (!override) return DEFAULT_CLAUDE_EFFORT;
	if (!VALID_CLAUDE_EFFORT_VALUES.has(override)) {
		console.error(
			`[dispatch] DRYUI_FEEDBACK_EFFORT=${override} is not a valid level (${[...VALID_CLAUDE_EFFORT_VALUES].join(', ')}); falling back to ${DEFAULT_CLAUDE_EFFORT}.`
		);
		return DEFAULT_CLAUDE_EFFORT;
	}
	return override;
}

let claudeCliArgsCache: readonly string[] | null = null;
let claudeCliEnvPrefixCache: string | null = null;

function getTerminalCliArgs(agent: TerminalCliAgent): readonly string[] {
	if (agent.id !== 'claude') return agent.cliArgs;
	if (claudeCliArgsCache) return claudeCliArgsCache;
	const model = resolveClaudeModel();
	const permissionMode = resolveClaudePermissionMode();
	const effort = resolveClaudeEffort();
	const localPlugin = resolveLocalPluginDir();
	const args: string[] = [...agent.cliArgs, '--model', model, '--permission-mode', permissionMode];
	// `--effort auto` is rejected by the CLI; the env prefix carries `auto`.
	if (effort !== 'auto') args.push('--effort', effort);
	if (localPlugin) {
		console.error(`[dispatch] using local plugin: ${localPlugin}`);
		args.push('--plugin-dir', localPlugin);
	}
	console.error(
		`[dispatch] claude model: ${model}, permission-mode: ${permissionMode}, effort: ${effort}`
	);
	claudeCliArgsCache = args;
	return claudeCliArgsCache;
}

function getTerminalCliEnvPrefix(agent: TerminalCliAgent): string {
	if (agent.id !== 'claude') return '';
	if (claudeCliEnvPrefixCache !== null) return claudeCliEnvPrefixCache;
	const effort = resolveClaudeEffort();
	const exports: Array<[string, string]> = [];
	if (effort === 'auto') exports.push(['CLAUDE_CODE_EFFORT_LEVEL', effort]);
	claudeCliEnvPrefixCache =
		exports.length === 0
			? ''
			: exports.map(([key, value]) => `${key}=${shellQuote(value)}`).join(' ') + ' ';
	return claudeCliEnvPrefixCache;
}

function buildOsaArgs(terminalApp: TerminalApp, cliCommand: string, workspace: string): string[] {
	if (terminalApp === 'ghostty') {
		return [
			'-e',
			'tell application "Ghostty"',
			'-e',
			'set cfg to new surface configuration',
			'-e',
			`set initial working directory of cfg to "${osaQuote(workspace)}"`,
			'-e',
			`set command of cfg to "${osaQuote(cliCommand)}"`,
			'-e',
			'new window with configuration cfg',
			'-e',
			'end tell'
		];
	}
	const wrapped = `cd ${shellQuote(workspace)} && ${cliCommand}`;
	return ['-e', `tell application "Terminal" to do script "${osaQuote(wrapped)}"`];
}

function buildTerminalCliInvocation(
	agent: TerminalCliAgent,
	prompt: string,
	workspace: string
): string {
	if (agent.id === 'opencode') {
		return `${shellQuote('opencode')} ${shellQuote(workspace)} --prompt ${shellQuote(prompt)}`;
	}
	const cliArgs = getTerminalCliArgs(agent)
		.map((entry) => shellQuote(entry))
		.join(' ');
	const envPrefix = getTerminalCliEnvPrefix(agent);
	return `${envPrefix}${cliArgs} ${shellQuote(prompt)}`;
}

const terminalCli: LaunchStrategy<TerminalCliAgent> = {
	probe(agent, workspace, ctx) {
		if (ctx.commandExists(agent.cliCommand)) return true;
		return probeMcpConfig(agent, workspace, ctx);
	},
	launch(agent, prompt, options, ctx) {
		if (agent.dispatchWarning) {
			checkDispatchWarning(agent.dispatchWarning, options.workspace, ctx.homeDir);
		}

		if (ctx.currentPlatform === 'win32') {
			const wtArgs =
				agent.id === 'opencode'
					? ['-d', options.workspace, '--', 'opencode', options.workspace, '--prompt', prompt]
					: ['-d', options.workspace, '--', ...getTerminalCliArgs(agent), prompt];
			ctx.spawnDetached('wt.exe', wtArgs);
			return;
		}

		const cliCommand = buildTerminalCliInvocation(agent, prompt, options.workspace);
		const args = buildOsaArgs(options.terminalApp ?? 'terminal', cliCommand, options.workspace);
		ctx.spawnDetached('osascript', args);
	}
};

// ---------------------------------------------------------------------------
// Strategy: deeplink  (codex)
// ---------------------------------------------------------------------------

const deeplink: LaunchStrategy<DeeplinkAgent> = {
	probe(agent, _workspace, ctx) {
		return ctx.commandExists(agent.cliCommand) || probeMacApps(agent, ctx);
	},
	launch(agent, prompt, options, ctx) {
		const fullPrompt = (agent.promptPrefix ?? '') + prompt;
		const url = agent.urlTemplate
			.replace('{prompt}', encodeURIComponent(fullPrompt))
			.replace('{workspace}', encodeURIComponent(options.workspace));
		ctx.openExternalUrl(url);
	}
};

// ---------------------------------------------------------------------------
// Strategy: workspace-app-cli-chat  (copilot-vscode, windsurf)
// ---------------------------------------------------------------------------

export function buildVsCodeChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', prompt];
}

export function buildWindsurfChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', '--maximize', prompt];
}

const workspaceAppCliChat: LaunchStrategy<WorkspaceAppCliChatAgent> = {
	probe(agent, workspace, ctx) {
		if (agent.cliCommand && ctx.commandExists(agent.cliCommand)) return true;
		if (agent.bundledCli === 'vscode' && resolveVsCodeCli(ctx) !== null) return true;
		if (agent.bundledCli === 'windsurf' && resolveWindsurfCli(ctx) !== null) return true;
		if (probeMacApps(agent, ctx)) return true;
		return probeMcpConfig(agent, workspace, ctx);
	},
	launch(agent, prompt, options, ctx) {
		if (agent.dispatchWarning) {
			checkDispatchWarning(agent.dispatchWarning, options.workspace, ctx.homeDir);
		}

		// copilot-vscode: try CLI chat first, no clipboard on success.
		if (agent.id === 'copilot-vscode') {
			const cli = resolveVsCodeCli(ctx);
			if (cli) {
				console.error(`[dispatch] launching ${cli.command} chat for ${agent.id}`);
				ctx.spawnDetached(cli.command, buildVsCodeChatArgs(prompt), options.workspace);
				return;
			}
			ctx.copyPromptToClipboard(prompt);
			console.error(`[dispatch] copied prompt to clipboard for ${agent.id} (deeplink fallback)`);
			ctx.openExternalUrl(`${resolveVsCodeUrlScheme(ctx)}://GitHub.Copilot-Chat/chat?mode=agent`);
			return;
		}

		// windsurf: clipboard always (CLI chat too, in case the user wants it).
		ctx.copyPromptToClipboard(prompt);
		console.error(`[dispatch] copied prompt to clipboard for ${agent.id}`);
		const cli = resolveWindsurfCli(ctx);
		if (cli) {
			console.error(`[dispatch] launching ${cli} chat for ${agent.id}`);
			ctx.spawnDetached(cli, buildWindsurfChatArgs(prompt), options.workspace);
			return;
		}
		launchWorkspaceApp('windsurf', options.workspace, ctx);
	}
};

// ---------------------------------------------------------------------------
// Strategy: workspace-app-clipboard  (cursor, zed)
// ---------------------------------------------------------------------------

const workspaceAppClipboard: LaunchStrategy<WorkspaceAppClipboardAgent> = {
	probe(agent, workspace, ctx) {
		if (ctx.commandExists(agent.cliCommand)) return true;
		if (probeMacApps(agent, ctx)) return true;
		return probeMcpConfig(agent, workspace, ctx);
	},
	launch(agent, prompt, options, ctx) {
		ctx.copyPromptToClipboard(prompt);
		console.error(`[dispatch] copied prompt to clipboard for ${agent.id}`);
		launchWorkspaceApp(agent.id as 'cursor' | 'zed', options.workspace, ctx);
	}
};

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

export const STRATEGIES: Record<LaunchStrategyId, LaunchStrategy> = {
	'terminal-cli': terminalCli as LaunchStrategy,
	deeplink: deeplink as LaunchStrategy,
	'workspace-app-cli-chat': workspaceAppCliChat as LaunchStrategy,
	'workspace-app-clipboard': workspaceAppClipboard as LaunchStrategy
};

export function probeAgent(
	agentId: DispatchAgent,
	workspace: string,
	ctx: PlatformContext
): boolean {
	const agent = AGENTS[agentId];
	const strategy = STRATEGIES[agent.strategy];
	return strategy.probe(agent, workspace, ctx);
}

export function launchAgent(
	agentId: DispatchAgent,
	prompt: string,
	options: DispatchOptions,
	ctx: PlatformContext
): void {
	const agent = AGENTS[agentId];
	const strategy = STRATEGIES[agent.strategy];
	console.error(`[dispatch] → ${agentId}`);
	strategy.launch(agent, prompt, options, ctx);
}
