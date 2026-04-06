import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { EventBus } from '../src/events.ts';
import { startFeedbackHttpServer } from '../src/http.ts';
import { FeedbackStore } from '../src/store.ts';
import type { Annotation, Session } from '../src/types.ts';

describe('feedback HTTP server', () => {
	let store: FeedbackStore;
	let bus: EventBus;
	let server: { stop(): void; hostname: string; port: number };
	let baseUrl: string;

	beforeEach(() => {
		store = new FeedbackStore(':memory:');
		bus = new EventBus();
		server = startFeedbackHttpServer(store, bus, { host: '127.0.0.1', port: 0 });
		baseUrl = `http://${server.hostname}:${server.port}`;
	});

	afterEach(() => {
		server.stop();
		store.close();
	});

	async function createSession(url = 'https://example.com/workspace'): Promise<Session> {
		const response = await fetch(`${baseUrl}/sessions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ url })
		});

		expect(response.status).toBe(201);
		return response.json() as Promise<Session>;
	}

	test('creates sessions and annotations and exposes pending state', async () => {
		const session = await createSession();

		const annotationResponse = await fetch(`${baseUrl}/sessions/${session.id}/annotations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				x: 12,
				y: 160,
				comment: 'Add more space above this card.',
				element: 'section "Highlights"',
				elementPath: 'main > section:nth-of-type(2)',
				timestamp: 123,
				color: 'warning',
				isFixed: false
			})
		});

		expect(annotationResponse.status).toBe(201);
		const annotation = (await annotationResponse.json()) as Annotation;
		expect(annotation).toMatchObject({
			sessionId: session.id,
			color: 'warning',
			isFixed: false,
			status: 'pending'
		});

		const pendingResponse = await fetch(`${baseUrl}/sessions/${session.id}/pending`);
		expect(pendingResponse.status).toBe(200);
		expect(await pendingResponse.json()).toMatchObject({
			count: 1,
			annotations: [expect.objectContaining({ id: annotation.id })]
		});
	});

	test('updates annotations, appends thread replies, and reports active listeners', async () => {
		const session = await createSession('https://example.com/settings');
		const createResponse = await fetch(`${baseUrl}/sessions/${session.id}/annotations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				x: 40,
				y: 240,
				comment: 'Clarify this helper copy.',
				element: 'label "Email"',
				elementPath: 'main label',
				timestamp: 456,
				color: 'brand',
				isFixed: false
			})
		});
		const created = (await createResponse.json()) as Annotation;

		const unsubscribe = bus.subscribe(() => {});
		const statusResponse = await fetch(`${baseUrl}/status`);
		expect(statusResponse.status).toBe(200);
		expect(await statusResponse.json()).toMatchObject({
			activeListeners: 1,
			agentListeners: 0
		});
		unsubscribe();

		const patchResponse = await fetch(`${baseUrl}/annotations/${created.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				status: 'resolved',
				color: 'success',
				resolvedBy: 'agent',
				resolutionNote: 'Updated copy shipped.'
			})
		});
		expect(patchResponse.status).toBe(200);
		expect(await patchResponse.json()).toMatchObject({
			id: created.id,
			status: 'resolved',
			color: 'success',
			resolutionNote: 'Updated copy shipped.'
		});

		const threadResponse = await fetch(`${baseUrl}/annotations/${created.id}/thread`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				role: 'agent',
				content: 'Verified in the current preview.'
			})
		});
		expect(threadResponse.status).toBe(201);
		expect(await threadResponse.json()).toMatchObject({
			id: created.id,
			thread: [
				expect.objectContaining({ role: 'agent', content: 'Verified in the current preview.' })
			]
		});
	});
});
