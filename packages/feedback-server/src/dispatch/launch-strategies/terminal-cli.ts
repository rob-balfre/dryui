import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { TerminalCliAgent } from '../agents.js';
import type { DispatchOptions, LaunchStrategy } from '../launch.js';
import { osaQuote, shellQuote, type PlatformContext } from '../platform.js';
import { checkDispatchWarning, probeMcpConfig } from './shared.js';

/**
 * When the feedback-server runs from a dryui workspace checkout, prefer the
 * live plugin source over the marketplace install. Claude Code's
 * `--plugin-dir <path>` flag loads a plugin directly from a local tree and
 * takes precedence over the install with the same name. Override with
 * `DRYUI_PLUGIN_DIR` for ad-hoc testing.
 */
export function resolveLocalPluginDir(): string | null {
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

function buildOsaArgs(
	terminalApp: DispatchOptions['terminalApp'],
	cliCommand: string,
	workspace: string
): string[] {
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

export const terminalCli: LaunchStrategy<TerminalCliAgent> = {
	probe(agent, workspace, ctx) {
		if (ctx.commandExists(agent.cliCommand)) return true;
		return probeMcpConfig(agent, workspace, ctx);
	},
	launch(agent, prompt, options, ctx: PlatformContext) {
		if (agent.dispatchWarning) {
			checkDispatchWarning(agent.dispatchWarning, options.workspace, ctx);
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
