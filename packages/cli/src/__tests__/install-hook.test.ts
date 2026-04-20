import { afterEach, describe, expect, test } from 'bun:test';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { getInstallHookResult, getInstallHookStatus } from '../commands/install-hook.js';
import { cleanupTempDirs, createTempTree, withCwd } from './helpers.js';

afterEach(cleanupTempDirs);

describe('install-hook status', () => {
	test('detects a project-scoped dryui SessionStart hook', () => {
		const root = createTempTree({
			'.claude/settings.json': JSON.stringify({
				hooks: {
					SessionStart: [{ hooks: [{ type: 'command', command: 'dryui ambient' }] }]
				}
			})
		});

		expect(getInstallHookStatus({ cwd: root, homeDir: root })).toEqual({
			project: true,
			projectPath: join(root, '.claude/settings.json'),
			global: true,
			globalPath: join(root, '.claude/settings.json')
		});
	});

	test('detects a global hook without requiring a project hook', () => {
		const root = createTempTree({});
		const home = createTempTree({
			'.claude/settings.json': JSON.stringify({
				hooks: {
					SessionStart: [{ hooks: [{ type: 'command', command: 'dryui ambient' }] }]
				}
			})
		});

		const status = getInstallHookStatus({ cwd: root, homeDir: home });
		expect(status.project).toBe(false);
		expect(status.global).toBe(true);
		expect(status.projectPath).toBe(join(root, '.claude/settings.json'));
		expect(status.globalPath).toBe(join(home, '.claude/settings.json'));
	});

	test('returns false when no dryui hook is present or settings are invalid', () => {
		const root = createTempTree({
			'.claude/settings.json': '{ invalid json'
		});
		const home = createTempTree({
			'.claude/settings.json': JSON.stringify({
				hooks: {
					SessionStart: [{ hooks: [{ type: 'command', command: 'echo nope' }] }]
				}
			})
		});

		const status = getInstallHookStatus({ cwd: root, homeDir: home });
		expect(status.project).toBe(false);
		expect(status.global).toBe(false);

		writeFileSync(
			join(root, '.claude/settings.json'),
			JSON.stringify({
				hooks: {
					SessionStart: [{ hooks: [{ type: 'command', command: 'bun run dryui ambient' }] }]
				}
			})
		);
		expect(getInstallHookStatus({ cwd: root, homeDir: home }).project).toBe(true);
	});
});

describe('install-hook result', () => {
	test('shows a dry-run preview for a new project settings file', () => {
		const root = createTempTree({});

		const result = withCwd(root, () => getInstallHookResult(['--dry-run'], 'text'));

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('install-hook: dry-run | scope: project');
		expect(result.output).toContain('action: create');
		expect(result.output).toContain('"command": "dryui ambient"');
	});

	test('writes the merged settings file for project scope', () => {
		const root = createTempTree({
			'.claude/settings.json': JSON.stringify({
				hooks: {
					SessionStart: [{ matcher: 'docs/**', hooks: [{ type: 'command', command: 'echo docs' }] }]
				}
			})
		});

		const result = withCwd(root, () => getInstallHookResult([], 'text'));
		const written = JSON.parse(readFileSync(join(root, '.claude/settings.json'), 'utf8'));

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('install-hook: merged | scope: project');
		expect(written.hooks.SessionStart).toHaveLength(2);
		expect(written.hooks.SessionStart[1]).toEqual({
			hooks: [{ type: 'command', command: 'dryui ambient' }]
		});
	});

	test('reports when the hook is already wired', () => {
		const root = createTempTree({
			'.claude/settings.json': JSON.stringify({
				hooks: {
					SessionStart: [{ hooks: [{ type: 'command', command: 'dryui ambient' }] }]
				}
			})
		});

		const result = withCwd(root, () => getInstallHookResult([], 'text'));

		expect(result.exitCode).toBe(0);
		expect(result.error).toBeNull();
		expect(result.output).toContain('install-hook: already-wired | scope: project');
		expect(result.output).toContain('dryui ambient');
	});

	test('returns an invalid-settings error when settings.json is malformed', () => {
		const root = createTempTree({
			'.claude/settings.json': '{ invalid json'
		});

		const result = withCwd(root, () => getInstallHookResult([], 'text'));

		expect(result.exitCode).toBe(1);
		expect(result.output).toBe('');
		expect(result.error).toContain('Unable to parse');
		expect(result.error).toContain('.claude/settings.json');
	});
});
