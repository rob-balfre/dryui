import { spawn } from 'node:child_process';
import { platform } from 'node:os';
import type { EventBus } from './events.js';
import type { Submission, SubmissionAgent } from './types.js';

export type DispatchAgent = Exclude<SubmissionAgent, 'off'>;
export const DISPATCH_AGENTS: readonly DispatchAgent[] = ['codex', 'claude', 'gemini', 'copilot'];

const TERMINAL_CLI: Record<Exclude<DispatchAgent, 'codex'>, readonly string[]> = {
	claude: ['claude'],
	gemini: ['gemini'],
	copilot: ['copilot', '-i']
};

const CODEX_PLUGIN_CHIP = '[@dryui](plugin://dryui@dryui) ';

export interface DispatcherOptions {
	workspace: string;
	defaultAgent: DispatchAgent;
}

function buildPrompt(s: Submission, target: DispatchAgent): string {
	const pluginChip = target === 'codex' ? CODEX_PLUGIN_CHIP : '';
	return `${pluginChip}New feedback submission ${s.id} on ${s.url}. Call feedback_get_submissions via the dryui-feedback MCP to fetch the screenshot and drawings, act on the change, then resolve with feedback_resolve_submission.`;
}

function shellQuote(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}

function osaQuote(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

function resolveAgent(submission: Submission, defaultAgent: DispatchAgent): SubmissionAgent {
	const choice = submission.agent;
	if (choice === 'off' || (choice && DISPATCH_AGENTS.includes(choice))) return choice;
	return defaultAgent;
}

function dispatch(submission: Submission, options: DispatcherOptions): void {
	const target = resolveAgent(submission, options.defaultAgent);
	if (target === 'off') {
		console.error(`[dispatch] skip (off) ${submission.id}`);
		return;
	}
	const prompt = buildPrompt(submission, target);
	console.error(`[dispatch] → ${target} (${submission.id})`);
	if (target === 'codex') {
		const url = `codex://new?prompt=${encodeURIComponent(prompt)}&path=${encodeURIComponent(options.workspace)}`;
		// sh -c is intentional: spawn('open', [url]) drops the prompt when fired from
		// the long-lived server process, while sh -c 'open ...' works. Root cause unclear.
		spawn('sh', ['-c', `open ${shellQuote(url)}`], { stdio: 'ignore', detached: true }).unref();
		return;
	}
	const cliArgs = TERMINAL_CLI[target].map((a) => shellQuote(a)).join(' ');
	const command = `cd ${shellQuote(options.workspace)} && ${cliArgs} ${shellQuote(prompt)}`;
	const script = `tell application "Terminal" to do script "${osaQuote(command)}"`;
	spawn('osascript', ['-e', script], { stdio: 'ignore', detached: true }).unref();
}

export function attachDispatcher(bus: EventBus, options: DispatcherOptions): () => void {
	if (platform() !== 'darwin') {
		console.error(`[dispatch] unsupported platform ${platform()}; dispatch disabled`);
		return () => {};
	}
	console.error(
		`[dispatch] enabled (default=${options.defaultAgent}, workspace=${options.workspace})`
	);
	return bus.subscribe((event) => dispatch(event.payload as Submission, options), {
		agent: true,
		matches: (event) => event.type === 'submission.created'
	});
}
