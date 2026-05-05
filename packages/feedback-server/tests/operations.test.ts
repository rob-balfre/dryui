import { describe, expect, test } from 'bun:test';
import { EventBus } from '../src/events.ts';
import type { FeedbackOperationsStore } from '../src/operations.ts';
import {
	addThreadMessage,
	createAnnotation,
	createSession,
	createSubmission,
	deleteAnnotation,
	deleteSubmission,
	requestSessionAction,
	saveDrawings,
	updateAnnotation,
	updateSubmissionStatus
} from '../src/operations.ts';
import type {
	Annotation,
	CreateAnnotationInput,
	CreateSessionInput,
	CreateSubmissionInput,
	SSEEvent,
	Session,
	Submission,
	SubmissionStatus,
	ThreadMessage,
	UpdateAnnotationInput
} from '../src/types.ts';

class FakeStore implements FeedbackOperationsStore {
	sessions = new Map<string, Session>();
	annotations = new Map<string, Annotation>();
	submissions = new Map<string, Submission>();
	drawings = new Map<string, unknown[]>();
	workspaceContext: { workspace?: string } | undefined;

	createSession(input: CreateSessionInput): Session {
		const session: Session = {
			id: `session-${this.sessions.size + 1}`,
			url: input.url,
			status: 'active',
			createdAt: '2026-05-05T00:00:00.000Z'
		};
		this.sessions.set(session.id, session);
		return session;
	}

	getSession(id: string): Session | null {
		return this.sessions.get(id) ?? null;
	}

	createAnnotation(sessionId: string, input: CreateAnnotationInput): Annotation {
		const annotation: Annotation = {
			id: input.id ?? `annotation-${this.annotations.size + 1}`,
			sessionId,
			x: input.x,
			y: input.y,
			comment: input.comment,
			element: input.element,
			elementPath: input.elementPath,
			timestamp: input.timestamp,
			isFixed: input.isFixed ?? false,
			status: input.status ?? 'pending',
			createdAt: '2026-05-05T00:00:00.000Z',
			kind: input.kind ?? 'feedback',
			color: input.color ?? 'brand'
		};
		this.annotations.set(annotation.id, annotation);
		return annotation;
	}

	updateAnnotation(id: string, patch: UpdateAnnotationInput): Annotation | null {
		const existing = this.annotations.get(id);
		if (!existing) return null;
		const updated = { ...existing, ...patch, id: existing.id, sessionId: existing.sessionId };
		this.annotations.set(id, updated);
		return updated;
	}

	deleteAnnotation(id: string): Annotation | null {
		const existing = this.annotations.get(id);
		if (!existing) return null;
		this.annotations.delete(id);
		return existing;
	}

	addThreadMessage(
		id: string,
		message: Omit<ThreadMessage, 'id' | 'timestamp'> &
			Partial<Pick<ThreadMessage, 'id' | 'timestamp'>>
	): Annotation | null {
		const existing = this.annotations.get(id);
		if (!existing) return null;
		const thread = [
			...(existing.thread ?? []),
			{
				id: message.id ?? 'message-1',
				role: message.role,
				content: message.content,
				timestamp: message.timestamp ?? 1
			}
		];
		return this.updateAnnotation(id, { thread });
	}

	getPending(sessionId?: string): Annotation[] {
		return [...this.annotations.values()].filter(
			(annotation) =>
				annotation.status === 'pending' &&
				(sessionId === undefined || annotation.sessionId === sessionId)
		);
	}

	saveDrawings(url: string, drawings: unknown[]): void {
		this.drawings.set(url, drawings);
	}

	createSubmission(input: CreateSubmissionInput, context?: { workspace?: string }): Submission {
		this.workspaceContext = context;
		const submission: Submission = {
			id: `submission-${this.submissions.size + 1}`,
			url: input.url,
			screenshotPath: { webp: '/tmp/submission.webp', png: '/tmp/submission.png' },
			drawings: input.drawings,
			viewport: input.viewport ?? null,
			status: 'pending',
			createdAt: '2026-05-05T00:00:00.000Z',
			...(context?.workspace ? { workspace: context.workspace } : {})
		};
		this.submissions.set(submission.id, submission);
		return submission;
	}

	updateSubmissionStatus(id: string, status: SubmissionStatus): Submission | null {
		const existing = this.submissions.get(id);
		if (!existing) return null;
		const updated = { ...existing, status };
		this.submissions.set(id, updated);
		return updated;
	}

	deleteSubmission(id: string): Submission | null {
		const existing = this.submissions.get(id);
		if (!existing) return null;
		this.submissions.delete(id);
		return existing;
	}
}

function annotationInput(overrides: Partial<CreateAnnotationInput> = {}): CreateAnnotationInput {
	return {
		id: 'annotation-1',
		x: 10,
		y: 20,
		comment: 'Fix this label.',
		element: 'label',
		elementPath: 'main label',
		timestamp: 100,
		color: 'brand',
		...overrides
	};
}

function submissionInput(url = 'https://example.com/submission'): CreateSubmissionInput {
	return {
		url,
		image: { webp: 'webp', png: 'png' },
		drawings: []
	};
}

