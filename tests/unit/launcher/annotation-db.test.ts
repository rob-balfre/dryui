import { describe, test, expect, beforeEach, afterEach } from 'bun:test';
import { Database } from 'bun:sqlite';
import {
	initAnnotationDb,
	insertAnnotation,
	insertAnnotationBatch,
	getAnnotation,
	listAnnotations,
	updateAnnotation,
	clearAnnotations,
	appendAnnotationThreadMessage,
	insertAgentSession,
	getAgentSession,
	listAgentSessions,
	updateAgentSession
} from '../../../apps/launcher/server/agent-store.ts';

let db: Database;

beforeEach(() => {
	db = new Database(':memory:');
	initAnnotationDb(db);
});

afterEach(() => {
	db.close();
});

function makeAnnotationRow(overrides: Record<string, unknown> = {}) {
	return {
		id: `ann-${Math.random().toString(36).slice(2, 8)}`,
		project_path: '/tmp/test-project',
		element: 'button "Save"',
		element_path: 'div > button',
		comment: 'Needs more contrast',
		status: 'pending' as const,
		intent: 'fix' as const,
		severity: 'important' as const,
		kind: 'feedback' as const,
		color: 'brand' as const,
		context_json: null,
		thread_json: null,
		resolved_at: null,
		resolved_by: null,
		resolution_note: null,
		created_at: Date.now(),
		updated_at: null,
		...overrides
	};
}

function makeSessionRow(overrides: Record<string, unknown> = {}) {
	return {
		id: `ses-${Math.random().toString(36).slice(2, 8)}`,
		annotation_id: null,
		project_path: '/tmp/test-project',
		cli: 'claude-code' as const,
		prompt: 'Fix the button contrast',
		status: 'running' as const,
		progress_state: 'working' as const,
		attempt: 1,
		retry_of_session_id: null,
		exit_code: null,
		started_at: Date.now(),
		spawned_at: Date.now(),
		first_output_at: null,
		first_edit_at: null,
		last_output_at: null,
		finished_at: null,
		terminal_reason: null,
		failure_reason: null,
		...overrides
	};
}

describe('annotation CRUD', () => {
	test('insertAnnotation and getAnnotation round-trip', () => {
		const row = makeAnnotationRow({ id: 'ann-1' });
		insertAnnotation(db, row);
		const result = getAnnotation(db, 'ann-1');
		expect(result).not.toBeNull();
		expect(result!.id).toBe('ann-1');
		expect(result!.comment).toBe('Needs more contrast');
		expect(result!.status).toBe('pending');
	});

	test('insertAnnotationBatch inserts multiple rows', () => {
		const rows = [
			makeAnnotationRow({ id: 'batch-1', created_at: 100 }),
			makeAnnotationRow({ id: 'batch-2', created_at: 200 }),
			makeAnnotationRow({ id: 'batch-3', created_at: 300 })
		];
		insertAnnotationBatch(db, rows);
		const all = listAnnotations(db, {});
		expect(all).toHaveLength(3);
	});

	test('listAnnotations filters by status', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'f-1', status: 'pending', created_at: 1 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'f-2', status: 'resolved', created_at: 2 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'f-3', status: 'pending', created_at: 3 }));
		const pending = listAnnotations(db, { status: 'pending' });
		expect(pending).toHaveLength(2);
		expect(pending[0]!.id).toBe('f-1');
		expect(pending[1]!.id).toBe('f-3');
	});

	test('listAnnotations filters by severity', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 's-1', severity: 'blocking', created_at: 1 }));
		insertAnnotation(db, makeAnnotationRow({ id: 's-2', severity: 'suggestion', created_at: 2 }));
		const blocking = listAnnotations(db, { severity: 'blocking' });
		expect(blocking).toHaveLength(1);
		expect(blocking[0]!.id).toBe('s-1');
	});

	test('listAnnotations filters by project_path', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'p-1', project_path: '/a', created_at: 1 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'p-2', project_path: '/b', created_at: 2 }));
		const results = listAnnotations(db, { project_path: '/a' });
		expect(results).toHaveLength(1);
		expect(results[0]!.id).toBe('p-1');
	});

	test('listAnnotations returns results sorted by created_at ascending', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'o-1', created_at: 300 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'o-2', created_at: 100 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'o-3', created_at: 200 }));
		const all = listAnnotations(db, {});
		expect(all[0]!.id).toBe('o-2');
		expect(all[1]!.id).toBe('o-3');
		expect(all[2]!.id).toBe('o-1');
	});

	test('updateAnnotation changes fields and returns updated row', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'u-1' }));
		const result = updateAnnotation(db, 'u-1', {
			status: 'resolved',
			resolved_at: 999,
			resolved_by: 'agent',
			resolution_note: 'Fixed contrast'
		});
		expect(result).not.toBeNull();
		expect(result!.status).toBe('resolved');
		expect(result!.resolved_by).toBe('agent');
		expect(result!.resolution_note).toBe('Fixed contrast');
		expect(result!.updated_at).toBeTruthy();
	});

	test('appendAnnotationThreadMessage stores thread history as JSON', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'thread-1' }));
		const result = appendAnnotationThreadMessage(db, 'thread-1', {
			id: 'msg-1',
			role: 'human',
			content: 'Can you tighten the spacing?',
			timestamp: 123
		});

		expect(result).not.toBeNull();
		expect(result!.thread_json).toBeTruthy();
		expect(JSON.parse(result!.thread_json!)).toEqual([
			{
				id: 'msg-1',
				role: 'human',
				content: 'Can you tighten the spacing?',
				timestamp: 123
			}
		]);
	});

	test('updateAnnotation returns null for unknown ID', () => {
		const result = updateAnnotation(db, 'nonexistent', { status: 'resolved' });
		expect(result).toBeNull();
	});

	test('clearAnnotations removes all rows for a project', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'c-1', project_path: '/a', created_at: 1 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'c-2', project_path: '/b', created_at: 2 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'c-3', project_path: '/a', created_at: 3 }));
		clearAnnotations(db, '/a');
		expect(listAnnotations(db, {})).toHaveLength(1);
		expect(listAnnotations(db, {})[0]!.id).toBe('c-2');
	});

	test('clearAnnotations without project_path clears all', () => {
		insertAnnotation(db, makeAnnotationRow({ id: 'ca-1', created_at: 1 }));
		insertAnnotation(db, makeAnnotationRow({ id: 'ca-2', created_at: 2 }));
		clearAnnotations(db);
		expect(listAnnotations(db, {})).toHaveLength(0);
	});
});

