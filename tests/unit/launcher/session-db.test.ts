import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'bun:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type SessionDbModule = typeof import('../../../apps/launcher/server/session-db.ts');

let tempHome: string;
let originalHome: string | undefined;
let sessionDb: SessionDbModule;

beforeAll(async () => {
	originalHome = process.env['HOME'];
	tempHome = await mkdtemp(join(tmpdir(), 'dryui-launcher-session-db-'));
	process.env['HOME'] = tempHome;
	sessionDb = await import(
		`../../../apps/launcher/server/session-db.ts?launcher-session-db-test=${Date.now()}`
	);
});

beforeEach(() => {
	const db = sessionDb.getDb();
	db.run('DELETE FROM active_project');
	db.run('DELETE FROM projects');
	db.run('DELETE FROM session');
	db.run('DELETE FROM cli_validations');
});

afterAll(async () => {
	sessionDb.getDb().close();

	if (originalHome === undefined) {
		delete process.env['HOME'];
	} else {
		process.env['HOME'] = originalHome;
	}

	await rm(tempHome, { recursive: true, force: true });
});

describe('launcher session persistence', () => {
	test('does not create a reusable project row while the user is still on the project step', () => {
		sessionDb.upsertSession({
			selected_cli: 'codex',
			project_path: '/tmp/dryui-typing-project',
			current_step: 'project'
		});

		expect(sessionDb.getSessionRow()).toMatchObject({
			selected_cli: 'codex',
			project_path: '/tmp/dryui-typing-project',
			current_step: 'project'
		});
		expect(sessionDb.getAllProjects()).toEqual([]);
	});

	test('creates a reusable project row once the flow advances beyond project selection', () => {
		sessionDb.upsertSession({
			selected_cli: 'codex',
			project_path: '/tmp/dryui-setup-project',
			current_step: 'setup'
		});

		expect(sessionDb.getAllProjects()).toEqual([
			expect.objectContaining({
				project_path: '/tmp/dryui-setup-project',
				selected_cli: 'codex',
				current_step: 'setup'
			})
		]);
	});

	test('only syncs progressed launcher steps into the project list', () => {
		expect(sessionDb.shouldSyncProjectFromSession('cli-selection')).toBe(false);
		expect(sessionDb.shouldSyncProjectFromSession('project')).toBe(false);
		expect(sessionDb.shouldSyncProjectFromSession('terminal')).toBe(true);
		expect(sessionDb.shouldSyncProjectFromSession('setup')).toBe(true);
		expect(sessionDb.shouldSyncProjectFromSession('workspace')).toBe(true);
	});
});