function setup(): {
	store: FakeStore;
	bus: EventBus;
	events: SSEEvent[];
} {
	const store = new FakeStore();
	const bus = new EventBus();
	const events: SSEEvent[] = [];
	bus.subscribe((event) => events.push(event));
	return { store, bus, events };
}

describe('feedback operations', () => {
	test('creates a session and emits session.created', () => {
		const { store, bus, events } = setup();

		const session = createSession(store, bus, { url: 'https://example.com/session' });

		expect(session.id).toBe('session-1');
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'session.created',
			sessionId: session.id,
			payload: session
		});
	});

	test('creates annotations only for existing sessions and emits annotation.created', () => {
		const { store, bus, events } = setup();
		const session = store.createSession({ url: 'https://example.com/page' });

		const missing = createAnnotation(store, bus, 'missing-session', annotationInput());
		const annotation = createAnnotation(store, bus, session.id, annotationInput());

		expect(missing).toBeNull();
		expect(annotation).toMatchObject({ id: 'annotation-1', sessionId: session.id });
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'annotation.created',
			sessionId: session.id,
			payload: annotation
		});
	});

	test('requests session action with delivered listener counts and pending annotation count', () => {
		const { store, bus, events } = setup();
		const session = store.createSession({ url: 'https://example.com/page' });
		store.createAnnotation(session.id, annotationInput());

		const missing = requestSessionAction(store, bus, 'missing-session', { output: 'Apply fixes.' });
		const response = requestSessionAction(store, bus, session.id, { output: 'Apply fixes.' });

		expect(missing).toBeNull();
		expect(response).toEqual({
			success: true,
			annotationCount: 1,
			delivered: {
				sseListeners: 1,
				webhooks: 0,
				total: 1
			}
		});
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'action.requested',
			sessionId: session.id,
			payload: { output: 'Apply fixes.', sessionId: session.id }
		});
	});

	test('saves drawings and emits drawings.updated with the url as sessionId', () => {
		const { store, bus, events } = setup();
		const drawings = [{ id: 'draw-1' }];

		saveDrawings(store, bus, 'https://example.com/canvas', drawings);

		expect(store.drawings.get('https://example.com/canvas')).toBe(drawings);
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'drawings.updated',
			sessionId: 'https://example.com/canvas',
			payload: { url: 'https://example.com/canvas' }
		});
	});

	test('creates, updates, and deletes submissions with submission events', () => {
		const { store, bus, events } = setup();

		const created = createSubmission(store, bus, submissionInput(), { workspace: '/workspace' });
		expect(created).not.toBeNull();
		if (!created) throw new Error('Expected valid submission input to create a submission');
		const updated = updateSubmissionStatus(store, bus, created.id, 'resolved');
		const deleted = deleteSubmission(store, bus, created.id);
		const missingUpdate = updateSubmissionStatus(store, bus, 'missing-submission', 'resolved');
		const missingDelete = deleteSubmission(store, bus, 'missing-submission');

		expect(created.workspace).toBe('/workspace');
		expect(store.workspaceContext).toEqual({ workspace: '/workspace' });
		expect(updated).toMatchObject({ id: created.id, status: 'resolved' });
		expect(deleted).toMatchObject({ id: created.id });
		expect(missingUpdate).toBeNull();
		expect(missingDelete).toBeNull();
		expect(events.map((event) => event.type)).toEqual([
			'submission.created',
			'submission.updated',
			'submission.deleted'
		]);
		expect(events.map((event) => event.sessionId)).toEqual([created.url, created.url, created.url]);
		expect(events[0]?.payload).toBe(created);
		expect(events[1]?.payload).toBe(updated);
		expect(events[2]?.payload).toBe(deleted);
	});

	test('updates, deletes, and threads annotations with annotation events', () => {
		const { store, bus, events } = setup();
		const session = store.createSession({ url: 'https://example.com/page' });
		const created = store.createAnnotation(session.id, annotationInput());

		const updated = updateAnnotation(store, bus, created.id, { status: 'resolved' });
		const threaded = addThreadMessage(store, bus, created.id, {
			role: 'agent',
			content: 'Resolved in the current patch.'
		});
		const deleted = deleteAnnotation(store, bus, created.id);
		const missingUpdate = updateAnnotation(store, bus, 'missing-annotation', {
			status: 'resolved'
		});
		const missingThread = addThreadMessage(store, bus, 'missing-annotation', {
			role: 'human',
			content: 'Any update?'
		});
		const missingDelete = deleteAnnotation(store, bus, 'missing-annotation');

		expect(updated).toMatchObject({ id: created.id, status: 'resolved' });
		expect(threaded?.thread).toEqual([
			{
				id: 'message-1',
				role: 'agent',
				content: 'Resolved in the current patch.',
				timestamp: 1
			}
		]);
		expect(deleted).toMatchObject({ id: created.id });
		expect(missingUpdate).toBeNull();
		expect(missingThread).toBeNull();
		expect(missingDelete).toBeNull();
		expect(events.map((event) => event.type)).toEqual([
			'annotation.updated',
			'thread.message',
			'annotation.deleted'
		]);
		expect(events.map((event) => event.sessionId)).toEqual([session.id, session.id, session.id]);
		expect(events[0]?.payload).toBe(updated);
		expect(events[1]?.payload).toBe(threaded);
		expect(events[2]?.payload).toBe(deleted);
	});
});
