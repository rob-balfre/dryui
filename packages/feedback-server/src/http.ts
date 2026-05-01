import { sep, isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { KEEPALIVE_INTERVAL_MS } from './config.js';
import {
	dispatchPrompt,
	getDispatchTargetsSnapshot,
	isDispatchPlatformSupported,
	DISPATCH_AGENTS,
	type DispatchAgent,
	type DispatcherOptions
} from './dispatch.js';
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
	SubmissionQueryStatus,
	SubmissionStatus,
	ThreadMessage,
	UpdateAnnotationInput
} from './types.js';

const CORS_HEADERS: Record<string, string> = {
	'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-DryUI-Feedback-Token'
};
// In dev, set DRYUI_FEEDBACK_UI_DIR to a path that `vite build --watch` is writing
// into so dashboard edits show up without rebuilding the whole package. Falls back
// to ../dist/ui (the bundled UI shipped with the package).
const UI_DIST_DIR = process.env['DRYUI_FEEDBACK_UI_DIR']
	? resolve(process.cwd(), process.env['DRYUI_FEEDBACK_UI_DIR'])
	: resolve(fileURLToPath(new URL('../dist/ui', import.meta.url)));

export interface FeedbackHttpSecurityOptions {
	allowedOrigins?: string[];
	authToken?: string;
}

export interface FeedbackHttpServerOptions {
	port: number;
	host: string;
	dispatcher?: DispatcherOptions;
	security?: FeedbackHttpSecurityOptions;
}

interface RequestAccess {
	allowed: boolean;
	headers: Record<string, string>;
}

function normalizeOrigin(input: string): string | null {
	try {
		const url = new URL(input);
		return url.origin === 'null' ? null : url.origin;
	} catch {
		return null;
	}
}

function stripIpv6Brackets(hostname: string): string {
	return hostname.startsWith('[') && hostname.endsWith(']') ? hostname.slice(1, -1) : hostname;
}

function isPrivateOrLoopbackIpv4(hostname: string): boolean {
	const parts = hostname.split('.').map((part) => Number(part));
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return false;
	}

	const [first = -1, second = -1] = parts;
	return (
		first === 10 ||
		first === 127 ||
		first === 0 ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 168) ||
		(first === 169 && second === 254)
	);
}

function isLocalDevOrigin(origin: string): boolean {
	try {
		const url = new URL(origin);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return false;
		const hostname = stripIpv6Brackets(url.hostname.toLowerCase());
		return (
			hostname === 'localhost' ||
			hostname.endsWith('.localhost') ||
			hostname === '::1' ||
			isPrivateOrLoopbackIpv4(hostname)
		);
	} catch {
		return false;
	}
}

function hasAuthorizedToken(request: Request, token: string | undefined): boolean {
	if (!token) return false;
	const authorization = request.headers.get('authorization')?.trim();
	if (authorization === `Bearer ${token}`) return true;
	return request.headers.get('x-dryui-feedback-token') === token;
}

function isAllowedOrigin(
	origin: string,
	requestUrl: URL,
	security: FeedbackHttpSecurityOptions | undefined
): boolean {
	if (origin === requestUrl.origin) return true;
	if (security?.allowedOrigins?.some((allowed) => normalizeOrigin(allowed) === origin)) return true;
	return isLocalDevOrigin(origin);
}

function accessHeaders(origin: string | null, request: Request): Record<string, string> {
	if (!origin) return CORS_HEADERS;
	const headers: Record<string, string> = {
		...CORS_HEADERS,
		'Access-Control-Allow-Origin': origin,
		Vary: 'Origin'
	};
	if (request.headers.get('access-control-request-private-network') === 'true') {
		headers['Access-Control-Allow-Private-Network'] = 'true';
	}
	return headers;
}

