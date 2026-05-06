import { join } from 'node:path';
import {
	AGENTS,
	type WorkspaceAppCliChatAgent,
	type WorkspaceAppClipboardAgent
} from '../agents.js';
import type { LaunchStrategy } from '../launch.js';
import { shellQuote, type PlatformContext } from '../platform.js';
import { checkDispatchWarning, probeMacApps, probeMcpConfig } from './shared.js';

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

export function buildVsCodeChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', prompt];
}

export function buildWindsurfChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', '--maximize', prompt];
}

export const workspaceAppCliChat: LaunchStrategy<WorkspaceAppCliChatAgent> = {
	probe(agent, workspace, ctx) {
		if (agent.cliCommand && ctx.commandExists(agent.cliCommand)) return true;
		if (agent.bundledCli === 'vscode' && resolveVsCodeCli(ctx) !== null) return true;
		if (agent.bundledCli === 'windsurf' && resolveWindsurfCli(ctx) !== null) return true;
		if (probeMacApps(agent, ctx)) return true;
		return probeMcpConfig(agent, workspace, ctx);
	},
	launch(agent, prompt, options, ctx) {
		if (agent.dispatchWarning) {
			checkDispatchWarning(agent.dispatchWarning, options.workspace, ctx);
		}

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

export const workspaceAppClipboard: LaunchStrategy<WorkspaceAppClipboardAgent> = {
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
