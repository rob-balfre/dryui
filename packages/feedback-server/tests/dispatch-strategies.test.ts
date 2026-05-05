// Tests for the deepened dispatch shape: agents are data, strategies are
// functions, and a `PlatformContext` is the seam between them. Each test
// drives a strategy with a stub context, never touching the real OS.

import { describe, expect, test } from 'bun:test';
import {
	AGENT_DISPLAY_INFO,
	AGENTS,
	DISPATCH_AGENTS,
	DISPATCH_DOCS_AGENT_IDS
} from '../src/dispatch/agents.ts';
import type { PlatformContext } from '../src/dispatch/platform.ts';
import { probeAgent } from '../src/dispatch/strategies.ts';

interface FakeContextOptions {
	currentPlatform?: NodeJS.Platform;
	homeDir?: string;
	commandsOnPath?: ReadonlySet<string>;
	macAppsInstalled?: ReadonlySet<string>;
	jsonEntries?: ReadonlyMap<string, ReadonlySet<string>>; // path -> "rootKey/entryKey"
	resolvableCommands?: ReadonlyMap<string, string>;
	pathsOnDisk?: ReadonlySet<string>;
	chatSupporters?: ReadonlySet<string>;
	clipboardSink?: { value: string | null };
	openedUrls?: string[];
	spawned?: { command: string; args: readonly string[]; cwd?: string }[];
}

function fakeContext(options: FakeContextOptions = {}): PlatformContext {
	return {
		currentPlatform: options.currentPlatform ?? 'darwin',
		homeDir: options.homeDir ?? '/Users/tester',
		commandExists: (command) => options.commandsOnPath?.has(command) ?? false,
		macAppExists: (name) => options.macAppsInstalled?.has(name) ?? false,
		resolveCommand: (command) => options.resolvableCommands?.get(command) ?? null,
		pathExists: (path) => options.pathsOnDisk?.has(path) ?? false,
		supportsChat: (command) => options.chatSupporters?.has(command) ?? false,
		hasJsonEntry: (path, rootKey, entryKey) =>
			options.jsonEntries?.get(path)?.has(`${rootKey}/${entryKey}`) ?? false,
		copyPromptToClipboard: (prompt) => {
			if (options.clipboardSink) options.clipboardSink.value = prompt;
		},
		openExternalUrl: (url) => {
			options.openedUrls?.push(url);
		},
		spawnDetached: (command, args, cwd) => {
			options.spawned?.push({ command, args, cwd });
		}
	};
}

describe('agent catalogue', () => {
	test('every dispatch agent has exactly one row, keyed by id', () => {
		for (const agent of DISPATCH_AGENTS) {
			expect(AGENTS[agent].id).toBe(agent);
		}
		expect(Object.keys(AGENTS).length).toBe(DISPATCH_AGENTS.length);
	});

	test('every agent claims one of the four launch strategies', () => {
		const strategies = new Set(Object.values(AGENTS).map((agent) => agent.strategy));
		expect(strategies).toEqual(
			new Set(['terminal-cli', 'deeplink', 'workspace-app-cli-chat', 'workspace-app-clipboard'])
		);
	});

	test('display and docs ids are derived from the dispatch catalogue', () => {
		expect(AGENT_DISPLAY_INFO.claude).toEqual({
			id: 'claude',
			label: 'Claude Code',
			shortLabel: 'Claude',
			docsId: 'claude-code'
		});
		expect(AGENT_DISPLAY_INFO['copilot-vscode'].docsId).toBeUndefined();
		expect(DISPATCH_DOCS_AGENT_IDS).toEqual([
			'claude-code',
			'codex',
			'gemini',
			'opencode',
			'copilot',
			'cursor',
			'windsurf',
			'zed'
		]);
	});
});

describe('terminal-cli probe', () => {
	test('passes when the CLI is on PATH', () => {
		const ctx = fakeContext({ commandsOnPath: new Set(['claude']) });
		expect(probeAgent('claude', '/ws', ctx)).toBe(true);
	});

	test('passes when the MCP config carries an entry, even with no CLI', () => {
		const ctx = fakeContext({
			homeDir: '/Users/tester',
			jsonEntries: new Map([
				['/Users/tester/.copilot/mcp-config.json', new Set(['mcpServers/dryui-feedback'])]
			])
		});
		expect(probeAgent('copilot', '/ws', ctx)).toBe(true);
	});

	test('fails when nothing is configured', () => {
		expect(probeAgent('gemini', '/ws', fakeContext())).toBe(false);
	});
});

describe('workspace-app-cli-chat probe', () => {
	test('passes for copilot-vscode when the bundled VS Code CLI supports chat', () => {
		const cliPath = '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code';
		const ctx = fakeContext({
			currentPlatform: 'darwin',
			pathsOnDisk: new Set([cliPath]),
			chatSupporters: new Set([cliPath])
		});
		expect(probeAgent('copilot-vscode', '/ws', ctx)).toBe(true);
	});

	test('passes for windsurf via the workspace-local MCP config', () => {
		const ctx = fakeContext({
			homeDir: '/Users/tester',
			jsonEntries: new Map([
				['/Users/tester/.codeium/windsurf/mcp_config.json', new Set(['mcpServers/dryui-feedback'])]
			])
		});
		expect(probeAgent('windsurf', '/ws', ctx)).toBe(true);
	});
});

describe('workspace-app-clipboard probe', () => {
	test('passes for cursor via mac app', () => {
		const ctx = fakeContext({ macAppsInstalled: new Set(['Cursor']) });
		expect(probeAgent('cursor', '/ws', ctx)).toBe(true);
	});

	test('passes for zed via the workspace-local MCP config', () => {
		const ctx = fakeContext({
			homeDir: '/Users/tester',
			jsonEntries: new Map([
				['/Users/tester/.config/zed/settings.json', new Set(['context_servers/dryui'])]
			])
		});
		expect(probeAgent('zed', '/ws', ctx)).toBe(true);
	});
});

describe('deeplink probe', () => {
	test('passes for codex when the codex CLI is on PATH', () => {
		const ctx = fakeContext({ commandsOnPath: new Set(['codex']) });
		expect(probeAgent('codex', '/ws', ctx)).toBe(true);
	});

	test('passes for codex via the Codex.app bundle on macOS', () => {
		const ctx = fakeContext({ macAppsInstalled: new Set(['Codex']) });
		expect(probeAgent('codex', '/ws', ctx)).toBe(true);
	});
});