function requestAccess(
	request: Request,
	requestUrl: URL,
	security: FeedbackHttpSecurityOptions | undefined
): RequestAccess {
	const originHeader = request.headers.get('origin');
	const tokenAuthorized = hasAuthorizedToken(request, security?.authToken);

	if (originHeader) {
		const origin = normalizeOrigin(originHeader);
		const originAllowed = origin ? isAllowedOrigin(origin, requestUrl, security) : false;
		return {
			allowed: originAllowed || tokenAuthorized,
			headers: accessHeaders(originAllowed || tokenAuthorized ? origin : null, request)
		};
	}

	if (!tokenAuthorized && request.headers.get('sec-fetch-site')?.toLowerCase() === 'cross-site') {
		// Cross-site fetch/script requests stay blocked — that's the CSRF surface.
		// User-initiated top-level document navigation (clicking a link from one
		// local-dev origin to another) is safe: there's no ambient credentials and
		// the destination just renders the dashboard. Allow it.
		const mode = request.headers.get('sec-fetch-mode')?.toLowerCase();
		const dest = request.headers.get('sec-fetch-dest')?.toLowerCase();
		if (request.method === 'GET' && mode === 'navigate' && dest === 'document') {
			return { allowed: true, headers: CORS_HEADERS };
		}
		return { allowed: false, headers: CORS_HEADERS };
	}

	return { allowed: true, headers: CORS_HEADERS };
}

function withAccessHeaders(response: Response, headers: Record<string, string>): Response {
	for (const [key, value] of Object.entries(headers)) {
		if (key === 'Vary') {
			const current = response.headers.get(key);
			if (
				current &&
				!current
					.split(',')
					.map((part) => part.trim())
					.includes(value)
			) {
				response.headers.set(key, `${current}, ${value}`);
			} else {
				response.headers.set(key, value);
			}
			continue;
		}
		response.headers.set(key, value);
	}
	return response;
}

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

const NO_STORE_HEADERS: Record<string, string> = {
	'Cache-Control': 'no-store, max-age=0, must-revalidate',
	Pragma: 'no-cache'
};

function resolveStaticAsset(rootDir: string, assetPath: string): string | null {
	const candidate = resolve(rootDir, assetPath);
	if (candidate !== rootDir && !candidate.startsWith(rootDir + sep)) return null;
	if (isAbsolute(assetPath)) return null;
	return candidate;
}

async function fileResponse(
	filePath: string,
	headers: Record<string, string> = {}
): Promise<Response | null> {
	const file = Bun.file(filePath);
	if (!(await file.exists())) return null;
	return new Response(file, { status: 200, headers });
}

async function uiResponse(requestUrl: URL): Promise<Response | null> {
	const { pathname } = requestUrl;

	if (pathname !== '/ui' && !pathname.startsWith('/ui/')) {
		return null;
	}

	const assetPath =
		pathname === '/ui' || pathname === '/ui/'
			? 'index.html'
			: decodeURIComponent(pathname.slice('/ui/'.length));
	const resolvedPath = resolveStaticAsset(UI_DIST_DIR, assetPath);
	if (!resolvedPath) {
		return errorResponse(403, 'Forbidden');
	}

	const response = await fileResponse(resolvedPath, NO_STORE_HEADERS);
	if (response) return response;

	if (pathname === '/ui' || pathname === '/ui/') {
		return errorResponse(503, 'Feedback UI is not built');
	}
	return errorResponse(404, 'Not found');
}

