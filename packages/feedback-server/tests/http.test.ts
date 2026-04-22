import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
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
	let screenshotsDir: string;
	let screenshotPaths: string[];

	beforeEach(() => {
		screenshotsDir = mkdtempSync(join(tmpdir(), 'dryui-feedback-http-'));
		store = new FeedbackStore({ dbPath: ':memory:', screenshotsDir });
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
		rmSync(screenshotsDir, { recursive: true, force: true });
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
				image: {
					webp: Buffer.from('pending-older-webp').toString('base64'),
					png: Buffer.from('pending-older-png').toString('base64')
				},
				drawings: [
					{
						id: 'arrow-older',
						kind: 'arrow',
						color: 'hsl(25 100% 55%)',
						start: { x: 10, y: 10 },
						end: { x: 50, y: 50 },
						width: 3
					}
				],
				hints: [
					{
						corner: 'top-left',
						percentX: 4,
						percentY: 5,
						element: { tag: 'nav', selector: 'nav.primary' }
					}
				],
				viewport: { width: 2560, height: 1440 },
				scroll: { x: 0, y: 120 }
			})
		});
		expect(pendingOlderResponse.status).toBe(201);
		const pendingOlder = (await pendingOlderResponse.json()) as Submission;
		screenshotPaths.push(pendingOlder.screenshotPath.webp, pendingOlder.screenshotPath.png);

		expect(pendingOlder.screenshotPath.webp).toMatch(/\.webp$/);
		expect(pendingOlder.screenshotPath.png).toMatch(/\.png$/);
		expect(pendingOlder.hints).toEqual([
			{
				corner: 'top-left',
				percentX: 4,
				percentY: 5,
				element: { tag: 'nav', selector: 'nav.primary' }
			}
		]);
		expect(pendingOlder.scroll).toEqual({ x: 0, y: 120 });

		await new Promise((resolve) => setTimeout(resolve, 5));

		const pendingNewerResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/queue/newer',
				image: {
					webp: Buffer.from('pending-newer-webp').toString('base64'),
					png: Buffer.from('pending-newer-png').toString('base64')
				},
				drawings: [
					{
						id: 'arrow-newer',
						kind: 'arrow',
						color: 'hsl(25 100% 55%)',
						start: { x: 1, y: 1 },
						end: { x: 10, y: 10 },
						width: 3
					}
				]
			})
		});
		expect(pendingNewerResponse.status).toBe(201);
		const pendingNewer = (await pendingNewerResponse.json()) as Submission;
		screenshotPaths.push(pendingNewer.screenshotPath.webp, pendingNewer.screenshotPath.png);

		const resolvedResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/history',
				image: {
					webp: Buffer.from('resolved-webp').toString('base64'),
					png: Buffer.from('resolved-png').toString('base64')
				},
				drawings: [
					{
						id: 'text-resolved',
						kind: 'text',
						color: 'hsl(25 100% 55%)',
						position: { x: 20, y: 40 },
						text: 'Looks good',
						fontSize: 16
					}
				]
			})
		});
		expect(resolvedResponse.status).toBe(201);
		const resolved = (await resolvedResponse.json()) as Submission;
		screenshotPaths.push(resolved.screenshotPath.webp, resolved.screenshotPath.png);

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

		const webpResponse = await fetch(`${baseUrl}/submissions/${pendingOlder.id}/screenshot`);
		expect(webpResponse.status).toBe(200);
		expect(webpResponse.headers.get('content-type')).toContain('image/webp');
		expect((await webpResponse.arrayBuffer()).byteLength).toBeGreaterThan(0);

		const pngResponse = await fetch(
			`${baseUrl}/submissions/${pendingOlder.id}/screenshot?format=png`
		);
		expect(pngResponse.status).toBe(200);
		expect(pngResponse.headers.get('content-type')).toContain('image/png');
		expect((await pngResponse.arrayBuffer()).byteLength).toBeGreaterThan(0);
	});

	test('rejects submissions missing paired image fields', async () => {
		const response = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/bad',
				image: { webp: Buffer.from('only-webp').toString('base64') },
				drawings: []
			})
		});
		expect(response.status).toBe(400);
	});

	test('reports dispatch targets for the launcher picker', async () => {
		server.stop();
		server = startFeedbackHttpServer(store, bus, {
			host: '127.0.0.1',
			port: 0,
			dispatcher: {
				workspace: process.cwd(),
				defaultAgent: 'codex',
				terminalApp: 'terminal'
			}
		});
		baseUrl = `http://${server.hostname}:${server.port}`;

		const response = await fetch(`${baseUrl}/dispatch-targets`);
		expect(response.status).toBe(200);
		expect(await response.json()).toMatchObject({
			defaultAgent: 'codex',
			configuredAgents: expect.any(Array)
		});
	});
});
