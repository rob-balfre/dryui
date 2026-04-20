import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import {
	autoInstallableEditors,
	formatInstallResult,
	getAgentSetupStatus,
	installPreviewLines,
	isAutoInstallable,
	mergeServersConfig,
	mergeTomlSection,
	readAgentSetupStatuses,
	readSvelteMcpRegistrations,
	runEditorInstall,
	runSvelteCompanionInstall,
	svelteCompanionPreviewLines,
	summarizeAgentSetupStatus,
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
		expect(isAutoInstallable('gemini')).toBe(false);
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
		expect(runEditorInstall('gemini', { cwd: root })).toBeNull();
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

	test('companion preview lines describe the standalone install path', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		expect(svelteCompanionPreviewLines('claude-code', { cwd: root, homeDir: home })).toEqual([
			'• Install the official `svelte@svelte` Claude plugin if it is missing',
			'• Falls back to the existing plugin state when already present'
		]);
	});

	test('mergeTomlSection appends a new block once and then becomes unchanged', () => {
		const home = createTempTree({
			'.codex/config.toml': `[mcp_servers.dryui]
command = "npx"
args = ["-y", "@dryui/mcp"]
`
		});
		const target = join(home, '.codex/config.toml');

		const first = mergeTomlSection({
			path: target,
			section: 'mcp_servers.svelte',
			block: `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]`,
			label: 'Update ~/.codex/config.toml'
		});
		const second = mergeTomlSection({
			path: target,
			section: 'mcp_servers.svelte',
			block: `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]`,
			label: 'Update ~/.codex/config.toml'
		});

		expect(first.status).toBe('merged');
		expect(readFileSync(target, 'utf-8')).toContain('[mcp_servers.svelte]');
		expect(second.status).toBe('unchanged');
	});

	test('runSvelteCompanionInstall enables the Claude plugin when already installed but disabled', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.claude/settings.json': JSON.stringify({
				enabledPlugins: {
					'svelte@svelte': false
				}
			}),
			'.claude/plugins/installed_plugins.json': JSON.stringify({
				plugins: {
					'svelte@svelte': [{ installPath: '/tmp/svelte-plugin' }]
				}
			})
		});
		const calls: Array<{ command: string; args: readonly string[] }> = [];

		const result = runSvelteCompanionInstall('claude-code', {
			cwd: root,
			homeDir: home,
			runProcess: (command, args) => {
				calls.push({ command, args });
				return { ok: true, message: `${command} ${args.join(' ')}` };
			}
		});

		expect(result?.ok).toBe(true);
		expect(calls).toEqual([
			{
				command: 'claude',
				args: ['plugin', 'enable', 'svelte@svelte']
			}
		]);
	});

	test('runSvelteCompanionInstall installs the Claude plugin when missing', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.claude/settings.json': JSON.stringify({ enabledPlugins: {} }),
			'.claude/plugins/installed_plugins.json': JSON.stringify({ plugins: {} })
		});
		const calls: Array<{ command: string; args: readonly string[] }> = [];

		const result = runSvelteCompanionInstall('claude-code', {
			cwd: root,
			homeDir: home,
			runProcess: (command, args) => {
				calls.push({ command, args });
				return { ok: true, message: `${command} ${args.join(' ')}` };
			}
		});

		expect(result?.ok).toBe(true);
		expect(calls).toEqual([
			{
				command: 'claude',
				args: ['plugin', 'marketplace', 'add', 'sveltejs/ai-tools']
			},
			{
				command: 'claude',
				args: ['plugin', 'install', 'svelte@svelte']
			}
		]);
	});

	test('runSvelteCompanionInstall appends the codex config block', () => {
		const root = createTempTree({});
		const home = createTempTree({});

		const result = runSvelteCompanionInstall('codex', { cwd: root, homeDir: home });

		expect(result?.ok).toBe(true);
		expect(readFileSync(join(home, '.codex/config.toml'), 'utf-8')).toContain(
			'[mcp_servers.svelte]'
		);
	});

	test('runSvelteCompanionInstall merges the gemini config', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				},
				theme: 'keep-me'
			})
		});

		const result = runSvelteCompanionInstall('gemini', { cwd: root, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.gemini/settings.json'), 'utf-8'));
		expect(config.theme).toBe('keep-me');
		expect(config.mcpServers.svelte).toEqual({
			command: 'npx',
			args: ['-y', '@sveltejs/mcp']
		});
	});

	test('runSvelteCompanionInstall can wire cursor without re-running the full install', () => {
		const root = createTempTree({
			'.cursor/mcp.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});

		const result = runSvelteCompanionInstall('cursor', { cwd: root });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.cursor/mcp.json'), 'utf-8'));
		expect(config.mcpServers.dryui).toEqual({
			command: 'npx',
			args: ['-y', '@dryui/mcp']
		});
		expect(config.mcpServers.svelte).toEqual({
			command: 'npx',
			args: ['-y', '@sveltejs/mcp']
		});
	});

	test('getAgentSetupStatus reflects the companion after a standalone install', () => {
		const root = createTempTree({
			'.cursor/mcp.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});

		expect(getAgentSetupStatus('cursor', { cwd: root }).svelte).toBe(false);
		runSvelteCompanionInstall('cursor', { cwd: root });
		expect(getAgentSetupStatus('cursor', { cwd: root }).svelte).toBe(true);
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

	test('readSvelteMcpRegistrations includes codex and gemini companion setup', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.codex/config.toml': `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
`,
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					svelte: { command: 'npx', args: ['-y', '@sveltejs/mcp'] }
				}
			})
		});

		const statuses = readSvelteMcpRegistrations({ cwd: root, homeDir: home });
		expect(statuses.find((entry) => entry.editor === 'codex')?.status).toBe('registered');
		expect(statuses.find((entry) => entry.editor === 'gemini')?.status).toBe('registered');
	});

	test('readSvelteMcpRegistrations counts a claude plugin that bundles svelte', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const installPath = join(home, '.claude/plugins/cache/dryui/dryui/0.2.0');
		mkdirSync(join(installPath, '.claude-plugin'), { recursive: true });
		writeFileSync(
			join(home, '.claude/settings.json'),
			JSON.stringify({
				enabledPlugins: {
					'dryui@dryui': true
				}
			})
		);
		writeFileSync(
			join(home, '.claude/plugins/installed_plugins.json'),
			JSON.stringify({
				plugins: {
					'dryui@dryui': [{ installPath }]
				}
			})
		);
		writeFileSync(
			join(installPath, '.claude-plugin/plugin.json'),
			JSON.stringify({
				mcpServers: './.mcp.json'
			})
		);
		writeFileSync(
			join(installPath, '.mcp.json'),
			JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx' },
					svelte: { command: 'npx' }
				}
			})
		);

		const statuses = readSvelteMcpRegistrations({ cwd: root, homeDir: home });
		expect(statuses.find((entry) => entry.editor === 'claude-code')?.status).toBe('registered');
	});

	test('readSvelteMcpRegistrations counts the standalone claude svelte plugin', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const installPath = join(home, '.claude/plugins/cache/svelte/svelte/1.0.4');
		mkdirSync(join(installPath, '.claude-plugin'), { recursive: true });
		writeFileSync(
			join(home, '.claude/settings.json'),
			JSON.stringify({
				enabledPlugins: {
					'svelte@svelte': true
				}
			})
		);
		writeFileSync(
			join(home, '.claude/plugins/installed_plugins.json'),
			JSON.stringify({
				plugins: {
					'svelte@svelte': [{ installPath }]
				}
			})
		);
		writeFileSync(
			join(installPath, '.claude-plugin/plugin.json'),
			JSON.stringify({
				mcpServers: './.mcp.json'
			})
		);
		writeFileSync(
			join(installPath, '.mcp.json'),
			JSON.stringify({
				mcpServers: {
					svelte: { type: 'http', url: 'https://mcp.svelte.dev/mcp' }
				}
			})
		);

		const statuses = readSvelteMcpRegistrations({ cwd: root, homeDir: home });
		expect(statuses.find((entry) => entry.editor === 'claude-code')?.status).toBe('registered');
	});

	test('summarizeSvelteMcpStatus names the editors that have it registered', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.codex/config.toml': `[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
`
		});
		runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		const summary = summarizeSvelteMcpStatus({ cwd: root, homeDir: home });
		expect(summary).toContain('svelte-mcp');
		expect(summary).toContain('cursor');
		expect(summary).toContain('codex');
	});

	test('summarizeSvelteMcpStatus reports not-registered when absent', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		expect(summarizeSvelteMcpStatus({ cwd: root, homeDir: home })).toBe(
			'svelte-mcp: not registered in any wired editor'
		);
	});
});

describe('agent setup summary', () => {
	test('lists configured agents and annotates svelte when present', () => {
		const root = createTempTree({
			'.vscode/mcp.json': JSON.stringify({
				servers: {
					dryui: { command: 'npx' },
					svelte: { command: 'npx' }
				}
			})
		});
		const home = createTempTree({
			'.codex/config.toml': `[plugins."dryui@dryui"]
enabled = true

[mcp_servers.svelte]
command = "npx"
args = ["-y", "@sveltejs/mcp"]
`,
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});
		const installPath = join(home, '.claude/plugins/cache/dryui/dryui/0.2.0');
		mkdirSync(join(installPath, '.claude-plugin'), { recursive: true });
		writeFileSync(
			join(home, '.claude/settings.json'),
			JSON.stringify({
				enabledPlugins: {
					'dryui@dryui': true
				}
			})
		);
		writeFileSync(
			join(home, '.claude/plugins/installed_plugins.json'),
			JSON.stringify({
				plugins: {
					'dryui@dryui': [{ installPath }]
				}
			})
		);
		writeFileSync(
			join(installPath, '.claude-plugin/plugin.json'),
			JSON.stringify({
				mcpServers: './.mcp.json'
			})
		);
		writeFileSync(
			join(installPath, '.mcp.json'),
			JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx' },
					svelte: { command: 'npx' }
				}
			})
		);

		const statuses = readAgentSetupStatuses({ cwd: root, homeDir: home });
		expect(statuses.find((entry) => entry.editor === 'claude-code')).toEqual({
			editor: 'claude-code',
			dryui: true,
			svelte: true,
			source: 'plugin'
		});
		expect(statuses.find((entry) => entry.editor === 'codex')).toEqual({
			editor: 'codex',
			dryui: true,
			svelte: true,
			source: 'plugin'
		});
		expect(statuses.find((entry) => entry.editor === 'gemini')).toEqual({
			editor: 'gemini',
			dryui: true,
			svelte: false,
			source: 'mcp'
		});
		expect(statuses.find((entry) => entry.editor === 'copilot')).toEqual({
			editor: 'copilot',
			dryui: true,
			svelte: true,
			source: 'mcp'
		});

		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe(
			'agents: claude [plugin + svelte], codex [plugin + svelte], gemini [mcp], copilot [mcp + svelte]'
		);
	});

	test('counts claude project .mcp.json alongside plugin wiring', () => {
		const root = createTempTree({
			'.mcp.json': JSON.stringify({
				mcpServers: {
					dryui: { type: 'stdio', command: 'bun', args: ['run', 'packages/mcp/dist/index.js'] }
				}
			})
		});
		const home = createTempTree({});
		const dryuiInstallPath = join(home, '.claude/plugins/cache/dryui/dryui/0.2.0');
		const svelteInstallPath = join(home, '.claude/plugins/cache/svelte/svelte/1.0.4');
		mkdirSync(join(dryuiInstallPath, '.claude-plugin'), { recursive: true });
		mkdirSync(join(svelteInstallPath, '.claude-plugin'), { recursive: true });
		writeFileSync(
			join(home, '.claude/settings.json'),
			JSON.stringify({
				enabledPlugins: {
					'dryui@dryui': true,
					'svelte@svelte': true
				}
			})
		);
		writeFileSync(
			join(home, '.claude/plugins/installed_plugins.json'),
			JSON.stringify({
				plugins: {
					'dryui@dryui': [{ installPath: dryuiInstallPath }],
					'svelte@svelte': [{ installPath: svelteInstallPath }]
				}
			})
		);
		writeFileSync(
			join(dryuiInstallPath, '.claude-plugin/plugin.json'),
			JSON.stringify({ mcpServers: './.mcp.json' })
		);
		writeFileSync(
			join(dryuiInstallPath, '.mcp.json'),
			JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx' }
				}
			})
		);
		writeFileSync(
			join(svelteInstallPath, '.claude-plugin/plugin.json'),
			JSON.stringify({ mcpServers: './.mcp.json' })
		);
		writeFileSync(
			join(svelteInstallPath, '.mcp.json'),
			JSON.stringify({
				mcpServers: {
					svelte: { type: 'http', url: 'https://mcp.svelte.dev/mcp' }
				}
			})
		);

		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe(
			'agents: claude [plugin + mcp + svelte]'
		);
	});

	test('reports no wired agents when nothing is configured', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe('agents: none wired yet');
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
