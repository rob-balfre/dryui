import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
	autoInstallableEditors,
	formatInstallResult,
	installPreviewLines,
	isAutoInstallable,
	mergeServersConfig,
	readSvelteMcpRegistrations,
	runEditorInstall,
	summarizeSvelteMcpStatus
} from '../commands/setup-installers.js';
import { cleanupTempDirs, createTempTree } from './helpers.js';

afterEach(cleanupTempDirs);

const fakeDegit = (track: string[]) => (target: string) => {
	track.push(target);
	const fs = require('node:fs') as typeof import('node:fs');
	fs.mkdirSync(target, { recursive: true });
	fs.writeFileSync(join(target, 'SKILL.md'), '# fake DryUI skill\n');
	return { ok: true, message: `pulled (fake) into ${target}` };
};

describe('isAutoInstallable', () => {
	test('returns true for the wired editors', () => {
		expect(isAutoInstallable('copilot')).toBe(true);
		expect(isAutoInstallable('cursor')).toBe(true);
		expect(isAutoInstallable('opencode')).toBe(true);
		expect(isAutoInstallable('windsurf')).toBe(true);
		expect(isAutoInstallable('zed')).toBe(true);
	});

	test('returns false for editors that need interactive plugin install', () => {
		expect(isAutoInstallable('claude-code')).toBe(false);
		expect(isAutoInstallable('codex')).toBe(false);
	});

	test('autoInstallableEditors lists exactly the wired set', () => {
		expect([...autoInstallableEditors()].sort()).toEqual([
			'copilot',
			'cursor',
			'opencode',
			'windsurf',
			'zed'
		]);
	});
});

describe('mergeServersConfig', () => {
	test('creates a fresh config file with the default root keys', () => {
		const root = createTempTree({});
		const target = join(root, 'opencode.json');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'mcp',
			servers: { dryui: { type: 'local', command: ['npx', '-y', '@dryui/mcp'] } },
			defaultRoot: { $schema: 'https://opencode.ai/config.json' },
			label: 'Update opencode.json'
		});

		expect(step.status).toBe('created');
		const written = JSON.parse(readFileSync(target, 'utf-8'));
		expect(written).toEqual({
			$schema: 'https://opencode.ai/config.json',
			mcp: { dryui: { type: 'local', command: ['npx', '-y', '@dryui/mcp'] } }
		});
	});

	test('merges into an existing config without dropping unrelated servers', () => {
		const root = createTempTree({
			'.cursor/mcp.json': JSON.stringify(
				{
					mcpServers: {
						existing: { command: 'node', args: ['./other.js'] }
					},
					unrelated: 'keep me'
				},
				null,
				2
			)
		});
		const target = join(root, '.cursor/mcp.json');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'mcpServers',
			servers: { dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] } },
			label: 'Update .cursor/mcp.json'
		});

		expect(step.status).toBe('merged');
		const written = JSON.parse(readFileSync(target, 'utf-8'));
		expect(written).toEqual({
			mcpServers: {
				existing: { command: 'node', args: ['./other.js'] },
				dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
			},
			unrelated: 'keep me'
		});
	});

	test('reports unchanged when re-running on an already-merged file', () => {
		const root = createTempTree({});
		const target = join(root, '.vscode/mcp.json');

		mergeServersConfig({
			path: target,
			containerKey: 'servers',
			servers: { dryui: { type: 'stdio', command: 'npx', args: ['-y', '@dryui/mcp'] } },
			label: 'Update .vscode/mcp.json'
		});

		const second = mergeServersConfig({
			path: target,
			containerKey: 'servers',
			servers: { dryui: { type: 'stdio', command: 'npx', args: ['-y', '@dryui/mcp'] } },
			label: 'Update .vscode/mcp.json'
		});

		expect(second.status).toBe('unchanged');
	});

	test('fails clearly on invalid JSON (e.g. JSONC with comments)', () => {
		const root = createTempTree({
			'settings.json': '{\n  // comment\n  "context_servers": {}\n}'
		});
		const target = join(root, 'settings.json');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'context_servers',
			servers: { dryui: { command: { path: 'npx', args: ['-y', '@dryui/mcp'] } } },
			label: 'Update settings.json'
		});

		expect(step.status).toBe('failed');
		expect(step.detail).toMatch(/invalid JSON/);
		// The original file should not be touched on parse failure.
		expect(readFileSync(target, 'utf-8')).toContain('// comment');
	});

	test('overwrites the dryui entry when its config drifts', () => {
		const root = createTempTree({
			'.cursor/mcp.json': JSON.stringify({ mcpServers: { dryui: { command: 'old' } } })
		});
		const target = join(root, '.cursor/mcp.json');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'mcpServers',
			servers: { dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] } },
			label: 'Update .cursor/mcp.json'
		});

		expect(step.status).toBe('merged');
		const written = JSON.parse(readFileSync(target, 'utf-8'));
		expect(written.mcpServers.dryui).toEqual({ command: 'npx', args: ['-y', '@dryui/mcp'] });
	});
});

