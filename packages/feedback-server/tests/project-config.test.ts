import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import {
	findProjectFeedbackConfig,
	projectFeedbackPaths,
	readFeedbackServerConfig,
	writeFeedbackServerConfig
} from '../src/config.ts';

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
});
