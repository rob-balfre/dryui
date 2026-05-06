import {
	AGENTS,
	type AgentConfig,
	type DispatchAgent,
	type LaunchStrategyId,
	type TerminalApp
} from './agents.js';
import type { PlatformContext } from './platform.js';
import { deeplink } from './launch-strategies/deeplink.js';
import { terminalCli } from './launch-strategies/terminal-cli.js';
import { workspaceAppCliChat, workspaceAppClipboard } from './launch-strategies/workspace-app.js';

export interface DispatchOptions {
	workspace: string;
	terminalApp?: TerminalApp;
}

export interface LaunchStrategy<A extends AgentConfig = AgentConfig> {
	probe(agent: A, workspace: string, ctx: PlatformContext): boolean;
	launch(agent: A, prompt: string, options: DispatchOptions, ctx: PlatformContext): void;
}

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
