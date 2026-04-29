import { which } from 'bun';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createProbeCache, hasJsonEntry, type ProbeCache } from './config-probe.js';
import type { EventBus } from './events.js';
import { buildFeedbackDispatchPrompt } from './prompts.js';
import { ensureProjectSkillCopy, resolveDispatchSkillPath } from './skill-path.js';
import type { Submission, SubmissionAgent } from './types.js';

export type DispatchAgent = Exclude<SubmissionAgent, 'off'>;
export type DefaultDispatchAgent = DispatchAgent | 'off';
export const DISPATCH_AGENTS: readonly DispatchAgent[] = [
	'claude',
	'codex',
	'gemini',
	'opencode',
	'copilot',
	'copilot-vscode',
	'cursor',
	'windsurf',
	'zed'
] as const;

export type TerminalApp = 'terminal' | 'ghostty';
export const TERMINAL_APPS: readonly TerminalApp[] = ['terminal', 'ghostty'];

const TERMINAL_CLI: Record<'claude' | 'gemini' | 'opencode' | 'copilot', readonly string[]> = {
	// Pin every dispatched claude session to the `feedback` subagent. The agent
	// reads its canonical skill at startup, so the AreaGrid no-gap rule and the
	// lint trip-wires are loaded before the first edit instead of being learned
	// by lint failure.
	claude: ['claude', '--agent', 'feedback'],
	gemini: ['gemini'],
	opencode: ['opencode'],
	copilot: ['copilot', '-i']
};

// When this server runs from a dryui workspace checkout, prefer the live
// plugin source over whatever `/plugin install dryui@dryui` cached. Claude
// Code's `--plugin-dir <path>` flag loads a plugin directly from a local
// tree and takes precedence over the marketplace install with the same
// name (https://code.claude.com/docs/en/plugins.md#test-your-plugins-locally),
// so plugin authors get the same hot-reload story as `dev:link` gives the
// CLI bins. Override path with DRYUI_PLUGIN_DIR for ad-hoc testing.
function resolveLocalPluginDir(): string | null {
	const explicit = process.env['DRYUI_PLUGIN_DIR'];
	if (explicit) {
		return existsSync(join(explicit, '.claude-plugin', 'plugin.json')) ? explicit : null;
	}
	let dir: string;
	try {
		dir = dirname(fileURLToPath(import.meta.url));
	} catch {
		return null;
	}
	for (let i = 0; i < 8; i++) {
		const pluginDir = join(dir, 'packages', 'plugin');
		if (
			existsSync(join(pluginDir, '.claude-plugin', 'plugin.json')) &&
			existsSync(join(dir, 'packages', 'ui', 'package.json'))
		) {
			return pluginDir;
		}
		const parent = dirname(dir);
		if (parent === dir) break;
		dir = parent;
	}
	return null;
}

// Default the dispatched claude session to Opus + auto permission mode +
// auto effort. Auto permission mode is gated by model+plan: on Max plans
// only Opus 4.7 carries it, so we pin Opus (Sonnet 4.6 on Max says "auto
// mode unavailable for this model"). Power users on Team/Enterprise/API
// plans who want Sonnet+auto can set `DRYUI_FEEDBACK_MODEL=sonnet`.
//
// Effort=auto is the "model default" effort. Claude Code's `--effort` CLI
// flag does NOT accept `auto` — only the named levels low/medium/high/
// xhigh/max — but the `CLAUDE_CODE_EFFORT_LEVEL` env var does. We export it
// in the spawned shell so the dispatched session boots with auto effort
// without needing a `/effort auto` slash command. Pin a level via
// `DRYUI_FEEDBACK_EFFORT` (low/medium/high/xhigh/max/auto). See:
// https://code.claude.com/docs/en/model-config.md#set-the-effort-level
// https://code.claude.com/docs/en/permission-modes.md#eliminate-prompts-with-auto-mode
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

// Memoize: feedback-server is long-lived and the plugin path doesn't change
// during a process lifetime. Avoid walking the filesystem on every dispatch.
let claudeCliArgsCache: readonly string[] | null = null;
let claudeCliEnvPrefixCache: string | null = null;

