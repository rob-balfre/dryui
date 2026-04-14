import { rmSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { EventBus } from '../src/events.ts';
import { startFeedbackHttpServer } from '../src/http.ts';
import { FeedbackStore } from '../src/store.ts';
import type { Annotation, Session, Submission } from '../src/types.ts';

describe('feedback HTTP server', () => {
	let store: FeedbackStore;
	let bus: EventBus;
	let server: { stop(): void; hostname: string; port: number };
	let baseUrl: string;
	let screenshotPaths: string[];

	beforeEach(() => {
		store = new FeedbackStore(':memory:');
		bus = new EventBus();
		server = startFeedbackHttpServer(store, bus, { host: '127.0.0.1', port: 0 });
		baseUrl = `http://${server.hostname}:${server.port}`;
		screenshotPaths = [];
	});

	afterEach(() => {
		for (const path of screenshotPaths) {
			rmSync(path, { force: true });
		}
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

	test('lists queue and history submissions and streams screenshots', async () => {
		const pendingOlderResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/queue/older',
				image: Buffer.from('pending-older-screenshot').toString('base64'),
				drawings: [{ kind: 'arrow' }]
			})
		});
		expect(pendingOlderResponse.status).toBe(201);
		const pendingOlder = (await pendingOlderResponse.json()) as Submission;
		screenshotPaths.push(pendingOlder.screenshotPath);

		await new Promise((resolve) => setTimeout(resolve, 5));

		const pendingNewerResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/queue/newer',
				image: Buffer.from('pending-newer-screenshot').toString('base64'),
				drawings: [{ kind: 'arrow' }]
			})
		});
		expect(pendingNewerResponse.status).toBe(201);
		const pendingNewer = (await pendingNewerResponse.json()) as Submission;
		screenshotPaths.push(pendingNewer.screenshotPath);

		const resolvedResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/history',
				image: Buffer.from('resolved-screenshot').toString('base64'),
				drawings: [{ kind: 'text', text: 'Looks good' }]
			})
		});
		expect(resolvedResponse.status).toBe(201);
		const resolved = (await resolvedResponse.json()) as Submission;
		screenshotPaths.push(resolved.screenshotPath);

		const updateResponse = await fetch(`${baseUrl}/submissions/${resolved.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'resolved' })
		});
		expect(updateResponse.status).toBe(200);

		const queueResponse = await fetch(`${baseUrl}/submissions`);
		expect(queueResponse.status).toBe(200);
		expect(await queueResponse.json()).toMatchObject({
			count: 2,
			submissions: [
				expect.objectContaining({ id: pendingOlder.id, status: 'pending' }),
				expect.objectContaining({ id: pendingNewer.id, status: 'pending' })
			]
		});

		const historyResponse = await fetch(`${baseUrl}/submissions?status=resolved`);
		expect(historyResponse.status).toBe(200);
		expect(await historyResponse.json()).toMatchObject({
			count: 1,
			submissions: [expect.objectContaining({ id: resolved.id, status: 'resolved' })]
		});

		const allResponse = await fetch(`${baseUrl}/submissions?status=all`);
		expect(allResponse.status).toBe(200);
		const allPayload = await allResponse.json();
		expect(allPayload.count).toBe(3);
		expect(allPayload.submissions.map((submission: Submission) => submission.id).sort()).toEqual(
			[pendingOlder.id, pendingNewer.id, resolved.id].sort()
		);

		const screenshotResponse = await fetch(`${baseUrl}/submissions/${pendingOlder.id}/screenshot`);
		expect(screenshotResponse.status).toBe(200);
		expect(screenshotResponse.headers.get('content-type')).toContain('image/webp');
		expect((await screenshotResponse.arrayBuffer()).byteLength).toBeGreaterThan(0);
	});
});
