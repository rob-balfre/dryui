import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, spyOn, test } from 'bun:test';
import {
	findProjectFeedbackConfig,
	projectFeedbackPaths,
	readFeedbackServerConfig,
	writeFeedbackServerConfig
} from '../src/config.ts';
import { readFeedbackDispatchDefaults } from '../src/project-config.ts';

describe('project feedback config', () => {
	let projectRoot: string;

	beforeEach(() => {
		projectRoot = mkdtempSync(join(tmpdir(), 'dryui-project-config-'));
	});

	afterEach(() => {
		rmSync(projectRoot, { recursive: true, force: true });
	});

	test('project paths derive from a project root', () => {
		const paths = projectFeedbackPaths(projectRoot);
		expect(paths.root).toBe(resolve(projectRoot));
		expect(paths.dir).toBe(join(resolve(projectRoot), '.dryui', 'feedback'));
		expect(paths.dbPath).toBe(join(paths.dir, 'store.db'));
		expect(paths.screenshotsDir).toBe(join(paths.dir, 'screenshots'));
		expect(paths.configPath).toBe(join(paths.dir, 'server.json'));
	});

	test('round-trips server config for a project root', () => {
		writeFeedbackServerConfig(projectRoot, {
			host: '127.0.0.1',
			port: 4749,
			baseUrl: 'http://127.0.0.1:4749',
			dbPath: join(projectRoot, '.dryui/feedback/store.db'),
			updatedAt: '2026-04-22T00:00:00.000Z'
		});

		const config = readFeedbackServerConfig(projectRoot);
		expect(config).not.toBeNull();
		expect(config?.port).toBe(4749);
		expect(config?.projectRoot).toBe(resolve(projectRoot));
	});

	test('findProjectFeedbackConfig walks up from nested directories', () => {
		writeFeedbackServerConfig(projectRoot, {
			host: '127.0.0.1',
			port: 4748,
			baseUrl: 'http://127.0.0.1:4748',
			dbPath: join(projectRoot, '.dryui/feedback/store.db'),
			updatedAt: '2026-04-22T00:00:00.000Z'
		});

		const nested = join(projectRoot, 'src', 'routes');
		mkdirSync(nested, { recursive: true });

		const found = findProjectFeedbackConfig(nested);
		expect(found).not.toBeNull();
		expect(found?.projectRoot).toBe(resolve(projectRoot));
		expect(found?.config.port).toBe(4748);
	});

	test('writeFeedbackServerConfig surfaces persistence failures on stderr', () => {
		// Plant a regular file where the .dryui/feedback dir would live; mkdirSync
		// then fails with ENOTDIR / EEXIST and the write can't proceed.
		const blocker = join(projectRoot, '.dryui');
		writeFileSync(blocker, 'not a directory', 'utf-8');

		const errorSpy = spyOn(console, 'error').mockImplementation(() => {});
		try {
			writeFeedbackServerConfig(projectRoot, {
				host: '127.0.0.1',
				port: 4751,
				baseUrl: 'http://127.0.0.1:4751',
				dbPath: join(projectRoot, '.dryui/feedback/store.db'),
				updatedAt: '2026-04-22T00:00:00.000Z'
			});

			expect(errorSpy).toHaveBeenCalledTimes(1);
			const message = String(errorSpy.mock.calls[0]?.[0] ?? '');
			expect(message).toContain('[feedback]');
			expect(message).toContain('failed to persist server config');
			expect(message).toContain(projectFeedbackPaths(projectRoot).configPath);
		} finally {
			errorSpy.mockRestore();
		}
	});

	test('findProjectFeedbackConfig tolerates a corrupt config further down the tree', () => {
		const corrupt = join(projectRoot, 'child');
		mkdirSync(join(corrupt, '.dryui', 'feedback'), { recursive: true });
		writeFileSync(join(corrupt, '.dryui', 'feedback', 'server.json'), '{ not json', 'utf-8');

		writeFeedbackServerConfig(projectRoot, {
			host: '127.0.0.1',
			port: 4750,
			baseUrl: 'http://127.0.0.1:4750',
			dbPath: join(projectRoot, '.dryui/feedback/store.db'),
			updatedAt: '2026-04-22T00:00:00.000Z'
		});

		const found = findProjectFeedbackConfig(corrupt);
		expect(found?.projectRoot).toBe(resolve(projectRoot));
		expect(found?.config.port).toBe(4750);
	});

	test('reads feedback dispatch defaults from dryui.config.json', () => {
		writeFileSync(
			join(projectRoot, 'dryui.config.json'),
			JSON.stringify({ feedback: { defaultAgent: 'codex', terminalApp: 'ghostty' } })
		);

		expect(readFeedbackDispatchDefaults(projectRoot)).toEqual({
			defaultAgent: 'codex',
			terminalApp: 'ghostty'
		});
	});

	test('ignores unknown dispatch defaults', () => {
		writeFileSync(
			join(projectRoot, 'dryui.config.json'),
			JSON.stringify({ feedback: { defaultAgent: 'not-real', terminalApp: 'wezterm' } })
		);

		expect(readFeedbackDispatchDefaults(projectRoot)).toEqual({});
	});

	test('returns empty dispatch defaults when the project has no dryui.config.json', () => {
		expect(readFeedbackDispatchDefaults(projectRoot)).toEqual({});
	});

	test('warns and ignores invalid dryui.config.json', () => {
		writeFileSync(join(projectRoot, 'dryui.config.json'), '{ nope');
		const spy = spyOn(console, 'error').mockImplementation(() => {});

		try {
			expect(readFeedbackDispatchDefaults(projectRoot)).toEqual({});
			expect(spy.mock.calls[0]?.[0]).toContain('[feedback] failed to read');
		} finally {
			spy.mockRestore();
		}
	});
});
