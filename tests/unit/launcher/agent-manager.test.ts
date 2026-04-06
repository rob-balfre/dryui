import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { AgentManager } from '../../../apps/launcher/server/agent-manager.ts';
import {
	getAgentSession,
	getAnnotation,
	initAnnotationDb,
	insertAgentSession,
	insertAnnotation,
	listAgentSessions
} from '../../../apps/launcher/server/agent-store.ts';

let db: Database;
let projectPath: string;

const EDIT_SCRIPT = `
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

console.log('boot');
setTimeout(() => {
  writeFileSync(join(process.cwd(), 'src/routes/+page.svelte'), '<h1>updated</h1>');
  console.log('edited');
}, 40);
setTimeout(() => process.exit(0), 120);
`;

const STALL_SCRIPT = `
console.log('boot');
setInterval(() => {}, 1_000);
`;

beforeEach(async () => {
	db = new Database(':memory:');
	initAnnotationDb(db);

	projectPath = await mkdtemp(join(tmpdir(), 'dryui-launcher-agent-'));
	await mkdir(join(projectPath, 'src/routes'), { recursive: true });
	await writeFile(join(projectPath, 'src/routes/+page.svelte'), '<h1>initial</h1>', 'utf-8');
});

afterEach(async () => {
	db.close();
	await rm(projectPath, { recursive: true, force: true });
});

function makeSessionRow(id: string, annotationId: string | null = null) {
	return {
		id,
		annotation_id: annotationId,
		project_path: projectPath,
		cli: 'codex',
		prompt: 'Feedback on "Hero": "Tighten the layout padding"',
		status: 'running',
		progress_state: 'working',
		attempt: 1,
		retry_of_session_id: null,
		exit_code: null,
		started_at: Date.now(),
		spawned_at: null,
		first_output_at: null,
		first_edit_at: null,
		last_output_at: null,
		finished_at: null,
		terminal_reason: null,
		failure_reason: null
	} as const;
}

function makeAnnotationRow(id: string) {
	return {
		id,
		project_path: projectPath,
		element: 'Hero section',
		element_path: 'main > section',
		comment: 'Tighten the layout padding',
		status: 'acknowledged',
		intent: 'fix',
		severity: 'important',
		kind: 'feedback',
		color: 'brand',
		context_json: JSON.stringify({ sourceFile: 'src/routes/+page.svelte' }),
		resolved_at: null,
		resolved_by: null,
		resolution_note: null,
		created_at: Date.now()
	} as const;
}

async function waitFor<T>(read: () => T | null | undefined, timeoutMs = 2_000): Promise<T> {
	const start = Date.now();

	while (Date.now() - start < timeoutMs) {
		const value = read();
		if (value) return value;
		await Bun.sleep(20);
	}

	throw new Error('Timed out waiting for condition');
}

describe('AgentManager', () => {
	test('records first output and first edit timestamps before completing and resolves edited annotations', async () => {
		insertAnnotation(db, makeAnnotationRow('ann-success'));
		insertAgentSession(db, makeSessionRow('session-edits', 'ann-success'));

		const manager = new AgentManager(db, {
			cliCommands: {
				codex: { command: 'bun', args: ['-e', EDIT_SCRIPT] }
			},
			firstEditTimeoutMs: 500,
			outputSilenceTimeoutMs: 500,
			editWatchIntervalMs: 20
		});

		expect(
			manager.spawn({
				sessionId: 'session-edits',
				annotationId: 'ann-success',
				cli: 'codex',
				prompt: 'Feedback on "Hero": "Tighten the layout padding"',
				cwd: projectPath
			})
		).toBe(true);

		const session = await waitFor(() => {
			const current = getAgentSession(db, 'session-edits');
			return current?.status === 'completed' ? current : null;
		});

		expect(session.progress_state).toBe('edited');
		expect(session.spawned_at).not.toBeNull();
		expect(session.first_output_at).not.toBeNull();
		expect(session.first_edit_at).not.toBeNull();
		expect(session.last_output_at).not.toBeNull();
		expect(session.terminal_reason).toBe('completed');
		expect(session.first_edit_at! >= session.spawned_at!).toBe(true);

		const annotation = await waitFor(() => {
			const current = getAnnotation(db, 'ann-success');
			return current?.status === 'resolved' ? current : null;
		});
		expect(annotation.status).toBe('resolved');
		expect(annotation.resolved_by).toBe('codex-auto-agent');
		expect(annotation.resolution_note).toContain('Resolved automatically');
	});

	test('marks stalled runs as failed, builds a bounded retry prompt, and retries only once', async () => {
		insertAnnotation(db, makeAnnotationRow('ann-retry'));
		insertAgentSession(db, makeSessionRow('session-stall', 'ann-retry'));

		const events: Array<{ event: string; data: unknown }> = [];
		const manager = new AgentManager(db, {
			cliCommands: {
				codex: { command: 'bun', args: ['-e', STALL_SCRIPT] }
			},
			firstEditTimeoutMs: 200,
			outputSilenceTimeoutMs: 80,
			editWatchIntervalMs: 20,
			getProjectDiagnostics: () => 'ReferenceError: page is not defined'
		});
		manager.setEventCallback((event, data) => {
			events.push({ event, data });
		});

		expect(
			manager.spawn({
				sessionId: 'session-stall',
				annotationId: 'ann-retry',
				cli: 'codex',
				prompt: 'Feedback on "Hero": "Tighten the layout padding"',
				cwd: projectPath
			})
		).toBe(true);

		const retrySession = await waitFor(() => {
			const sessions = listAgentSessions(db, { annotation_id: 'ann-retry' });
			return sessions.find((session) => session.attempt === 2) ?? null;
		});

		expect(retrySession.retry_of_session_id).toBe('session-stall');
		expect(retrySession.prompt).toContain('Annotation text: Tighten the layout padding');
		expect(retrySession.prompt).toContain('ReferenceError: page is not defined');
		expect(retrySession.prompt).toContain('Likely target files: src/routes/+page.svelte');
		expect(retrySession.prompt).toContain(
			'Make a small concrete edit in one of those files immediately'
		);

		const finalRetry = await waitFor(() => {
			const current = getAgentSession(db, retrySession.id);
			return current?.status === 'stalled' ? current : null;
		});

		const originalSession = getAgentSession(db, 'session-stall');
		const annotation = getAnnotation(db, 'ann-retry');
		const allSessions = listAgentSessions(db, { annotation_id: 'ann-retry' });

		expect(originalSession?.status).toBe('stalled');
		expect(['no-output-for-60s', 'no-first-edit-within-90s']).toContain(
			originalSession?.failure_reason
		);
		expect(['no-output-for-60s', 'no-first-edit-within-90s']).toContain(finalRetry.failure_reason);
		expect(allSessions).toHaveLength(2);
		expect(annotation?.status).toBe('failed');
		expect(events.some((entry) => entry.event === 'annotation:updated')).toBe(true);
		expect(events.some((entry) => entry.event === 'annotation:acknowledged')).toBe(true);
	});
});
