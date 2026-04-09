import { KEEPALIVE_INTERVAL_MS } from './config.js';
import { EventBus } from './events.js';
import { FeedbackStore } from './store.js';
import type {
	ActionRequest,
	ActionResponse,
	Annotation,
	CreateAnnotationInput,
	CreateSessionInput,
	CreateSubmissionInput,
	PendingResponse,
	SSEEvent,
	SubmissionStatus,
	ThreadMessage,
	UpdateAnnotationInput
} from './types.js';

const CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type'
};

function json(data: unknown, status = 200): Response {
	return Response.json(data, {
		status,
		headers: CORS_HEADERS
	});
}

function errorResponse(status: number, error: string): Response {
	return json({ error, status }, status);
}

function sseMessage(event: SSEEvent): string {
	return `event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`;
}

function annotationEvent(type: string, annotation: Annotation): SSEEvent<Annotation> {
	return {
		type,
		timestamp: new Date().toISOString(),
		sessionId: annotation.sessionId,
		payload: annotation
	};
}

function sessionEvent(type: string, sessionId: string, payload: unknown): SSEEvent {
	return {
		type,
		timestamp: new Date().toISOString(),
		sessionId,
		payload
	};
}

async function readJson<T>(request: Request): Promise<T> {
	return request.json() as Promise<T>;
}

function domainMatches(input: string | null, domain: string | null): boolean {
	if (!domain) return true;
	if (!input) return false;

	try {
		const url = new URL(input);
		return url.hostname === domain;
	} catch {
		return false;
	}
}

function pendingResponse(annotations: Annotation[]): PendingResponse {
	return {
		count: annotations.length,
		annotations
	};
}

function createEventStream(
	request: Request,
	bus: EventBus,
	options: {
		agent?: boolean;
		matches?(event: SSEEvent): boolean;
	}
): Response {
	const encoder = new TextEncoder();

	const stream = new ReadableStream<Uint8Array>({
		start(controller) {
			let closed = false;
			const send = (chunk: string) => {
				if (closed) return;
				controller.enqueue(encoder.encode(chunk));
			};

			const unsubscribe = bus.subscribe((event) => {
				send(sseMessage(event));
			}, options);

			const keepalive = setInterval(() => {
				send(': keepalive\n\n');
			}, KEEPALIVE_INTERVAL_MS);

			const close = () => {
				if (closed) return;
				closed = true;
				clearInterval(keepalive);
				unsubscribe();
				controller.close();
			};

			request.signal.addEventListener('abort', close, { once: true });
		}
	});

	return new Response(stream, {
		status: 200,
		headers: {
			...CORS_HEADERS,
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			Connection: 'keep-alive'
		}
	});
}

