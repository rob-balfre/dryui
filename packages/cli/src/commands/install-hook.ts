// dryui install-hook — Wire a `dryui ambient` SessionStart hook into a user's
// Claude Code settings.json. Idempotent; supports --global and --dry-run.
//
// Settings schema mirrors https://docs.claude.com/en/docs/claude-code/hooks.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { homedir } from 'node:os';
import { commandError, homeRelative, printCommandHelp, runCommand } from '../run.js';

interface ClaudeHookEntry {
	type: 'command';
	command: string;
}

interface ClaudeHookGroup {
	hooks: ClaudeHookEntry[];
	matcher?: string;
}

interface ClaudeSettingsHooks {
	SessionStart?: ClaudeHookGroup[];
	[event: string]: ClaudeHookGroup[] | undefined;
}

interface ClaudeSettings {
	hooks?: ClaudeSettingsHooks;
	[key: string]: unknown;
}

// Prefers the `dryui ambient` subcommand over the `dryui-ambient` bin so
// partial installs (only the main bin on PATH) still resolve correctly.
const AMBIENT_COMMAND = 'dryui ambient';

function hasFlag(args: string[], name: string): boolean {
	return args.includes(name);
}

function resolveSettingsPath(args: string[]): { path: string; scope: 'project' | 'global' } {
	if (hasFlag(args, '--global')) {
		return { path: resolve(homedir(), '.claude', 'settings.json'), scope: 'global' };
	}
	return { path: resolve(process.cwd(), '.claude', 'settings.json'), scope: 'project' };
}

function loadSettings(path: string): { data: ClaudeSettings; existed: boolean } {
	if (!existsSync(path)) return { data: {}, existed: false };
	const raw = readFileSync(path, 'utf-8').trim();
	if (!raw) return { data: {}, existed: true };
	try {
		const parsed = JSON.parse(raw);
		if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
			throw new Error('settings.json must be a JSON object');
		}
		return { data: parsed as ClaudeSettings, existed: true };
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		throw new Error(`Unable to parse ${path}: ${message}`);
	}
}

function hasDryuiSessionStartHook(settings: ClaudeSettings): boolean {
	const groups = settings.hooks?.SessionStart;
	if (!Array.isArray(groups)) return false;
	for (const group of groups) {
		if (!group || !Array.isArray(group.hooks)) continue;
		for (const entry of group.hooks) {
			if (entry?.type !== 'command') continue;
			if (entry.command && entry.command.includes('dryui ambient')) return true;
			if (entry.command && entry.command.includes('dryui-ambient')) return true;
		}
	}
	return false;
}

function mergeSessionStartHook(settings: ClaudeSettings): ClaudeSettings {
	const next: ClaudeSettings = { ...settings };
	const hooks: ClaudeSettingsHooks = { ...(next.hooks ?? {}) };
	const sessionStart: ClaudeHookGroup[] = Array.isArray(hooks.SessionStart)
		? hooks.SessionStart.map((g) => ({
				...g,
				hooks: Array.isArray(g.hooks) ? [...g.hooks] : []
			}))
		: [];

	const newEntry: ClaudeHookEntry = { type: 'command', command: AMBIENT_COMMAND };

	// Append to the first group without a matcher, else push a fresh group.
	const openGroup = sessionStart.find((g) => !g.matcher);
	if (openGroup) {
		openGroup.hooks = [...openGroup.hooks, newEntry];
	} else {
		sessionStart.push({ hooks: [newEntry] });
	}

	hooks.SessionStart = sessionStart;
	next.hooks = hooks;
	return next;
}

function ensureDir(path: string): void {
	const dir = dirname(path);
	if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

export function runInstallHook(args: string[]): void {
	if (args.includes('--help') || args.includes('-h')) {
		printCommandHelp({
			usage: 'dryui install-hook [--global] [--dry-run]',
			description: [
				'Wire the `dryui ambient` SessionStart hook into Claude Code settings.json.',
				'Idempotent — safe to re-run; skips if the hook is already registered.'
			],
			options: [
				'  --global     Target ~/.claude/settings.json (default: ./.claude/settings.json)',
				'  --dry-run    Print the merged settings without writing to disk'
			],
			examples: [
				'  dryui install-hook',
				'  dryui install-hook --global',
				'  dryui install-hook --dry-run'
			]
		});
	}

	const { path: settingsPath, scope } = resolveSettingsPath(args);
	const dryRun = hasFlag(args, '--dry-run');

	let loaded: { data: ClaudeSettings; existed: boolean };
	try {
		loaded = loadSettings(settingsPath);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		runCommand(
			commandError('toon', 'invalid-settings', message, [
				`Inspect ${homeRelative(settingsPath)}`,
				'Fix the JSON and rerun dryui install-hook'
			]),
			'toon'
		);
		return;
	}

	if (hasDryuiSessionStartHook(loaded.data)) {
		const lines = [
			`install-hook: already-wired | scope: ${scope}`,
			`settings: ${homeRelative(settingsPath)}`,
			`command: ${AMBIENT_COMMAND}`,
			'',
			'next[2]{cmd,description}:',
			'  dryui ambient,Preview the ambient output this hook will inject',
			'  dryui install-hook --dry-run,Re-check without touching settings'
		];
		runCommand({ output: lines.join('\n'), error: null, exitCode: 0 }, 'toon');
		return;
	}

	const merged = mergeSessionStartHook(loaded.data);
	const serialized = JSON.stringify(merged, null, 2) + '\n';

	if (dryRun) {
		const lines = [
			`install-hook: dry-run | scope: ${scope}`,
			`settings: ${homeRelative(settingsPath)}`,
			`action: ${loaded.existed ? 'merge' : 'create'}`,
			`command: ${AMBIENT_COMMAND}`,
			'',
			'--- settings.json preview ---',
			serialized.trimEnd(),
			'--- end preview ---',
			'',
			'next[2]{cmd,description}:',
			'  dryui install-hook,Apply the hook for real',
			'  dryui install-hook --global,Target ~/.claude/settings.json instead'
		];
		runCommand({ output: lines.join('\n'), error: null, exitCode: 0 }, 'toon');
		return;
	}

	try {
		ensureDir(settingsPath);
		writeFileSync(settingsPath, serialized);
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		runCommand(
			commandError('toon', 'write-failed', `Unable to write ${settingsPath}: ${message}`, [
				'Check directory permissions',
				'Retry with --dry-run to inspect the payload'
			]),
			'toon'
		);
		return;
	}

	const lines = [
		`install-hook: ${loaded.existed ? 'merged' : 'created'} | scope: ${scope}`,
		`settings: ${homeRelative(settingsPath)}`,
		`command: ${AMBIENT_COMMAND}`,
		'',
		'next[2]{cmd,description}:',
		'  dryui ambient,Preview the ambient output this hook injects',
		'  claude,Start a new Claude Code session to verify the hook fires'
	];
	runCommand({ output: lines.join('\n'), error: null, exitCode: 0 }, 'toon');
}
