import { afterEach, describe, expect, test } from 'bun:test';
import {
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	readlinkSync,
	readdirSync,
	writeFileSync
} from 'node:fs';
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

const DRYUI_SKILL_NAMES = [
	'dryui',
	'dryui-feedback',
	'dryui-init',
	'dryui-layout',
	'dryui-layout-polish',
	'dryui-live-feedback'
] as const;

function createLocalSkillsRoot(): string {
	const tree: Record<string, string> = {};
	for (const skill of DRYUI_SKILL_NAMES) {
		tree[`skills/${skill}/SKILL.md`] =
			`---\nname: ${skill}\ndescription: Local ${skill} skill for installer tests.\n---\n\n# ${skill}\n`;
	}
	tree['skills/dryui/agents/openai.yaml'] = 'agents: []\n';
	tree['skills/dryui/rules/theming.md'] = '# theming\n';
	return createTempTree(tree);
}

describe('isAutoInstallable', () => {
	test('returns true for the wired editors', () => {
		expect(isAutoInstallable('copilot')).toBe(true);
		expect(isAutoInstallable('cursor')).toBe(true);
		expect(isAutoInstallable('gemini')).toBe(true);
		expect(isAutoInstallable('opencode')).toBe(true);
		expect(isAutoInstallable('windsurf')).toBe(true);
		expect(isAutoInstallable('zed')).toBe(true);
	});

	test('returns false only for editors that need interactive plugin install', () => {
		// claude-code's plugin install needs a `/plugins` step inside Claude.
		// Codex's plugin install also needs `/plugins` inside Codex, but the
		// MCP-only fallback is auto-installable via TOML edits, so codex is in
		// the wired set with the MCP-only path.
		expect(isAutoInstallable('claude-code')).toBe(false);
		expect(isAutoInstallable('codex')).toBe(true);
	});

	test('autoInstallableEditors lists exactly the wired set', () => {
		expect([...autoInstallableEditors()].sort()).toEqual([
			'codex',
			'copilot',
			'cursor',
			'gemini',
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

	test('reports unchanged for semantically identical server config with different property order', () => {
		const existing = JSON.stringify(
			{
				mcpServers: {
					dryui: { args: ['-y', '@dryui/mcp'], command: 'npx' }
				},
				unrelated: 'keep me'
			},
			null,
			2
		);
		const root = createTempTree({
			'.cursor/mcp.json': existing
		});
		const target = join(root, '.cursor/mcp.json');

		const step = mergeServersConfig({
			path: target,
			containerKey: 'mcpServers',
			servers: { dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] } },
			label: 'Update .cursor/mcp.json'
		});

		expect(step.status).toBe('unchanged');
		expect(readFileSync(target, 'utf-8')).toBe(existing);
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
	test('copilot writes the skill folder and .mcp.json with both DryUI servers', () => {
		const root = createTempTree({});
		const calls: string[] = [];

		const result = runEditorInstall('copilot', {
			cwd: root,
			useNpxSkills: false,
			runDegit: fakeDegit(calls)
		});

		expect(result?.ok).toBe(true);
		expect(calls).toEqual([resolve(root, '.github/skills/dryui')]);
		expect(existsSync(join(root, '.github/skills/dryui/SKILL.md'))).toBe(true);

		const config = JSON.parse(readFileSync(join(root, '.mcp.json'), 'utf-8'));
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback']);
		expect(config.mcpServers.dryui).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '@dryui/mcp']
		});
		expect(config.mcpServers['dryui-feedback']).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
		});
	});

	test('opencode writes the schema header and both MCP servers', () => {
		const root = createTempTree({});
		const calls: string[] = [];

		const result = runEditorInstall('opencode', {
			cwd: root,
			useNpxSkills: false,
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
			useNpxSkills: false,
			runDegit: fakeDegit(calls)
		});

		expect(result?.ok).toBe(true);
		const config = JSON.parse(
			readFileSync(join(home, '.codeium/windsurf/mcp_config.json'), 'utf-8')
		);
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback']);
	});

	test('gemini merges dryui + dryui-feedback into ~/.gemini/settings.json, preserving other keys', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				ui: { theme: 'keep' },
				mcpServers: { context7: { httpUrl: 'https://mcp.context7.com' } }
			})
		});

		const result = runEditorInstall('gemini', { cwd: root, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.gemini/settings.json'), 'utf-8'));
		expect(config.ui).toEqual({ theme: 'keep' });
		expect(Object.keys(config.mcpServers).sort()).toEqual(['context7', 'dryui', 'dryui-feedback']);
		expect(config.mcpServers.dryui).toEqual({
			command: 'npx',
			args: ['-y', '@dryui/mcp']
		});
		expect(config.mcpServers['dryui-feedback']).toEqual({
			command: 'npx',
			args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
		});
	});

	test('gemini creates ~/.gemini/settings.json when the file is missing', () => {
		const root = createTempTree({});
		const home = createTempTree({});

		const result = runEditorInstall('gemini', { cwd: root, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.gemini/settings.json'), 'utf-8'));
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback']);
	});

	test('gemini reports unchanged on a second run against the same settings.json', () => {
		const root = createTempTree({});
		const home = createTempTree({});

		runEditorInstall('gemini', { cwd: root, homeDir: home });
		const second = runEditorInstall('gemini', { cwd: root, homeDir: home })!;

		expect(second.ok).toBe(true);
		expect(second.steps.every((step) => step.status === 'unchanged')).toBe(true);
	});

	test('gemini fills in a missing dryui-feedback server while preserving a partial config', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					context7: { httpUrl: 'https://mcp.context7.com' }
				}
			})
		});

		const result = runEditorInstall('gemini', { cwd: root, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.gemini/settings.json'), 'utf-8'));
		expect(Object.keys(config.mcpServers).sort()).toEqual(['context7', 'dryui', 'dryui-feedback']);
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
	});

	test('codex installer writes dryui + dryui-feedback MCP servers to ~/.codex/config.toml', () => {
		const home = createTempTree({});
		const result = runEditorInstall('codex', { cwd: home, homeDir: home });

		expect(result?.ok).toBe(true);
		const config = readFileSync(join(home, '.codex/config.toml'), 'utf-8');
		expect(config).toContain('[mcp_servers.dryui]');
		expect(config).toContain('[mcp_servers."dryui-feedback"]');
		// Svelte MCP is opt-in via includeSvelteMcp; off by default in this test.
		expect(config).not.toContain('[mcp_servers.svelte]');
	});

	test('codex installer adds the svelte MCP block when includeSvelteMcp is true', () => {
		const home = createTempTree({});
		const result = runEditorInstall('codex', {
			cwd: home,
			homeDir: home,
			includeSvelteMcp: true
		});

		expect(result?.ok).toBe(true);
		const config = readFileSync(join(home, '.codex/config.toml'), 'utf-8');
		expect(config).toContain('[mcp_servers.dryui]');
		expect(config).toContain('[mcp_servers."dryui-feedback"]');
		expect(config).toContain('[mcp_servers.svelte]');
	});

	test('codex installer is idempotent on second run', () => {
		const home = createTempTree({});
		runEditorInstall('codex', { cwd: home, homeDir: home, includeSvelteMcp: true });
		const first = readFileSync(join(home, '.codex/config.toml'), 'utf-8');
		const result = runEditorInstall('codex', { cwd: home, homeDir: home, includeSvelteMcp: true });

		expect(result?.ok).toBe(true);
		expect(result?.steps.every((step) => step.status === 'unchanged')).toBe(true);
		expect(readFileSync(join(home, '.codex/config.toml'), 'utf-8')).toBe(first);
	});

	test('codex dev installer links local skills and writes local MCP servers', () => {
		const root = createLocalSkillsRoot();
		const home = createTempTree({});
		const result = runEditorInstall('codex', {
			cwd: root,
			homeDir: home,
			dryuiDevMode: true,
			localSkillsRoot: join(root, 'skills'),
			includeSvelteMcp: true
		});

		expect(result?.ok).toBe(true);
		for (const skill of DRYUI_SKILL_NAMES) {
			const target = join(home, '.agents/skills', skill);
			expect(lstatSync(target).isSymbolicLink()).toBe(true);
			expect(resolve(join(home, '.agents/skills'), readlinkSync(target))).toBe(
				join(root, 'skills', skill)
			);
		}

		const config = readFileSync(join(home, '.codex/config.toml'), 'utf-8');
		expect(config).toContain('[mcp_servers.dryui]');
		expect(config).toContain('command = "env"');
		expect(config).toContain('args = ["DRYUI_DEV=1", "dryui-mcp"]');
		expect(config).toContain('[mcp_servers."dryui-feedback"]');
		expect(config).toContain('args = ["DRYUI_DEV=1", "dryui-feedback-mcp"]');
		expect(config).toContain('[mcp_servers.svelte]');
	});

	test('codex dev installer replaces existing published MCP sections', () => {
		const root = createLocalSkillsRoot();
		const home = createTempTree({
			'.codex/config.toml': `[mcp_servers.dryui]
command = "npx"
args = ["-y", "@dryui/mcp"]

[mcp_servers."dryui-feedback"]
command = "npx"
args = ["-y", "-p", "@dryui/feedback-server", "dryui-feedback-mcp"]
`
		});

		const result = runEditorInstall('codex', {
			cwd: root,
			homeDir: home,
			dryuiDevMode: true,
			localSkillsRoot: join(root, 'skills')
		});

		expect(result?.ok).toBe(true);
		const config = readFileSync(join(home, '.codex/config.toml'), 'utf-8');
		expect(config).toContain('args = ["DRYUI_DEV=1", "dryui-mcp"]');
		expect(config).toContain('args = ["DRYUI_DEV=1", "dryui-feedback-mcp"]');
		expect(config).not.toContain('@dryui/mcp');
		expect(config).not.toContain('@dryui/feedback-server');
	});

	test('cursor dev installer links local skills and backs up existing copies', () => {
		const root = createLocalSkillsRoot();
		mkdirSync(join(root, '.agents/skills/dryui'), { recursive: true });
		writeFileSync(join(root, '.agents/skills/dryui/SKILL.md'), '# old copy\n');

		const result = runEditorInstall('cursor', {
			cwd: root,
			dryuiDevMode: true,
			localSkillsRoot: join(root, 'skills'),
			runNpxSkills: () => {
				throw new Error('npx skills should not run in DRYUI_DEV');
			}
		});

		expect(result?.ok).toBe(true);
		for (const skill of DRYUI_SKILL_NAMES) {
			expect(lstatSync(join(root, '.agents/skills', skill)).isSymbolicLink()).toBe(true);
		}
		expect(
			readdirSync(join(root, '.agents/skills')).some((name) => name.startsWith('dryui.bak.'))
		).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.cursor/mcp.json'), 'utf-8'));
		expect(config.mcpServers.dryui).toEqual({
			command: 'env',
			args: ['DRYUI_DEV=1', 'dryui-mcp']
		});
	});

	test('reports failure when degit fails and surfaces it in the formatted output', () => {
		const root = createTempTree({});
		const result = runEditorInstall('copilot', {
			cwd: root,
			useNpxSkills: false,
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
			useNpxSkills: false,
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
	test('copilot installer registers @sveltejs/mcp under mcpServers when opted in', () => {
		const root = createTempTree({});
		const result = runEditorInstall('copilot', {
			cwd: root,
			useNpxSkills: false,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(root, '.mcp.json'), 'utf-8'));
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback', 'svelte']);
		expect(config.mcpServers.svelte).toEqual({
			type: 'stdio',
			command: 'npx',
			args: ['-y', '@sveltejs/mcp']
		});
	});

	test('cursor installer registers @sveltejs/mcp under mcpServers when opted in', () => {
		const root = createTempTree({});
		const result = runEditorInstall('cursor', {
			cwd: root,
			useNpxSkills: false,
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
			useNpxSkills: false,
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
			useNpxSkills: false,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(
			readFileSync(join(home, '.codeium/windsurf/mcp_config.json'), 'utf-8')
		);
		expect(Object.keys(config.mcpServers).sort()).toEqual(['dryui', 'dryui-feedback', 'svelte']);
	});

	test('gemini installer registers svelte alongside DryUI servers when opted in', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const result = runEditorInstall('gemini', {
			cwd: root,
			homeDir: home,
			includeSvelteMcp: true
		});
		expect(result?.ok).toBe(true);
		const config = JSON.parse(readFileSync(join(home, '.gemini/settings.json'), 'utf-8'));
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
			useNpxSkills: false,
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

	test('preview lines mention local links in dev mode', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const lines = installPreviewLines('codex', {
			cwd: root,
			homeDir: home,
			dryuiDevMode: true,
			includeSvelteMcp: true
		});

		expect(lines.some((line) => line.includes('Link DryUI skills'))).toBe(true);
		expect(lines.some((line) => line.includes('local dryui + dryui-feedback + svelte'))).toBe(true);
		expect(lines.some((line) => line.includes('/plugins'))).toBe(false);
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
			useNpxSkills: false,
			runDegit: fakeDegit([]),
			includeSvelteMcp: true
		});
		runEditorInstall('windsurf', {
			cwd: root,
			homeDir: home,
			useNpxSkills: false,
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
			useNpxSkills: false,
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
			feedback: false,
			svelte: true,
			source: 'plugin'
		});
		expect(statuses.find((entry) => entry.editor === 'codex')).toEqual({
			editor: 'codex',
			dryui: true,
			feedback: false,
			svelte: true,
			source: 'plugin'
		});
		expect(statuses.find((entry) => entry.editor === 'gemini')).toEqual({
			editor: 'gemini',
			dryui: true,
			feedback: false,
			svelte: false,
			source: 'mcp'
		});
		expect(statuses.find((entry) => entry.editor === 'copilot')).toEqual({
			editor: 'copilot',
			dryui: true,
			feedback: false,
			svelte: true,
			source: 'mcp'
		});

		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe(
			'agents: claude [plugin (no feedback) + svelte], codex [plugin (no feedback) + svelte], gemini [mcp (no feedback)], copilot [mcp (no feedback) + svelte]'
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

		// `.mcp.json` is shared: Claude Code reads it, and so does Copilot CLI (since the
		// Copilot CLI v1.x migration away from .vscode/mcp.json). Both tools should
		// report configured when the file is present.
		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe(
			'agents: claude [plugin + mcp (no feedback) + svelte], copilot [mcp (no feedback)]'
		);
	});

	test('reports no wired agents when nothing is configured', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe('agents: none wired yet');
	});

	test('copilot probe picks up the Copilot CLI user-level mcp-config.json', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.copilot/mcp-config.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					'dryui-feedback': {
						command: 'npx',
						args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
					}
				}
			})
		});

		const status = getAgentSetupStatus('copilot', { cwd: root, homeDir: home });
		expect(status.dryui).toBe(true);
		expect(status.feedback).toBe(true);
		expect(status.source).toBe('mcp');
	});

	test('copilot probe still honours legacy .vscode/mcp.json with the servers key', () => {
		const root = createTempTree({
			'.vscode/mcp.json': JSON.stringify({
				servers: {
					dryui: { type: 'stdio', command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});
		const home = createTempTree({});

		const status = getAgentSetupStatus('copilot', { cwd: root, homeDir: home });
		expect(status.dryui).toBe(true);
		expect(status.feedback).toBe(false);
		expect(status.source).toBe('mcp');
	});

	test('drops the (no feedback) annotation once dryui-feedback is present', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					'dryui-feedback': {
						command: 'npx',
						args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
					}
				}
			})
		});

		expect(summarizeAgentSetupStatus({ cwd: root, homeDir: home })).toBe('agents: gemini [mcp]');
	});
});

