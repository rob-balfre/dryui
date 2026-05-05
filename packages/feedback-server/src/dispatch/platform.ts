// Platform context for dispatch.
//
// Bundles every OS-touching primitive a strategy needs (commandExists,
// macAppExists, spawnDetached, copyPromptToClipboard, openExternalUrl, plus
// the small string utilities). Strategies receive a PlatformContext at the
// public seam (`dispatchPrompt`/`getDispatchTargetsSnapshot`) and never reach
// for `node:os` or `node:child_process` directly. Tests can build a fake.

import { which } from 'bun';
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir, platform } from 'node:os';
import { join } from 'node:path';
import { createProbeCache, hasJsonEntry, type ProbeCache } from '../config-probe.js';

export interface PlatformContext {
	currentPlatform: NodeJS.Platform;
	homeDir: string;
	commandExists(command: string): boolean;
	macAppExists(name: string): boolean;
	resolveCommand(command: string): string | null;
	pathExists(path: string): boolean;
	supportsChat(command: string): boolean;
	hasJsonEntry(path: string, rootKey: string, entryKey: string): boolean;
	copyPromptToClipboard(prompt: string): void;
	openExternalUrl(url: string): void;
	spawnDetached(command: string, args: readonly string[], cwd?: string): void;
}

// PATH contents and installed apps are stable for the lifetime of this process,
// so memoise. Probes against the same JSON file are amortised through a single
// ProbeCache per snapshot.
const commandExistsCache = new Map<string, boolean>();
const macAppExistsCache = new Map<string, boolean>();
const chatSupportCache = new Map<string, boolean>();

function defaultCommandExists(command: string): boolean {
	const cached = commandExistsCache.get(command);
	if (cached !== undefined) return cached;
	const found = which(command) !== null;
	commandExistsCache.set(command, found);
	return found;
}

function defaultMacAppExists(name: string): boolean {
	const cached = macAppExistsCache.get(name);
	if (cached !== undefined) return cached;
	const found =
		platform() === 'darwin' &&
		(existsSync(join('/Applications', `${name}.app`)) ||
			existsSync(join(homedir(), 'Applications', `${name}.app`)));
	macAppExistsCache.set(name, found);
	return found;
}

function defaultSupportsChat(command: string): boolean {
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

function defaultSpawnDetached(command: string, args: readonly string[], cwd?: string): void {
	spawn(command, args, { stdio: 'ignore', detached: true, cwd }).unref();
}

function defaultCopyPromptToClipboard(prompt: string): void {
	const tool = platform() === 'win32' ? 'clip.exe' : 'pbcopy';
	const child = spawn(tool, [], { stdio: ['pipe', 'ignore', 'ignore'] });
	child.stdin.end(prompt);
}

function defaultOpenExternalUrl(url: string): void {
	if (platform() === 'win32') {
		// `start "" "<url>"` — empty title arg is required when the target is quoted.
		defaultSpawnDetached('cmd.exe', ['/c', 'start', '', url]);
		return;
	}
	defaultSpawnDetached('sh', ['-c', `open ${shellQuote(url)}`]);
}

/** Build a fresh PlatformContext bound to the live OS. */
export function defaultPlatformContext(homeDir: string = homedir()): PlatformContext {
	const probeCache: ProbeCache = createProbeCache();
	return {
		currentPlatform: platform(),
		homeDir,
		commandExists: defaultCommandExists,
		macAppExists: defaultMacAppExists,
		resolveCommand: (command) => which(command),
		pathExists: (path) => existsSync(path),
		supportsChat: defaultSupportsChat,
		hasJsonEntry: (path, rootKey, entryKey) => hasJsonEntry(path, rootKey, entryKey, probeCache),
		copyPromptToClipboard: defaultCopyPromptToClipboard,
		openExternalUrl: defaultOpenExternalUrl,
		spawnDetached: defaultSpawnDetached
	};
}

// ---------------------------------------------------------------------------
// String utilities. Pure; safe to use anywhere.
// ---------------------------------------------------------------------------

export function shellQuote(s: string): string {
	return `'${s.replace(/'/g, "'\\''")}'`;
}

export function osaQuote(s: string): string {
	return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
