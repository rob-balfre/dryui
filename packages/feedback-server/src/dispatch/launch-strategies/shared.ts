import { resolveAgentPath, type AgentConfig, type DispatchConfigWarning } from '../agents.js';
import type { PlatformContext } from '../platform.js';

export function probeMcpConfig(
	agent: AgentConfig,
	workspace: string,
	ctx: PlatformContext
): boolean {
	for (const probe of agent.mcpConfigProbes ?? []) {
		const path = resolveAgentPath(probe.pathTemplate, workspace, ctx.homeDir);
		if (ctx.hasJsonEntry(path, probe.rootKey, probe.entryKey)) return true;
	}
	return false;
}

export function probeMacApps(agent: AgentConfig, ctx: PlatformContext): boolean {
	for (const name of agent.macApps ?? []) {
		if (ctx.macAppExists(name)) return true;
	}
	return false;
}

const dispatchConfigWarnings = new Set<string>();

function warnOnce(key: string, message: string): void {
	if (dispatchConfigWarnings.has(key)) return;
	dispatchConfigWarnings.add(key);
	console.error(message);
}

export function checkDispatchWarning(
	warning: DispatchConfigWarning,
	workspace: string,
	ctx: PlatformContext
): void {
	const path = resolveAgentPath(warning.pathTemplate, workspace, ctx.homeDir);
	const inspection = ctx.inspectJsonEntry(path, warning.rootKey, warning.entryKey);
	if (inspection.status === 'present') return;
	if (inspection.status === 'missing-file') {
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

	if (inspection.status === 'read-error') {
		warnOnce(
			`read:${path}:${inspection.code ?? 'unknown'}`,
			`[dispatch] warning: could not read ${path} (${inspection.code ?? 'unknown error'}). Proceeding with launch anyway.`
		);
		return;
	}

	if (inspection.status === 'invalid-json') {
		warnOnce(
			`parse:${path}`,
			`[dispatch] warning: ${path} is not valid JSON (${inspection.message}). Proceeding with launch anyway.`
		);
		return;
	}

	if (inspection.status === 'missing-entry') {
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