describe('runEditorInstall', () => {
	test('copilot writes the skill folder and .vscode/mcp.json', () => {
		const root = createTempTree({});
		const calls: string[] = [];

		const result = runEditorInstall('copilot', {
			cwd: root,
			runDegit: fakeDegit(calls)
		});

		expect(result?.ok).toBe(true);
		expect(calls).toEqual([resolve(root, '.github/skills/dryui')]);
		expect(existsSync(join(root, '.github/skills/dryui/SKILL.md'))).toBe(true);

		const config = JSON.parse(readFileSync(join(root, '.vscode/mcp.json'), 'utf-8'));
		expect(config.servers.dryui).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '@dryui/mcp']
		});
	});

	test('opencode writes the schema header and both MCP servers', () => {
		const root = createTempTree({});
		const calls: string[] = [];

		const result = runEditorInstall('opencode', {
			cwd: root,
			runDegit: fakeDegit(calls)
		});

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf-8'));
		expect(config).toEqual({
			$schema: 'https://opencode.ai/config.json',
			mcp: {
				dryui: { type: 'local', command: ['npx', '-y', '@dryui/mcp'] },
				'dryui-feedback': {
					type: 'local',
					command: ['npx', '-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
				}
			}
		});
	});

	test('windsurf merges into a sandboxed home dir without touching the real one', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const calls: string[] = [];

		const result = runEditorInstall('windsurf', {
			cwd: root,
			homeDir: home,
			runDegit: fakeDegit(calls)
		});

		expect(result?.ok).toBe(true);
		const config = JSON.parse(
			readFileSync(join(home, '.codeium/windsurf/mcp_config.json'), 'utf-8')
		);
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback']);
	});

	test('zed merges only the context_servers block in a sandboxed home', () => {
		const home = createTempTree({
			'.config/zed/settings.json': JSON.stringify({ ui_font_size: 14 })
		});

		const result = runEditorInstall('zed', { cwd: home, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.config/zed/settings.json'), 'utf-8'));
		expect(config.ui_font_size).toBe(14);
		expect(config.context_servers.dryui).toEqual({
			command: { path: 'npx', args: ['-y', '@dryui/mcp'] }
		});
	});

	test('returns null for editors without an installer', () => {
		const root = createTempTree({});
		expect(runEditorInstall('claude-code', { cwd: root })).toBeNull();
		expect(runEditorInstall('codex', { cwd: root })).toBeNull();
	});

	test('reports failure when degit fails and surfaces it in the formatted output', () => {
		const root = createTempTree({});
		const result = runEditorInstall('copilot', {
			cwd: root,
			runDegit: () => ({ ok: false, message: 'network down' })
		});

		expect(result?.ok).toBe(false);
		const text = formatInstallResult(result!);
		expect(text).toContain('Copy DryUI skill: failed');
		expect(text).toContain('network down');
		expect(text).toContain('Some steps failed');
	});
});

describe('formatInstallResult', () => {
	test('renders restart hint on success', () => {
		const root = createTempTree({});
		const result = runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([])
		})!;
		const text = formatInstallResult(result);
		expect(text).toContain('Install:');
		expect(text).toContain('Copy DryUI skill: created');
		expect(text).toContain('Update .cursor/mcp.json: created');
		expect(text).toContain('Restart your editor');
	});
});

