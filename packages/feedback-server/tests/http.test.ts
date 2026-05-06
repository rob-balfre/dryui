import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, test } from 'bun:test';
import { EventBus } from '../src/events.ts';
import { startFeedbackHttpServer } from '../src/http.ts';
import { FeedbackStore } from '../src/store.ts';
import type { SubmissionPresentation } from '../src/submission-presentation.ts';
import type { Annotation, SSEEvent, Session, Submission } from '../src/types.ts';

const FOREIGN_ORIGIN = 'https://attacker.example';
const DEV_ORIGIN = 'http://localhost:5173';

function imagePayload(tag: string): { webp: string; png: string } {
	return {
		webp: Buffer.from(`${tag}-webp`).toString('base64'),
		png: Buffer.from(`${tag}-png`).toString('base64')
	};
}

function expectNoWildcardCors(response: Response): void {
	expect(response.headers.get('access-control-allow-origin')).not.toBe('*');
}

describe('feedback HTTP server', () => {
	let store: FeedbackStore;
	let bus: EventBus;
	let server: {
		stop(closeActiveConnections?: boolean): Promise<void>;
		hostname: string;
		port: number;
	};
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

	afterEach(async () => {
		for (const path of screenshotPaths) {
			rmSync(path, { force: true });
		}
		// Bun's server.stop() is async and by default leaves in-flight requests
		// and SSE keepalive streams running, which could otherwise race with the
		// next test's beforeEach. Pass `true` to terminate active connections,
		// and await the promise so the listener is fully released before the
		// next test allocates a port (port: 0).
		await server.stop(true);
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

	test('rejects foreign origins from read, state-changing, dispatch, and SSE endpoints', async () => {
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

		const submissionResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/security',
				image: imagePayload('security'),
				drawings: []
			})
		});
		expect(submissionResponse.status).toBe(201);
		const submission = (await submissionResponse.json()) as Submission;
		screenshotPaths.push(submission.screenshotPath.webp, submission.screenshotPath.png);

		const drawingUrl = '/security';
		const attempts: Array<Promise<Response>> = [
			fetch(`${baseUrl}/submissions`, { headers: { Origin: FOREIGN_ORIGIN } }),
			fetch(`${baseUrl}/drawings?url=${encodeURIComponent(drawingUrl)}`, {
				headers: { Origin: FOREIGN_ORIGIN }
			}),
			fetch(`${baseUrl}/drawings?url=${encodeURIComponent(drawingUrl)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Origin: FOREIGN_ORIGIN },
				body: JSON.stringify([{ id: 'blocked' }])
			}),
			fetch(`${baseUrl}/annotations/${annotation.id}`, { headers: { Origin: FOREIGN_ORIGIN } }),
			fetch(`${baseUrl}/events`, { headers: { Origin: FOREIGN_ORIGIN } }),
			fetch(`${baseUrl}/sessions/${session.id}/events`, { headers: { Origin: FOREIGN_ORIGIN } }),
			fetch(`${baseUrl}/dispatch`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json', Origin: FOREIGN_ORIGIN },
				body: JSON.stringify({ agent: 'codex', prompt: 'Do not run this.' })
			})
		];

		const responses = await Promise.all(attempts);
		for (const response of responses) {
			expect(response.status).toBe(403);
			expectNoWildcardCors(response);
		}
		expect(store.getDrawings(drawingUrl)).toEqual([]);
	});

	test('allows local dev and same-origin browser requests without wildcard CORS', async () => {
		const preflight = await fetch(`${baseUrl}/submissions`, {
			method: 'OPTIONS',
			headers: {
				Origin: DEV_ORIGIN,
				'Access-Control-Request-Method': 'POST',
				'Access-Control-Request-Headers': 'Content-Type'
			}
		});
		expect(preflight.status).toBe(204);
		expect(preflight.headers.get('access-control-allow-origin')).toBe(DEV_ORIGIN);

		const submissionResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: DEV_ORIGIN },
			body: JSON.stringify({
				url: 'https://example.com/dev-origin',
				image: imagePayload('dev-origin'),
				drawings: []
			})
		});
		expect(submissionResponse.status).toBe(201);
		expect(submissionResponse.headers.get('access-control-allow-origin')).toBe(DEV_ORIGIN);
		expectNoWildcardCors(submissionResponse);
		const submission = (await submissionResponse.json()) as Submission;
		screenshotPaths.push(submission.screenshotPath.webp, submission.screenshotPath.png);

		const drawingUrl = '/dev-origin';
		const saveDrawingsResponse = await fetch(
			`${baseUrl}/drawings?url=${encodeURIComponent(drawingUrl)}`,
			{
				method: 'PUT',
				headers: { 'Content-Type': 'application/json', Origin: DEV_ORIGIN },
				body: JSON.stringify([{ id: 'allowed' }])
			}
		);
		expect(saveDrawingsResponse.status).toBe(204);
		expect(saveDrawingsResponse.headers.get('access-control-allow-origin')).toBe(DEV_ORIGIN);

		const readDrawingsResponse = await fetch(
			`${baseUrl}/drawings?url=${encodeURIComponent(drawingUrl)}`,
			{ headers: { Origin: DEV_ORIGIN } }
		);
		expect(readDrawingsResponse.status).toBe(200);
		expect(readDrawingsResponse.headers.get('access-control-allow-origin')).toBe(DEV_ORIGIN);
		expect(await readDrawingsResponse.json()).toEqual([{ id: 'allowed' }]);

		const sameOrigin = new URL(baseUrl).origin;
		const sameOriginQueue = await fetch(`${baseUrl}/submissions`, {
			headers: { Origin: sameOrigin }
		});
		expect(sameOriginQueue.status).toBe(200);
		expect(sameOriginQueue.headers.get('access-control-allow-origin')).toBe(sameOrigin);

		const sameOriginDispatch = await fetch(`${baseUrl}/dispatch`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Origin: sameOrigin },
			body: JSON.stringify({ agent: 'not-real', prompt: 'Validation should handle this.' })
		});
		expect(sameOriginDispatch.status).not.toBe(403);
		expect(sameOriginDispatch.headers.get('access-control-allow-origin')).toBe(sameOrigin);
	});

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
		const queuePayload = (await queueResponse.json()) as {
			count: number;
			submissions: SubmissionPresentation[];
		};
		expect(queuePayload.count).toBe(2);
		expect(queuePayload.submissions.map(({ id, status }) => ({ id, status }))).toEqual([
			{ id: pendingOlder.id, status: 'pending' },
			{ id: pendingNewer.id, status: 'pending' }
		]);
		const queuedOlder = queuePayload.submissions.find(
			(submission) => submission.id === pendingOlder.id
		);
		expect(queuedOlder?.preferredScreenshotPath).toBe(pendingOlder.screenshotPath.png);
		expect(queuedOlder?.drawingHints).toHaveLength(1);
		expect(queuedOlder?.summary).toEqual({
			drawingCount: 1,
			hintCount: 1,
			drawingKinds: { arrow: 1 },
			corners: { 'top-left': 1 }
		});

		const singleResponse = await fetch(`${baseUrl}/submissions/${pendingOlder.id}`);
		expect(singleResponse.status).toBe(200);
		const singlePayload = (await singleResponse.json()) as SubmissionPresentation;
		expect(singlePayload.id).toBe(pendingOlder.id);
		expect(singlePayload.preferredScreenshotPath).toBe(pendingOlder.screenshotPath.png);
		expect(singlePayload.drawingHints[0]?.drawing.id).toBe('arrow-older');
		expect(singlePayload.drawingHints[0]?.hint?.corner).toBe('top-left');

		const historyResponse = await fetch(`${baseUrl}/submissions?status=resolved`);
		expect(historyResponse.status).toBe(200);
		const historyPayload = (await historyResponse.json()) as {
			count: number;
			submissions: SubmissionPresentation[];
		};
		expect(historyPayload.count).toBe(1);
		expect(historyPayload.submissions.map(({ id, status }) => ({ id, status }))).toEqual([
			{ id: resolved.id, status: 'resolved' }
		]);
		expect(historyPayload.submissions[0]?.textNotes).toEqual(['Looks good']);

		const allResponse = await fetch(`${baseUrl}/submissions?status=all`);
		expect(allResponse.status).toBe(200);
		const allPayload = (await allResponse.json()) as {
			count: number;
			submissions: SubmissionPresentation[];
		};
		expect(allPayload.count).toBe(3);
		expect(allPayload.submissions.map((submission) => submission.id).sort()).toEqual(
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

		const deleteResponse = await fetch(`${baseUrl}/submissions/${pendingOlder.id}`, {
			method: 'DELETE'
		});
		expect(deleteResponse.status).toBe(204);
		expect(store.getSubmission(pendingOlder.id)).toBeNull();

		const deletedScreenshotResponse = await fetch(
			`${baseUrl}/submissions/${pendingOlder.id}/screenshot`
		);
		expect(deletedScreenshotResponse.status).toBe(404);

		const afterDeleteResponse = await fetch(`${baseUrl}/submissions?status=all`);
		expect(afterDeleteResponse.status).toBe(200);
		const afterDeletePayload = (await afterDeleteResponse.json()) as {
			count: number;
			submissions: SubmissionPresentation[];
		};
		expect(afterDeletePayload.count).toBe(2);
		expect(afterDeletePayload.submissions.map((submission) => submission.id)).not.toContain(
			pendingOlder.id
		);
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
		await server.stop(true);
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

	test('stamps new submissions with the dispatcher workspace', async () => {
		await server.stop(true);
		const workspace = '/tmp/dryui-stamp-workspace';
		server = startFeedbackHttpServer(store, bus, {
			host: '127.0.0.1',
			port: 0,
			dispatcher: {
				workspace,
				defaultAgent: 'codex',
				terminalApp: 'terminal'
			}
		});
		baseUrl = `http://${server.hostname}:${server.port}`;

		const submissionResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/stamped',
				image: {
					webp: Buffer.from('stamped-webp').toString('base64'),
					png: Buffer.from('stamped-png').toString('base64')
				},
				drawings: []
			})
		});
		expect(submissionResponse.status).toBe(201);
		const submission = (await submissionResponse.json()) as Submission;
		screenshotPaths.push(submission.screenshotPath.webp, submission.screenshotPath.png);
		expect(submission.workspace).toBe(workspace);

		// Round-trip via GET to confirm the column persisted, not just the insert return value.
		const queueResponse = await fetch(`${baseUrl}/submissions`);
		const payload = (await queueResponse.json()) as { submissions: SubmissionPresentation[] };
		const persisted = payload.submissions.find((entry) => entry.id === submission.id);
		expect(persisted?.workspace).toBe(workspace);
	});

	test('emits session.created when a session is created', async () => {
		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const session = await createSession('https://example.com/event-session');

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'session.created',
			sessionId: session.id,
			payload: session
		});
	});

	test('emits annotation.created when an annotation is created on a session', async () => {
		const session = await createSession('https://example.com/event-annotation');
		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const response = await fetch(`${baseUrl}/sessions/${session.id}/annotations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				x: 5,
				y: 6,
				comment: 'Tighten this label.',
				element: 'label',
				elementPath: 'main label',
				timestamp: 7,
				color: 'brand',
				isFixed: false
			})
		});
		expect(response.status).toBe(201);
		const annotation = (await response.json()) as Annotation;

		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'annotation.created',
			sessionId: session.id,
			payload: annotation
		});
	});

	test('action request emits action.requested with delivered listener counts and pending count', async () => {
		const session = await createSession('https://example.com/event-action');
		const annotationResponse = await fetch(`${baseUrl}/sessions/${session.id}/annotations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				x: 0,
				y: 0,
				comment: 'Tighten copy.',
				element: 'h1',
				elementPath: 'main h1',
				timestamp: 1,
				color: 'brand',
				isFixed: false
			})
		});
		expect(annotationResponse.status).toBe(201);

		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const missing = await fetch(`${baseUrl}/sessions/missing-session/action`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ output: 'Apply fixes.' })
		});
		expect(missing.status).toBe(404);

		const response = await fetch(`${baseUrl}/sessions/${session.id}/action`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ output: 'Apply fixes.' })
		});
		expect(response.status).toBe(202);
		expect(await response.json()).toEqual({
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

	test('saves drawings via PUT and emits drawings.updated with the url as sessionId', async () => {
		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const drawingsUrl = 'https://example.com/canvas';
		const response = await fetch(`${baseUrl}/drawings?url=${encodeURIComponent(drawingsUrl)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify([{ id: 'draw-1' }])
		});
		expect(response.status).toBe(204);

		expect(store.getDrawings(drawingsUrl)).toEqual([{ id: 'draw-1' }]);
		expect(events).toHaveLength(1);
		expect(events[0]).toMatchObject({
			type: 'drawings.updated',
			sessionId: drawingsUrl,
			payload: { url: drawingsUrl }
		});
	});

	test('emits submission.created, submission.updated, submission.deleted in order keyed by url', async () => {
		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const createResponse = await fetch(`${baseUrl}/submissions`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				url: 'https://example.com/event-submission',
				image: imagePayload('event-submission'),
				drawings: []
			})
		});
		expect(createResponse.status).toBe(201);
		const created = (await createResponse.json()) as Submission & SubmissionPresentation;
		screenshotPaths.push(created.screenshotPath.webp, created.screenshotPath.png);
		expect(created.preferredScreenshotPath).toBe(created.screenshotPath.png);

		const updateResponse = await fetch(`${baseUrl}/submissions/${created.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'resolved' })
		});
		expect(updateResponse.status).toBe(200);
		const updated = (await updateResponse.json()) as SubmissionPresentation;
		expect(updated).toMatchObject({
			id: created.id,
			status: 'resolved',
			preferredScreenshotPath: created.screenshotPath.png
		});

		const deleteResponse = await fetch(`${baseUrl}/submissions/${created.id}`, {
			method: 'DELETE'
		});
		expect(deleteResponse.status).toBe(204);

		const missingUpdate = await fetch(`${baseUrl}/submissions/missing-submission`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'resolved' })
		});
		expect(missingUpdate.status).toBe(404);

		const missingDelete = await fetch(`${baseUrl}/submissions/missing-submission`, {
			method: 'DELETE'
		});
		expect(missingDelete.status).toBe(404);

		expect(events.map((event) => event.type)).toEqual([
			'submission.created',
			'submission.updated',
			'submission.deleted'
		]);
		expect(events.map((event) => event.sessionId)).toEqual([created.url, created.url, created.url]);
		expect(events[0]?.payload).toMatchObject({
			id: created.id,
			status: 'pending',
			preferredScreenshotPath: created.screenshotPath.png
		});
		expect(events[1]?.payload).toMatchObject({
			id: created.id,
			status: 'resolved',
			preferredScreenshotPath: created.screenshotPath.png
		});
		expect(events[2]?.payload).toMatchObject({ id: created.id });
	});

	test('emits annotation.updated, thread.message, and annotation.deleted in order keyed by sessionId', async () => {
		const session = await createSession('https://example.com/event-annotation-lifecycle');
		const createResponse = await fetch(`${baseUrl}/sessions/${session.id}/annotations`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				x: 10,
				y: 20,
				comment: 'Reword this.',
				element: 'p',
				elementPath: 'main p',
				timestamp: 100,
				color: 'brand',
				isFixed: false
			})
		});
		expect(createResponse.status).toBe(201);
		const created = (await createResponse.json()) as Annotation;

		const events: SSEEvent[] = [];
		bus.subscribe((event) => events.push(event));

		const patchResponse = await fetch(`${baseUrl}/annotations/${created.id}`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'resolved' })
		});
		expect(patchResponse.status).toBe(200);

		const threadResponse = await fetch(`${baseUrl}/annotations/${created.id}/thread`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: 'agent', content: 'Resolved in the current patch.' })
		});
		expect(threadResponse.status).toBe(201);

		const deleteResponse = await fetch(`${baseUrl}/annotations/${created.id}`, {
			method: 'DELETE'
		});
		expect(deleteResponse.status).toBe(204);

		const missingPatch = await fetch(`${baseUrl}/annotations/missing-annotation`, {
			method: 'PATCH',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ status: 'resolved' })
		});
		expect(missingPatch.status).toBe(404);

		const missingThread = await fetch(`${baseUrl}/annotations/missing-annotation/thread`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ role: 'human', content: 'Any update?' })
		});
		expect(missingThread.status).toBe(404);

		const missingDelete = await fetch(`${baseUrl}/annotations/missing-annotation`, {
			method: 'DELETE'
		});
		expect(missingDelete.status).toBe(404);

		expect(events.map((event) => event.type)).toEqual([
			'annotation.updated',
			'thread.message',
			'annotation.deleted'
		]);
		expect(events.map((event) => event.sessionId)).toEqual([session.id, session.id, session.id]);
		expect(events[0]?.payload).toMatchObject({ id: created.id, status: 'resolved' });
		expect(events[1]?.payload).toMatchObject({
			id: created.id,
			thread: [
				expect.objectContaining({ role: 'agent', content: 'Resolved in the current patch.' })
			]
		});
		expect(events[2]?.payload).toMatchObject({ id: created.id });
	});
});