describe('agent session CRUD', () => {
	test('insertAgentSession and getAgentSession round-trip', () => {
		const row = makeSessionRow({ id: 'ses-1' });
		insertAgentSession(db, row);
		const result = getAgentSession(db, 'ses-1');
		expect(result).not.toBeNull();
		expect(result!.cli).toBe('claude-code');
		expect(result!.status).toBe('running');
		expect(result!.progress_state).toBe('working');
		expect(result!.attempt).toBe(1);
	});

	test('listAgentSessions filters by status', () => {
		insertAgentSession(db, makeSessionRow({ id: 'ls-1', status: 'running', started_at: 1 }));
		insertAgentSession(db, makeSessionRow({ id: 'ls-2', status: 'completed', started_at: 2 }));
		const running = listAgentSessions(db, { status: 'running' });
		expect(running).toHaveLength(1);
		expect(running[0]!.id).toBe('ls-1');
	});

	test('listAgentSessions filters by annotation_id', () => {
		insertAgentSession(db, makeSessionRow({ id: 'la-1', annotation_id: 'ann-1', started_at: 1 }));
		insertAgentSession(db, makeSessionRow({ id: 'la-2', annotation_id: 'ann-2', started_at: 2 }));
		const results = listAgentSessions(db, { annotation_id: 'ann-1' });
		expect(results).toHaveLength(1);
		expect(results[0]!.id).toBe('la-1');
	});

	test('updateAgentSession changes fields', () => {
		insertAgentSession(db, makeSessionRow({ id: 'us-1' }));
		const result = updateAgentSession(db, 'us-1', {
			status: 'stalled',
			progress_state: 'edited',
			exit_code: 0,
			first_edit_at: 123,
			finished_at: Date.now(),
			terminal_reason: 'stalled',
			failure_reason: 'no-first-edit-within-90s'
		});
		expect(result).not.toBeNull();
		expect(result!.status).toBe('stalled');
		expect(result!.progress_state).toBe('edited');
		expect(result!.exit_code).toBe(0);
		expect(result!.first_edit_at).toBe(123);
		expect(result!.failure_reason).toBe('no-first-edit-within-90s');
	});

	test('updateAgentSession returns null for unknown ID', () => {
		const result = updateAgentSession(db, 'nonexistent', { status: 'failed' });
		expect(result).toBeNull();
	});
});
