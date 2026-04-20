import { spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import type { EventBus } from './events.js';
import type { Submission, SubmissionAgent } from './types.js';

export type DispatchAgent = Exclude<SubmissionAgent, 'off'>;
export const DISPATCH_AGENTS: readonly DispatchAgent[] = ['codex', 'claude', 'gemini', 'copilot'];

export type TerminalApp = 'terminal' | 'ghostty';
export const TERMINAL_APPS: readonly TerminalApp[] = ['terminal', 'ghostty'];

const TERMINAL_CLI: Record<Exclude<DispatchAgent, 'codex'>, readonly string[]> = {
	claude: ['claude'],
	gemini: ['gemini'],
	copilot: ['copilot', '-i']
};

const CODEX_PLUGIN_CHIP = '[@dryui](plugin://dryui@dryui) ';

export interface DispatcherOptions {
	workspace: string;
	defaultAgent: DispatchAgent;
	terminalApp?: TerminalApp;
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

function buildOsaArgs(terminalApp: TerminalApp, cliCommand: string, workspace: string): string[] {
	if (terminalApp === 'ghostty') {
		// Ghostty 1.3+ AppleScript. `command` is wrapped in `/bin/sh -c` by Ghostty
		// when it has arguments, so shell-quoted args inside cliCommand work as expected.
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

// Track which `~/.copilot/mcp-config.json` warnings we've already printed so
// repeated dispatches don't spam the same stderr hint on every submission.
const copilotConfigWarnings = new Set<string>();

const COPILOT_CONFIG_SNIPPET = `{
  "mcpServers": {
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

function warnOnce(key: string, message: string): void {
	if (copilotConfigWarnings.has(key)) return;
	copilotConfigWarnings.add(key);
	console.error(message);
}

// Fast, best-effort check for `dryui-feedback` in ~/.copilot/mcp-config.json.
// Missing file or malformed JSON is not fatal; we warn and let the launch proceed
// (Copilot will still receive the prompt, just without native MCP tools).
function checkCopilotMcpConfig(): void {
	const path = join(homedir(), '.copilot', 'mcp-config.json');
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
					`[dispatch] Copilot CLI reads MCP servers from this file. Without it, the dispatched prompt`,
					`[dispatch] will run but the \`dryui-feedback\` MCP tools will not be available to Copilot.`,
					`[dispatch] To enable them, create the file with:`,
					...COPILOT_CONFIG_SNIPPET.split('\n').map((line) => `[dispatch]   ${line}`),
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
	const servers = (parsed as { mcpServers?: Record<string, unknown> } | null)?.mcpServers;
	if (!servers || typeof servers !== 'object' || !('dryui-feedback' in servers)) {
		warnOnce(
			`missing-entry:${path}`,
			[
				`[dispatch] warning: ${path} has no \`dryui-feedback\` entry under \`mcpServers\`.`,
				`[dispatch] Add this block so Copilot CLI can reach the feedback MCP:`,
				...COPILOT_CONFIG_SNIPPET.split('\n').map((line) => `[dispatch]   ${line}`),
				`[dispatch] Proceeding with launch anyway.`
			].join('\n')
		);
	}
}

function openCodexUrl(url: string): void {
	if (platform() === 'win32') {
		// `start "" "<url>"` — empty title arg is required when the target is quoted.
		spawn('cmd.exe', ['/c', 'start', '', url], { stdio: 'ignore', detached: true }).unref();
		return;
	}
	// sh -c is intentional: spawn('open', [url]) drops the prompt when fired from
	// the long-lived server process, while sh -c 'open ...' works. Root cause unclear.
	spawn('sh', ['-c', `open ${shellQuote(url)}`], { stdio: 'ignore', detached: true }).unref();
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
		openCodexUrl(url);
		return;
	}
	const cli = TERMINAL_CLI[target];
	if (target === 'copilot') {
		// Copilot CLI only loads MCP servers from ~/.copilot/mcp-config.json.
		// Warn if it's missing or incomplete so the user knows why native tools are absent.
		checkCopilotMcpConfig();
	}
	if (platform() === 'win32') {
		spawn('wt.exe', ['-d', options.workspace, '--', ...cli, prompt], {
			stdio: 'ignore',
			detached: true
		}).unref();
		return;
	}
	const cliArgs = cli.map((a) => shellQuote(a)).join(' ');
	const cliCommand = `${cliArgs} ${shellQuote(prompt)}`;
	const args = buildOsaArgs(options.terminalApp ?? 'terminal', cliCommand, options.workspace);
	spawn('osascript', args, { stdio: 'ignore', detached: true }).unref();
}

export function attachDispatcher(bus: EventBus, options: DispatcherOptions): () => void {
	const p = platform();
	if (p !== 'darwin' && p !== 'win32') {
		console.error(`[dispatch] unsupported platform ${p}; dispatch disabled`);
		return () => {};
	}
	const terminalLabel = p === 'win32' ? 'wt' : (options.terminalApp ?? 'terminal');
	console.error(
		`[dispatch] enabled (default=${options.defaultAgent}, workspace=${options.workspace}, terminal=${terminalLabel})`
	);
	return bus.subscribe((event) => dispatch(event.payload as Submission, options), {
		agent: true,
		matches: (event) => event.type === 'submission.created'
	});
}