function getCliArgs(target: keyof typeof TERMINAL_CLI): readonly string[] {
	if (target !== 'claude') return TERMINAL_CLI[target];
	if (claudeCliArgsCache) return claudeCliArgsCache;
	const model = resolveClaudeModel();
	const permissionMode = resolveClaudePermissionMode();
	const effort = resolveClaudeEffort();
	const localPlugin = resolveLocalPluginDir();
	const args: string[] = [
		...TERMINAL_CLI.claude,
		'--model',
		model,
		'--permission-mode',
		permissionMode
	];
	// Only pass --effort for named levels; `auto` is set via env so it
	// reaches the session default without a CLI flag rejection.
	if (effort !== 'auto') {
		args.push('--effort', effort);
	}
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

/** Shell-prefix env vars for the dispatched claude session, e.g. `CLAUDE_CODE_EFFORT_LEVEL='auto' `. */
function getCliEnvPrefix(target: keyof typeof TERMINAL_CLI): string {
	if (target !== 'claude') return '';
	if (claudeCliEnvPrefixCache !== null) return claudeCliEnvPrefixCache;
	const effort = resolveClaudeEffort();
	const exports: Array<[string, string]> = [];
	if (effort === 'auto') {
		// `--effort auto` isn't accepted by the CLI; the env var is.
		exports.push(['CLAUDE_CODE_EFFORT_LEVEL', effort]);
	}
	claudeCliEnvPrefixCache =
		exports.length === 0
			? ''
			: exports.map(([key, value]) => `${key}=${shellQuote(value)}`).join(' ') + ' ';
	return claudeCliEnvPrefixCache;
}

const APP_COMMANDS: Record<'cursor' | 'windsurf' | 'zed', readonly [string, ...string[]]> = {
	cursor: ['cursor'],
	windsurf: ['windsurf'],
	zed: ['zed']
};

type WorkspaceAppTarget = keyof typeof APP_COMMANDS;

const APP_NAMES: Record<'cursor' | 'windsurf' | 'zed', string> = {
	cursor: 'Cursor',
	windsurf: 'Windsurf',
	zed: 'Zed'
};

const CODEX_PLUGIN_CHIP = '[@dryui](plugin://dryui@dryui) ';

export interface DispatcherOptions {
	workspace: string;
	defaultAgent: DefaultDispatchAgent;
	terminalApp?: TerminalApp;
}

interface DispatchTargetsSnapshot {
	defaultAgent: DefaultDispatchAgent;
	configuredAgents: DispatchAgent[];
	/**
	 * Absolute path to the canonical SKILL.md, resolved from the running
	 * server's own package. The UI uses this when building the copy-paste
	 * prompt so users don't paste a `node_modules/...` reference that won't
	 * resolve in their project (the server is usually globally linked, not
	 * a direct project dep).
	 */
	skillPath: string | null;
}

function shellQuote(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}

function osaQuote(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// PATH contents and installed apps are stable for the lifetime of this process;
// memoize so repeated /dispatch-targets GETs don't re-walk PATH for 9 agents each.
const commandExistsCache = new Map<string, boolean>();
const macAppExistsCache = new Map<string, boolean>();
const chatSupportCache = new Map<string, boolean>();
let vscodeCliCache: VsCodeCliTarget | null | undefined;
let windsurfCliCache: string | null | undefined;

type VsCodeUrlScheme = 'vscode' | 'vscode-insiders';

interface VsCodeCliTarget {
	command: string;
	urlScheme: VsCodeUrlScheme;
}

interface CliResolverContext {
	currentPlatform: NodeJS.Platform;
	homeDir: string;
	resolveCommand(command: string): string | null;
	pathExists(path: string): boolean;
	supportsChat(command: string): boolean;
}

function commandExists(command: string): boolean {
	const cached = commandExistsCache.get(command);
	if (cached !== undefined) return cached;
	const found = which(command) !== null;
	commandExistsCache.set(command, found);
	return found;
}

function macAppExists(name: string): boolean {
	const cached = macAppExistsCache.get(name);
	if (cached !== undefined) return cached;
	const found =
		platform() === 'darwin' &&
		(existsSync(join('/Applications', `${name}.app`)) ||
			existsSync(join(homedir(), 'Applications', `${name}.app`)));
	macAppExistsCache.set(name, found);
	return found;
}

function supportsChatCommand(command: string): boolean {
	const cached = chatSupportCache.get(command);
	if (cached !== undefined) return cached;

	const result = spawnSync(command, ['chat', '--help'], {
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe'],
		timeout: 2000,
		windowsHide: true
	});
	const output = `${result.stdout ?? ''}\n${result.stderr ?? ''}`;
	const supported = result.status === 0 && /\bUsage:\s+\S+\s+chat\b/.test(output);
	chatSupportCache.set(command, supported);
	return supported;
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
	const add = (command: string | null, urlScheme: VsCodeUrlScheme) => {
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

function resolveVsCodeCli(): VsCodeCliTarget | null {
	if (vscodeCliCache !== undefined) return vscodeCliCache;
	vscodeCliCache = resolveVsCodeCliWith({
		currentPlatform: platform(),
		homeDir: homedir(),
		resolveCommand: (command) => which(command),
		pathExists: (path) => existsSync(path),
		supportsChat: supportsChatCommand
	});
	return vscodeCliCache;
}

function resolveWindsurfCli(): string | null {
	if (windsurfCliCache !== undefined) return windsurfCliCache;
	windsurfCliCache = resolveWindsurfCliWith({
		currentPlatform: platform(),
		homeDir: homedir(),
		resolveCommand: (command) => which(command),
		pathExists: (path) => existsSync(path),
		supportsChat: supportsChatCommand
	});
	return windsurfCliCache;
}

function resolveVsCodeUrlScheme(): VsCodeUrlScheme {
	const cli = resolveVsCodeCli();
	if (cli) return cli.urlScheme;
	if (!macAppExists('Visual Studio Code') && macAppExists('Visual Studio Code - Insiders')) {
		return 'vscode-insiders';
	}
	return 'vscode';
}

function isConfiguredAgent(
	agent: DispatchAgent,
	options: DispatcherOptions,
	cache: ProbeCache
): boolean {
	switch (agent) {
		case 'claude':
			return commandExists('claude');
		case 'codex':
			return commandExists('codex') || macAppExists('Codex');
		case 'gemini':
			return commandExists('gemini');
		case 'opencode':
			return (
				commandExists('opencode') ||
				hasJsonEntry(join(options.workspace, 'opencode.json'), 'mcp', 'dryui-feedback', cache) ||
				hasJsonEntry(join(options.workspace, 'opencode.json'), 'mcp', 'dryui', cache)
			);
		case 'copilot':
			return (
				commandExists('copilot') ||
				hasJsonEntry(
					join(homedir(), '.copilot', 'mcp-config.json'),
					'mcpServers',
					'dryui-feedback',
					cache
				)
			);
		case 'copilot-vscode': {
			const vscodeConfig = join(options.workspace, '.vscode', 'mcp.json');
			return (
				resolveVsCodeCli() !== null ||
				macAppExists('Visual Studio Code') ||
				macAppExists('Visual Studio Code - Insiders') ||
				hasJsonEntry(vscodeConfig, 'servers', 'dryui-feedback', cache) ||
				hasJsonEntry(vscodeConfig, 'servers', 'dryui', cache)
			);
		}
		case 'cursor':
			return (
				commandExists('cursor') ||
				macAppExists('Cursor') ||
				hasJsonEntry(join(options.workspace, '.cursor', 'mcp.json'), 'mcpServers', 'dryui', cache)
			);
		case 'windsurf': {
			const windsurfConfig = join(homedir(), '.codeium', 'windsurf', 'mcp_config.json');
			return (
				commandExists('windsurf') ||
				macAppExists('Windsurf') ||
				resolveWindsurfCli() !== null ||
				hasJsonEntry(windsurfConfig, 'mcpServers', 'dryui-feedback', cache) ||
				hasJsonEntry(windsurfConfig, 'mcpServers', 'dryui', cache)
			);
		}
		case 'zed':
			return (
				commandExists('zed') ||
				macAppExists('Zed') ||
				hasJsonEntry(
					join(homedir(), '.config', 'zed', 'settings.json'),
					'context_servers',
					'dryui',
					cache
				)
			);
	}
}

export function getDispatchTargetsSnapshot(options: DispatcherOptions): DispatchTargetsSnapshot {
	const cache = createProbeCache();
	// Mirror the skill into the project once per snapshot so the UI's copy-paste
	// prompt points at a path that's inside the project boundary (same rationale
	// as the auto-dispatch path).
	const skillPath = ensureProjectSkillCopy(options.workspace) ?? resolveDispatchSkillPath();
	return {
		defaultAgent: options.defaultAgent,
		configuredAgents: DISPATCH_AGENTS.filter((agent) => isConfiguredAgent(agent, options, cache)),
		skillPath
	};
}

function resolveAgent(submission: Submission, defaultAgent: DefaultDispatchAgent): SubmissionAgent {
	const choice = submission.agent;
	if (choice === 'off' || (choice && DISPATCH_AGENTS.includes(choice))) return choice;
	return defaultAgent;
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

function buildCliInvocation(
	target: keyof typeof TERMINAL_CLI,
	prompt: string,
	workspace: string
): string {
	if (target === 'opencode') {
		return `${shellQuote('opencode')} ${shellQuote(workspace)} --prompt ${shellQuote(prompt)}`;
	}

	const cli = getCliArgs(target);
	const cliArgs = cli.map((entry) => shellQuote(entry)).join(' ');
	const envPrefix = getCliEnvPrefix(target);
	return `${envPrefix}${cliArgs} ${shellQuote(prompt)}`;
}

export function buildVsCodeChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', prompt];
}

export function buildWindsurfChatArgs(prompt: string): string[] {
	return ['chat', '--mode', 'agent', '--maximize', prompt];
}

function spawnDetached(command: string, args: readonly string[], cwd?: string): void {
	spawn(command, args, { stdio: 'ignore', detached: true, cwd }).unref();
}

function copyPromptToClipboard(prompt: string): void {
	const tool = platform() === 'win32' ? 'clip.exe' : 'pbcopy';
	const child = spawn(tool, [], { stdio: ['pipe', 'ignore', 'ignore'] });
	child.stdin.end(prompt);
}

export type WorkspaceAppLaunchStrategy = 'cli' | 'mac-open' | 'windows-start';

export interface WorkspaceAppLaunchContext {
	currentPlatform: NodeJS.Platform;
	commandExists(command: string): boolean;
	macAppExists(name: string): boolean;
}

export interface WorkspaceAppLaunchPlan {
	command: string;
	args: readonly string[];
	strategy: WorkspaceAppLaunchStrategy;
}

export function buildWorkspaceAppLaunch(
	target: WorkspaceAppTarget,
	workspace: string,
	context: WorkspaceAppLaunchContext
): WorkspaceAppLaunchPlan | null {
	const [command, ...args] = APP_COMMANDS[target];

	if (context.commandExists(command)) {
		return {
			command,
			args: [...args, workspace],
			strategy: 'cli'
		};
	}

	if (context.currentPlatform === 'win32') {
		return {
			command: 'cmd.exe',
			args: ['/c', 'start', '', command, ...args, workspace],
			strategy: 'windows-start'
		};
	}

	if (context.currentPlatform === 'darwin' && context.macAppExists(APP_NAMES[target])) {
		return {
			command: 'sh',
			// sh -c is intentional: spawn('open', [...]) drops the prompt when fired from
			// the long-lived server process, while sh -c 'open ...' works. Root cause unclear.
			args: ['-c', `open -a ${shellQuote(APP_NAMES[target])} ${shellQuote(workspace)}`],
			strategy: 'mac-open'
		};
	}

	return null;
}

function openWorkspaceApp(target: WorkspaceAppTarget, workspace: string): void {
	const launch = buildWorkspaceAppLaunch(target, workspace, {
		currentPlatform: platform(),
		commandExists,
		macAppExists
	});

	if (!launch) {
		console.error(
			`[dispatch] unable to launch ${target}: ${APP_COMMANDS[target][0]} is not on PATH and ${APP_NAMES[target]}.app was not found`
		);
		return;
	}

	console.error(`[dispatch] launching ${target} via ${launch.strategy}`);
	spawnDetached(launch.command, launch.args);
}

// Track which config warnings we've already printed so repeated dispatches
// don't spam the same stderr hint on every submission.
const dispatchConfigWarnings = new Set<string>();

const COPILOT_CONFIG_SNIPPET = `{
  "mcpServers": {
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

const COPILOT_VSCODE_CONFIG_SNIPPET = `{
  "servers": {
    "dryui-feedback": {
      "type": "stdio",
      "command": "sh",
      "args": ["-c", "cd \\"\${TMPDIR:-/tmp}\\" && exec npx -y -p @dryui/feedback-server dryui-feedback-mcp"]
    }
  }
}`;

function warnOnce(key: string, message: string): void {
	if (dispatchConfigWarnings.has(key)) return;
	dispatchConfigWarnings.add(key);
	console.error(message);
}

interface DispatchConfigCheck {
	path: string;
	rootKey: 'mcpServers' | 'servers';
	readerLabel: string;
	snippet: string;
}

function checkDispatchConfig({ path, rootKey, readerLabel, snippet }: DispatchConfigCheck): void {
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
					`[dispatch] ${readerLabel} reads MCP servers from this file. Without it, the dispatched prompt`,
					`[dispatch] will run but the \`dryui-feedback\` MCP tools will not be available.`,
					`[dispatch] To enable them, create the file with:`,
					...snippet.split('\n').map((line) => `[dispatch]   ${line}`),
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
	)?.[rootKey];
	if (!servers || typeof servers !== 'object' || !('dryui-feedback' in servers)) {
		warnOnce(
			`missing-entry:${path}`,
			[
				`[dispatch] warning: ${path} has no \`dryui-feedback\` entry under \`${rootKey}\`.`,
				`[dispatch] Add this block so ${readerLabel} can reach the feedback MCP:`,
				...snippet.split('\n').map((line) => `[dispatch]   ${line}`),
				`[dispatch] Proceeding with launch anyway.`
			].join('\n')
		);
	}
}

function checkCopilotCliMcpConfig(): void {
	checkDispatchConfig({
		path: join(homedir(), '.copilot', 'mcp-config.json'),
		rootKey: 'mcpServers',
		readerLabel: 'Copilot CLI',
		snippet: COPILOT_CONFIG_SNIPPET
	});
}

function checkCopilotVsCodeMcpConfig(workspace: string): void {
	checkDispatchConfig({
		path: join(workspace, '.vscode', 'mcp.json'),
		rootKey: 'servers',
		readerLabel: 'VS Code Copilot',
		snippet: COPILOT_VSCODE_CONFIG_SNIPPET
	});
}

function openExternalUrl(url: string): void {
	if (platform() === 'win32') {
		// `start "" "<url>"` — empty title arg is required when the target is quoted.
		spawnDetached('cmd.exe', ['/c', 'start', '', url]);
		return;
	}
	spawnDetached('sh', ['-c', `open ${shellQuote(url)}`]);
}

export function isDispatchPlatformSupported(): boolean {
	const currentPlatform = platform();
	return currentPlatform === 'darwin' || currentPlatform === 'win32';
}

export function dispatchPrompt(
	target: DispatchAgent,
	prompt: string,
	options: Pick<DispatcherOptions, 'workspace' | 'terminalApp'>
): void {
	const fullPrompt = target === 'codex' ? `${CODEX_PLUGIN_CHIP}${prompt}` : prompt;
	console.error(`[dispatch] → ${target}`);

	if (target === 'codex') {
		const url = `codex://new?prompt=${encodeURIComponent(fullPrompt)}&path=${encodeURIComponent(options.workspace)}`;
		openExternalUrl(url);
		return;
	}

	if (target === 'copilot-vscode') {
		checkCopilotVsCodeMcpConfig(options.workspace);
		const vscodeCli = resolveVsCodeCli();
		if (vscodeCli) {
			console.error(`[dispatch] launching ${vscodeCli.command} chat for ${target}`);
			spawnDetached(vscodeCli.command, buildVsCodeChatArgs(fullPrompt), options.workspace);
			return;
		}
		copyPromptToClipboard(fullPrompt);
		console.error(`[dispatch] copied prompt to clipboard for ${target} (deeplink fallback)`);
		openExternalUrl(`${resolveVsCodeUrlScheme()}://GitHub.Copilot-Chat/chat?mode=agent`);
		return;
	}

	if (target === 'windsurf') {
		copyPromptToClipboard(fullPrompt);
		console.error(`[dispatch] copied prompt to clipboard for ${target}`);
		const windsurfCli = resolveWindsurfCli();
		if (windsurfCli) {
			console.error(`[dispatch] launching ${windsurfCli} chat for ${target}`);
			spawnDetached(windsurfCli, buildWindsurfChatArgs(fullPrompt), options.workspace);
			return;
		}
		openWorkspaceApp(target, options.workspace);
		return;
	}

	if (target === 'cursor' || target === 'zed') {
		copyPromptToClipboard(fullPrompt);
		console.error(`[dispatch] copied prompt to clipboard for ${target}`);
		openWorkspaceApp(target, options.workspace);
		return;
	}

	if (target === 'copilot') {
		checkCopilotCliMcpConfig();
	}

	if (platform() === 'win32') {
		const wtArgs =
			target === 'opencode'
				? ['-d', options.workspace, '--', 'opencode', options.workspace, '--prompt', fullPrompt]
				: ['-d', options.workspace, '--', ...getCliArgs(target), fullPrompt];
		spawnDetached('wt.exe', wtArgs);
		return;
	}

	const cliCommand = buildCliInvocation(target, fullPrompt, options.workspace);
	const args = buildOsaArgs(options.terminalApp ?? 'terminal', cliCommand, options.workspace);
	spawnDetached('osascript', args);
}

function dispatch(submission: Submission, options: DispatcherOptions): void {
	const target = resolveAgent(submission, options.defaultAgent);
	if (target === 'off') {
		console.error(`[dispatch] skip (off) ${submission.id}`);
		return;
	}

	const dispatchWorkspace = submission.workspace ?? options.workspace;
	// Mirror the skill into the project so the agent's Read stays inside the
	// project root — `auto` permission mode still prompts on out-of-project
	// reads, which is what was breaking the dispatched session.
	const skillPath = ensureProjectSkillCopy(dispatchWorkspace);
	const prompt = buildFeedbackDispatchPrompt(submission, skillPath ? { skillPath } : undefined);
	console.error(`[dispatch] submission ${submission.id}`);
	dispatchPrompt(target, prompt, {
		...options,
		workspace: dispatchWorkspace
	});
}

export function attachDispatcher(bus: EventBus, options: DispatcherOptions): () => void {
	const currentPlatform = platform();
	if (currentPlatform !== 'darwin' && currentPlatform !== 'win32') {
		console.error(`[dispatch] unsupported platform ${currentPlatform}; dispatch disabled`);
		return () => {};
	}
	const terminalLabel = currentPlatform === 'win32' ? 'wt' : (options.terminalApp ?? 'terminal');
	console.error(
		`[dispatch] enabled (default=${options.defaultAgent}, workspace=${options.workspace}, terminal=${terminalLabel})`
	);
	return bus.subscribe((event) => dispatch(event.payload as Submission, options), {
		agent: true,
		matches: (event) => event.type === 'submission.created'
	});
}
