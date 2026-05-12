import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
	DISPATCH_AGENTS,
	TERMINAL_APPS,
	type DispatchAgent,
	type DefaultDispatchAgent,
	type TerminalApp
} from './dispatch/agents.js';

export const DRYUI_PROJECT_CONFIG_FILE = 'dryui.config.json';

export interface FeedbackProjectConfig {
	defaultAgent?: unknown;
	terminalApp?: unknown;
}

export interface DryuiProjectConfig {
	feedback?: FeedbackProjectConfig;
}

export interface FeedbackDispatchDefaults {
	defaultAgent?: DefaultDispatchAgent;
	terminalApp?: TerminalApp;
}

function isObject(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function normalizeDefaultAgent(value: unknown): DefaultDispatchAgent | undefined {
	if (value === 'off') return 'off';
	if (typeof value === 'string' && DISPATCH_AGENTS.includes(value as DispatchAgent)) {
		return value as DispatchAgent;
	}
	return undefined;
}

function normalizeTerminalApp(value: unknown): TerminalApp | undefined {
	if (typeof value === 'string' && TERMINAL_APPS.includes(value as TerminalApp)) {
		return value as TerminalApp;
	}
	return undefined;
}

export function readDryuiProjectConfig(projectRoot: string): DryuiProjectConfig | null {
	const configPath = join(projectRoot, DRYUI_PROJECT_CONFIG_FILE);
	if (!existsSync(configPath)) return null;

	try {
		const parsed = JSON.parse(readFileSync(configPath, 'utf-8')) as unknown;
		if (!isObject(parsed)) return null;
		const feedback = isObject(parsed.feedback) ? parsed.feedback : undefined;
		return feedback ? { feedback } : {};
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		console.error(`[feedback] failed to read ${configPath}: ${reason}`);
		return null;
	}
}

export function readFeedbackDispatchDefaults(projectRoot: string): FeedbackDispatchDefaults {
	const config = readDryuiProjectConfig(projectRoot);
	const feedback = config?.feedback;
	if (!feedback) return {};
	const defaultAgent = normalizeDefaultAgent(feedback.defaultAgent);
	const terminalApp = normalizeTerminalApp(feedback.terminalApp);

	return {
		...(defaultAgent ? { defaultAgent } : {}),
		...(terminalApp ? { terminalApp } : {})
	};
}