export function startFeedbackHttpServer(
	store: FeedbackStore,
	bus: EventBus,
	options: { port: number; host: string }
): { stop(): void; hostname: string; port: number } {
	return Bun.serve({
		hostname: options.host,
		port: options.port,
		idleTimeout: 255,
		async fetch(request, server) {
			const url = new URL(request.url);
			const { pathname } = url;

			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}

			if (pathname === '/health' && request.method === 'GET') {
				return json({ status: 'ok' });
			}

			if (pathname === '/status' && request.method === 'GET') {
				return json(bus.counts());
			}

			if (pathname === '/sessions' && request.method === 'POST') {
				try {
					const body = await readJson<CreateSessionInput>(request);
					if (!body.url) return errorResponse(400, 'Missing url');
					const session = store.createSession(body);
					bus.emit(sessionEvent('session.created', session.id, session));
					return json(session, 201);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			if (pathname === '/sessions' && request.method === 'GET') {
				return json(store.listSessions());
			}

			const sessionMatch = pathname.match(/^\/sessions\/([^/]+)$/);
			if (sessionMatch && request.method === 'GET') {
				const sessionId = decodeURIComponent(sessionMatch[1] ?? '');
				const session = store.getSessionWithAnnotations(sessionId);
				if (!session) return errorResponse(404, 'Not found');
				return json(session);
			}

			const sessionPendingMatch = pathname.match(/^\/sessions\/([^/]+)\/pending$/);
			if (sessionPendingMatch && request.method === 'GET') {
				const sessionId = decodeURIComponent(sessionPendingMatch[1] ?? '');
				const session = store.getSession(sessionId);
				if (!session) return errorResponse(404, 'Not found');
				return json(pendingResponse(store.getPending(sessionId)));
			}

			const sessionAnnotationsMatch = pathname.match(/^\/sessions\/([^/]+)\/annotations$/);
			if (sessionAnnotationsMatch && request.method === 'POST') {
				const sessionId = decodeURIComponent(sessionAnnotationsMatch[1] ?? '');
				const session = store.getSession(sessionId);
				if (!session) return errorResponse(404, 'Not found');

				try {
					const body = await readJson<CreateAnnotationInput>(request);
					const annotation = store.createAnnotation(sessionId, body);
					bus.emit(annotationEvent('annotation.created', annotation));
					return json(annotation, 201);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			const sessionActionMatch = pathname.match(/^\/sessions\/([^/]+)\/action$/);
			if (sessionActionMatch && request.method === 'POST') {
				const sessionId = decodeURIComponent(sessionActionMatch[1] ?? '');
				const session = store.getSession(sessionId);
				if (!session) return errorResponse(404, 'Not found');

				try {
					const body = await readJson<ActionRequest>(request);
					const delivered = bus.emit(
						sessionEvent('action.requested', sessionId, { ...body, sessionId })
					);
					const response: ActionResponse = {
						success: true,
						annotationCount: store.getPending(sessionId).length,
						delivered: {
							sseListeners: delivered.activeListeners,
							webhooks: 0,
							total: delivered.activeListeners
						}
					};
					return json(response, 202);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			const sessionEventsMatch = pathname.match(/^\/sessions\/([^/]+)\/events$/);
			if (sessionEventsMatch && request.method === 'GET') {
				server.timeout(request, 0);
				const sessionId = decodeURIComponent(sessionEventsMatch[1] ?? '');
				const session = store.getSession(sessionId);
				if (!session) return errorResponse(404, 'Not found');
				return createEventStream(request, bus, {
					matches(event) {
						return event.sessionId === sessionId;
					}
				});
			}

			if (pathname === '/pending' && request.method === 'GET') {
				return json(pendingResponse(store.getPending()));
			}

			if (pathname === '/events' && request.method === 'GET') {
				server.timeout(request, 0);
				const agent = url.searchParams.get('agent') === 'true';
				const domain = url.searchParams.get('domain');
				return createEventStream(request, bus, {
					agent,
					matches(event) {
						return domainMatches(store.getSessionUrl(event.sessionId), domain);
					}
				});
			}

			if (pathname === '/drawings' && request.method === 'GET') {
				const drawingsUrl = url.searchParams.get('url');
				if (!drawingsUrl) return errorResponse(400, 'Missing url parameter');
				return json(store.getDrawings(drawingsUrl));
			}

			if (pathname === '/drawings' && request.method === 'PUT') {
				const drawingsUrl = url.searchParams.get('url');
				if (!drawingsUrl) return errorResponse(400, 'Missing url parameter');
				try {
					const body = await readJson<unknown[]>(request);
					store.saveDrawings(drawingsUrl, body);
					bus.emit(sessionEvent('drawings.updated', drawingsUrl, { url: drawingsUrl }));
					return new Response(null, { status: 204, headers: CORS_HEADERS });
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			if (pathname === '/submissions' && request.method === 'POST') {
				try {
					const body = await readJson<CreateSubmissionInput>(request);
					if (!body.url || !body.image) return errorResponse(400, 'Missing url or image');
					const submission = store.createSubmission(body);
					bus.emit(sessionEvent('submission.created', submission.url, submission));
					return json(submission, 201);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			if (pathname === '/submissions' && request.method === 'GET') {
				const submissions = store.getPendingSubmissions();
				return json({ count: submissions.length, submissions });
			}

			const submissionMatch = pathname.match(/^\/submissions\/([^/]+)$/);
			if (submissionMatch && request.method === 'PATCH') {
				const submissionId = decodeURIComponent(submissionMatch[1] ?? '');
				try {
					const body = await readJson<{ status: SubmissionStatus }>(request);
					const submission = store.updateSubmissionStatus(submissionId, body.status);
					if (!submission) return errorResponse(404, 'Not found');
					bus.emit(sessionEvent('submission.updated', submission.url, submission));
					return json(submission);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			const annotationMatch = pathname.match(/^\/annotations\/([^/]+)$/);
			if (annotationMatch && request.method === 'GET') {
				const annotationId = decodeURIComponent(annotationMatch[1] ?? '');
				const annotation = store.getAnnotation(annotationId);
				if (!annotation) return errorResponse(404, 'Not found');
				return json(annotation);
			}

			if (annotationMatch && request.method === 'PATCH') {
				const annotationId = decodeURIComponent(annotationMatch[1] ?? '');
				try {
					const body = await readJson<UpdateAnnotationInput>(request);
					const annotation = store.updateAnnotation(annotationId, body);
					if (!annotation) return errorResponse(404, 'Not found');
					bus.emit(annotationEvent('annotation.updated', annotation));
					return json(annotation);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			if (annotationMatch && request.method === 'DELETE') {
				const annotationId = decodeURIComponent(annotationMatch[1] ?? '');
				const annotation = store.deleteAnnotation(annotationId);
				if (!annotation) return errorResponse(404, 'Not found');
				bus.emit(annotationEvent('annotation.deleted', annotation));
				return new Response(null, { status: 204, headers: CORS_HEADERS });
			}

			const annotationThreadMatch = pathname.match(/^\/annotations\/([^/]+)\/thread$/);
			if (annotationThreadMatch && request.method === 'POST') {
				const annotationId = decodeURIComponent(annotationThreadMatch[1] ?? '');
				try {
					const body = await readJson<Pick<ThreadMessage, 'role' | 'content'>>(request);
					if (!body.role || !body.content) return errorResponse(400, 'Missing role or content');
					const annotation = store.addThreadMessage(annotationId, body);
					if (!annotation) return errorResponse(404, 'Not found');
					bus.emit(sessionEvent('thread.message', annotation.sessionId, annotation));
					return json(annotation, 201);
				} catch {
					return errorResponse(400, 'Invalid JSON');
				}
			}

			return errorResponse(404, 'Not found');
		},
		error(error) {
			return errorResponse(500, error.message);
		}
	});
}
