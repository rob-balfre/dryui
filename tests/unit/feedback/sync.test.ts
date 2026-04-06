import { afterEach, describe, expect, test } from 'bun:test';
import {
	createSession,
	deleteAnnotation,
	getSession,
	listSessions,
	requestAction,
	syncAnnotation,
	updateAnnotation
} from '../../../packages/feedback/src/utils/sync';
import type {
	Annotation,
	Session,
	SessionWithAnnotations
} from '../../../packages/feedback/src/types';

const originalFetch = globalThis.fetch;

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), {
		status,
		headers: { 'Content-Type': 'application/json' }
	});
}

function makeAnnotation(): Annotation {
	return {
		id: 'a-1',
		x: 10,
		y: 20,
		isFixed: false,
		timestamp: Date.now(),
		element: 'button "Save"',
		elementPath: 'main > button',
		comment: 'Update the label',
		kind: 'feedback',
		color: 'brand'
	};
}

afterEach(() => {
	globalThis.fetch = originalFetch;
});

describe('sync utilities', () => {
	test('listSessions reads the sessions collection', async () => {
		const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
		const sessions: Session[] = [
			{
				id: 'session-1',
				url: 'https://example.com',
				status: 'active',
				createdAt: '2026-03-29T00:00:00.000Z'
			}
		];

		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			calls.push({ input, init });
			return jsonResponse(sessions);
		}) as typeof fetch;

		await expect(listSessions('https://api.example.com')).resolves.toEqual(sessions);
		expect(calls[0]?.input.toString()).toBe('https://api.example.com/sessions');
		expect(calls[0]?.init?.method).toBeUndefined();
	});

	test('createSession posts the page URL', async () => {
		const payload: Session = {
			id: 'session-1',
			url: 'https://example.com/page',
			status: 'active',
			createdAt: '2026-03-29T00:00:00.000Z'
		};
		let requestBody: unknown;

		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			requestBody = init?.body ? JSON.parse(String(init.body)) : undefined;
			expect(input.toString()).toBe('https://api.example.com/sessions');
			expect(init?.method).toBe('POST');
			return jsonResponse(payload);
		}) as typeof fetch;

		await expect(
			createSession('https://api.example.com', 'https://example.com/page')
		).resolves.toEqual(payload);
		expect(requestBody).toEqual({ url: 'https://example.com/page' });
	});

	test('getSession fetches annotations for a session', async () => {
		const payload: SessionWithAnnotations = {
			id: 'session-1',
			url: 'https://example.com/page',
			status: 'active',
			createdAt: '2026-03-29T00:00:00.000Z',
			annotations: [makeAnnotation()]
		};

		globalThis.fetch = (async (input: RequestInfo | URL) => {
			expect(input.toString()).toBe('https://api.example.com/sessions/session-1');
			return jsonResponse(payload);
		}) as typeof fetch;

		await expect(getSession('https://api.example.com', 'session-1')).resolves.toEqual(payload);
	});

	test('syncAnnotation posts a serialized annotation payload', async () => {
		const annotation = makeAnnotation();

		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			expect(input.toString()).toBe('https://api.example.com/sessions/session-1/annotations');
			expect(init?.method).toBe('POST');
			expect(JSON.parse(String(init?.body))).toMatchObject({
				id: annotation.id,
				comment: annotation.comment
			});
			return jsonResponse(annotation);
		}) as typeof fetch;

		await expect(
			syncAnnotation('https://api.example.com', 'session-1', annotation)
		).resolves.toEqual(annotation);
	});

	test('updateAnnotation patches the target annotation', async () => {
		const payload = { ...makeAnnotation(), comment: 'Keep the label', status: 'resolved' as const };

		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			expect(input.toString()).toBe('https://api.example.com/annotations/annotation-1');
			expect(init?.method).toBe('PATCH');
			expect(JSON.parse(String(init?.body))).toEqual({ comment: 'Keep the label' });
			return jsonResponse(payload);
		}) as typeof fetch;

		await expect(
			updateAnnotation('https://api.example.com', 'annotation-1', { comment: 'Keep the label' })
		).resolves.toEqual(payload);
	});

	test('deleteAnnotation issues a delete request', async () => {
		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			expect(input.toString()).toBe('https://api.example.com/annotations/annotation-1');
			expect(init?.method).toBe('DELETE');
			return new Response(null, { status: 204 });
		}) as typeof fetch;

		await expect(
			deleteAnnotation('https://api.example.com', 'annotation-1')
		).resolves.toBeUndefined();
	});

	test('requestAction submits the generated output', async () => {
		const payload = {
			success: true,
			annotationCount: 3,
			delivered: {
				sseListeners: 1,
				webhooks: 1,
				total: 2
			}
		};

		globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
			expect(input.toString()).toBe('https://api.example.com/sessions/session-1/action');
			expect(init?.method).toBe('POST');
			expect(JSON.parse(String(init?.body))).toEqual({ output: 'feedback markdown' });
			return jsonResponse(payload);
		}) as typeof fetch;

		await expect(
			requestAction('https://api.example.com', 'session-1', 'feedback markdown')
		).resolves.toEqual(payload);
	});
});