describe('Svelte MCP companion', () => {
	test('copilot installer registers @sveltejs/mcp under servers when opted in', () => {
		const root = createTempTree({});
		const result = runEditorInstall('copilot', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.vscode/mcp.json'), 'utf-8'));
		expect(config.servers.svelte).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '@sveltejs/mcp']
		});
	});

	test('cursor installer registers @sveltejs/mcp under mcpServers when opted in', () => {
		const root = createTempTree({});
		const result = runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.cursor/mcp.json'), 'utf-8'));
		expect(config.mcpServers.svelte).toEqual({
			command: 'npx',
			args: ['-y', '@sveltejs/mcp']
		});
	});

	test('opencode installer registers svelte as a third mcp entry when opted in', () => {
		const root = createTempTree({});
		const result = runEditorInstall('opencode', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, 'opencode.json'), 'utf-8'));
		expect(Object.keys(config.mcp).sort()).toEqual(['dryui', 'dryui-feedback', 'svelte']);
		expect(config.mcp.svelte).toEqual({
			type: 'local',
			command: ['npx', '-y', '@sveltejs/mcp']
		});
	});

	test('windsurf installer registers svelte alongside DryUI servers when opted in', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const result = runEditorInstall('windsurf', {
			cwd: root,
			homeDir: home,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(
			readFileSync(join(home, '.codeium/windsurf/mcp_config.json'), 'utf-8')
		);
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback', 'svelte']);
	});

	test('zed installer registers svelte under context_servers when opted in', () => {
		const home = createTempTree({});
		const result = runEditorInstall('zed', {
			cwd: home,
			homeDir: home,
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.config/zed/settings.json'), 'utf-8'));
		expect(config.context_servers.svelte).toEqual({
			command: { path: 'npx', args: ['-y', '@sveltejs/mcp'] }
		});
	});

	test('default (includeSvelteMcp omitted) leaves the svelte server out', () => {
		const root = createTempTree({});
		const result = runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([])
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.cursor/mcp.json'), 'utf-8'));
		expect(Object.keys(config.mcpServers)).toEqual(['dryui']);
	});

	test('preview lines mention the svelte companion when opted in', () => {
		const root = createTempTree({});
		const lines = installPreviewLines('cursor', { cwd: root, includeSvelteMcp: true });
		expect(lines.some((line) => line.includes('+ svelte'))).toBe(true);
	});

	test('readSvelteMcpRegistrations finds servers installed by the installer', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		runEditorInstall('windsurf', {
			cwd: root,
			homeDir: home,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});

		const statuses = readSvelteMcpRegistrations({ cwd: root, homeDir: home });
		const cursor = statuses.find((entry) => entry.editor === 'cursor');
		const windsurf = statuses.find((entry) => entry.editor === 'windsurf');
		const zed = statuses.find((entry) => entry.editor === 'zed');

		expect(cursor?.status).toBe('registered');
		expect(windsurf?.status).toBe('registered');
		expect(zed?.status).toBe('missing');
	});

	test('summarizeSvelteMcpStatus names the editors that have it registered', () => {
		const root = createTempTree({});
		runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		const summary = summarizeSvelteMcpStatus({ cwd: root, homeDir: createTempTree({}) });
		expect(summary).toContain('svelte-mcp');
		expect(summary).toContain('cursor');
	});

	test('summarizeSvelteMcpStatus reports not-registered when absent', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		expect(summarizeSvelteMcpStatus({ cwd: root, homeDir: home })).toBe(
			'svelte-mcp: not registered in any wired editor'
		);
	});
});

describe('writes are atomic per merge', () => {
	test('a failed merge leaves the on-disk file untouched', () => {
		const root = createTempTree({ 'config.json': '{ not json' });
		const target = join(root, 'config.json');
		const before = readFileSync(target, 'utf-8');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'servers',
			servers: { dryui: {} },
			label: 'Update config.json'
		});

		expect(step.status).toBe('failed');
		expect(readFileSync(target, 'utf-8')).toBe(before);
		// Sanity check writing still works once fixed.
		writeFileSync(target, '{}');
		const fixed = mergeServersConfig({
			path: target,
			containerKey: 'servers',
			servers: { dryui: {} },
			label: 'Update config.json'
		});
		expect(fixed.status).toBe('merged');
	});
});