describe('gemini probe', () => {
	test('detects an installed extension via ~/.gemini/extensions/<name>/gemini-extension.json', () => {
		const home = createTempTree({});
		const extDir = join(home, '.gemini/extensions/dryui');
		mkdirSync(extDir, { recursive: true });
		writeFileSync(
			join(extDir, 'gemini-extension.json'),
			JSON.stringify({
				name: 'dryui',
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					'dryui-feedback': {
						command: 'npx',
						args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
					}
				}
			})
		);

		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.dryui).toBe(true);
		expect(status.feedback).toBe(true);
		expect(status.source).toBe('plugin');
	});

	test('detects an extension whose folder name differs from the extension name', () => {
		const home = createTempTree({});
		const extDir = join(home, '.gemini/extensions/my-custom-folder');
		mkdirSync(extDir, { recursive: true });
		writeFileSync(
			join(extDir, 'gemini-extension.json'),
			JSON.stringify({
				name: 'dryui',
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		);

		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.source).toBe('plugin');
	});

	test('flags an incomplete MCP config (dryui present, dryui-feedback missing)', () => {
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});

		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.dryui).toBe(true);
		expect(status.feedback).toBe(false);
		expect(status.source).toBe('mcp');
	});

	test('reports both servers wired when dryui and dryui-feedback are in settings.json', () => {
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					'dryui-feedback': {
						command: 'npx',
						args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
					}
				}
			})
		});

		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.dryui).toBe(true);
		expect(status.feedback).toBe(true);
		expect(status.source).toBe('mcp');
	});

	test('reports mixed source when both extension and settings.json entries are present', () => {
		const home = createTempTree({
			'.gemini/settings.json': JSON.stringify({
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] }
				}
			})
		});
		const extDir = join(home, '.gemini/extensions/dryui');
		mkdirSync(extDir, { recursive: true });
		writeFileSync(
			join(extDir, 'gemini-extension.json'),
			JSON.stringify({
				name: 'dryui',
				mcpServers: {
					dryui: { command: 'npx', args: ['-y', '@dryui/mcp'] },
					'dryui-feedback': {
						command: 'npx',
						args: ['-y', '-p', '@dryui/feedback-server', 'dryui-feedback-mcp']
					}
				}
			})
		);

		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.source).toBe('mixed');
		expect(status.feedback).toBe(true);
	});

	test('reports none when neither the extension nor a settings.json entry exists', () => {
		const home = createTempTree({});
		const status = getAgentSetupStatus('gemini', { cwd: home, homeDir: home });
		expect(status.dryui).toBe(false);
		expect(status.feedback).toBe(false);
		expect(status.source).toBe('none');
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

describe('npx skills install path (DRYUI_SKILLS_VIA_NPX gate)', () => {
	type NpxCall = { agent: string; cwd: string };

	const fakeNpxSkills =
		(track: NpxCall[], outcome: { ok: boolean; message: string } = { ok: true, message: 'ok' }) =>
		(agent: string, ctx: { cwd: string }) => {
			track.push({ agent, cwd: ctx.cwd });
			return outcome;
		};

	test('copilot uses npx skills with --agent github-copilot when gated on', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];
		const degitCalls: string[] = [];

		const result = runEditorInstall('copilot', {
			cwd: root,
			useNpxSkills: true,
			runDegit: fakeDegit(degitCalls),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(result?.ok).toBe(true);
		expect(npxCalls).toEqual([{ agent: 'github-copilot', cwd: root }]);
		expect(degitCalls).toEqual([]);
	});

	test('cursor uses npx skills with --agent cursor when gated on', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];

		runEditorInstall('cursor', {
			cwd: root,
			useNpxSkills: true,
			runDegit: fakeDegit([]),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([{ agent: 'cursor', cwd: root }]);
	});

	test('opencode uses npx skills with --agent opencode when gated on', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];

		runEditorInstall('opencode', {
			cwd: root,
			useNpxSkills: true,
			runDegit: fakeDegit([]),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([{ agent: 'opencode', cwd: root }]);
	});

	test('windsurf uses npx skills with --agent windsurf when gated on', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const npxCalls: NpxCall[] = [];

		runEditorInstall('windsurf', {
			cwd: root,
			homeDir: home,
			useNpxSkills: true,
			runDegit: fakeDegit([]),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([{ agent: 'windsurf', cwd: root }]);
	});

	test('falls back to legacy degit when npx skills returns ok:false', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];
		const degitCalls: string[] = [];

		const result = runEditorInstall('copilot', {
			cwd: root,
			useNpxSkills: true,
			runDegit: fakeDegit(degitCalls),
			runNpxSkills: fakeNpxSkills(npxCalls, { ok: false, message: 'offline' })
		});

		expect(result?.ok).toBe(true);
		expect(npxCalls).toEqual([{ agent: 'github-copilot', cwd: root }]);
		expect(degitCalls).toEqual([resolve(root, '.github/skills/dryui')]);
	});

	test('default behavior (useNpxSkills omitted, env unset) routes through npx skills (Phase 5 flip)', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];
		const degitCalls: string[] = [];

		runEditorInstall('cursor', {
			cwd: root,
			runDegit: fakeDegit(degitCalls),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([{ agent: 'cursor', cwd: root }]);
		expect(degitCalls).toEqual([]);
	});

	test('useNpxSkills:false explicit override keeps the legacy degit path (escape hatch)', () => {
		const root = createTempTree({});
		const npxCalls: NpxCall[] = [];
		const degitCalls: string[] = [];

		runEditorInstall('cursor', {
			cwd: root,
			useNpxSkills: false,
			runDegit: fakeDegit(degitCalls),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([]);
		expect(degitCalls).toEqual([resolve(root, '.agents/skills/dryui')]);
	});

	test('zed never reaches the npx skills path even when gated on (not in upstream agent list)', () => {
		const root = createTempTree({});
		const home = createTempTree({});
		const npxCalls: NpxCall[] = [];
		const degitCalls: string[] = [];

		// Zed installer doesn't write any skill folder today (MCP-only); the
		// real assertion is that we don't accidentally invoke npx skills with
		// an unsupported --agent value.
		runEditorInstall('zed', {
			cwd: root,
			homeDir: home,
			useNpxSkills: true,
			runDegit: fakeDegit(degitCalls),
			runNpxSkills: fakeNpxSkills(npxCalls)
		});

		expect(npxCalls).toEqual([]);
		expect(degitCalls).toEqual([]);
	});
});