function isSubmissionQueryStatus(value: string | null): value is SubmissionQueryStatus {
	return value === null || value === 'pending' || value === 'resolved' || value === 'all';
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
	options: FeedbackHttpServerOptions
): { stop(): void; hostname: string; port: number } {
	return Bun.serve({
		hostname: options.host,
		port: options.port,
		idleTimeout: 255,
		async fetch(request, server) {
			const url = new URL(request.url);
			const { pathname } = url;
			const access = requestAccess(request, url, options.security);

			if (!access.allowed) {
				return withAccessHeaders(errorResponse(403, 'Forbidden origin'), access.headers);
			}

			if (request.method === 'OPTIONS') {
				return new Response(null, { status: 204, headers: access.headers });
			}

			const route = async (): Promise<Response> => {
				if (request.method === 'GET') {
					const feedbackUi = await uiResponse(url);
					if (feedbackUi) return feedbackUi;
				}

				if (pathname === '/health' && request.method === 'GET') {
					return json({ status: 'ok' });
				}

				if (pathname === '/status' && request.method === 'GET') {
					return json(bus.counts());
				}

				if (pathname === '/dispatch-targets' && request.method === 'GET') {
					if (!options.dispatcher) {
						return json({
							defaultAgent: 'codex',
							configuredAgents: [],
							skillPath: null
						});
					}

					return json(getDispatchTargetsSnapshot(options.dispatcher));
				}

				if (pathname === '/dispatch' && request.method === 'POST') {
					if (!options.dispatcher) {
						return errorResponse(503, 'Dispatcher not configured');
					}
					if (!isDispatchPlatformSupported()) {
						return errorResponse(503, 'Dispatcher not supported on this platform');
					}

					let body: { agent?: unknown; prompt?: unknown; submissionId?: unknown };
					try {
						body = await readJson(request);
					} catch {
						return errorResponse(400, 'Invalid JSON');
					}

					const agent = body.agent;
					if (typeof agent !== 'string' || !DISPATCH_AGENTS.includes(agent as DispatchAgent)) {
						return errorResponse(400, 'Invalid agent');
					}
					const prompt = body.prompt;
					if (typeof prompt !== 'string' || prompt.trim().length === 0) {
						return errorResponse(400, 'Missing prompt');
					}

					// Prefer the submission's captured workspace so deeplinks survive
					// the server being restarted from a different cwd.
					const pinned =
						typeof body.submissionId === 'string' && body.submissionId.length > 0
							? store.getSubmission(body.submissionId)
							: null;
					const workspace = pinned?.workspace ?? options.dispatcher.workspace;

					dispatchPrompt(agent as DispatchAgent, prompt, {
						...options.dispatcher,
						workspace
					});
					return json({ dispatched: true, agent }, 202);
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
						if (!body.url) return errorResponse(400, 'Missing url');
						if (
							!body.image ||
							typeof body.image !== 'object' ||
							typeof body.image.webp !== 'string' ||
							typeof body.image.png !== 'string'
						) {
							return errorResponse(400, 'Missing image.webp or image.png');
						}
						const submission = store.createSubmission(body, {
							workspace: options.dispatcher?.workspace
						});
						bus.emit(sessionEvent('submission.created', submission.url, submission));
						return json(submission, 201);
					} catch {
						return errorResponse(400, 'Invalid JSON');
					}
				}

				if (pathname === '/submissions' && request.method === 'GET') {
					const status = url.searchParams.get('status');
					if (!isSubmissionQueryStatus(status)) {
						return errorResponse(400, 'Invalid submission status filter');
					}

					const submissions = store.listSubmissions(status ?? 'pending');
					return json({ count: submissions.length, submissions });
				}

				const submissionScreenshotMatch = pathname.match(/^\/submissions\/([^/]+)\/screenshot$/);
				if (submissionScreenshotMatch && request.method === 'GET') {
					const submissionId = decodeURIComponent(submissionScreenshotMatch[1] ?? '');
					const submission = store.getSubmission(submissionId);
					if (!submission) return errorResponse(404, 'Not found');
					// Format selector: ?format=png or ?format=webp. PNG has an empty
					// string path for legacy rows, in which case we fall back to WebP.
					const requested = url.searchParams.get('format');
					const pngPath = submission.screenshotPath.png;
					const targetPath =
						requested === 'png' && pngPath ? pngPath : submission.screenshotPath.webp;
					return (await fileResponse(targetPath)) ?? errorResponse(404, 'Not found');
				}

				const submissionMatch = pathname.match(/^\/submissions\/([^/]+)$/);
				if (submissionMatch && request.method === 'GET') {
					// Single-submission lookup. The dryui-feedback skill points the
					// dispatched agent at this URL as the curl fallback when MCP
					// `feedback_get_submissions` is unavailable.
					const submissionId = decodeURIComponent(submissionMatch[1] ?? '');
					const submission = store.getSubmission(submissionId);
					if (!submission) return errorResponse(404, 'Not found');
					return json(submission);
				}
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
			};

			return withAccessHeaders(await route(), access.headers);
		},
		error(error) {
			return errorResponse(500, error.message);
		}
	});
}
