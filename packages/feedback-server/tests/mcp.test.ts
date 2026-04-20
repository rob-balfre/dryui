import { describe, expect, test } from 'bun:test';
import { registerFeedbackTools } from '../src/mcp.ts';
import type {
	Annotation,
	PendingResponse,
	Session,
	SessionWithAnnotations,
	Submission
} from '../src/types.ts';

type ToolResult = Promise<{ content: Array<{ type: string; text: string }> }>;
type ToolHandler = (params: Record<string, unknown>) => ToolResult;

function createAnnotation(id: string): Annotation {
	return {
		id,
		sessionId: 'session-1',
		x: 10,
		y: 20,
		comment: 'Update the spacing.',
		element: 'button "Save"',
		elementPath: 'main button',
		timestamp: 123,
		status: 'pending',
		color: 'brand',
		isFixed: false
	};
}

function createPending(...annotations: Annotation[]): PendingResponse {
	return { count: annotations.length, annotations };
}

function createMockServer() {
	const handlers = new Map<string, ToolHandler>();

	return {
		server: {
			tool(name: string, _description: string, _schema: unknown, handler: ToolHandler) {
				handlers.set(name, handler);
			}
		},
		getHandler(name: string): ToolHandler {
			const handler = handlers.get(name);
			if (!handler) {
				throw new Error(`Missing handler: ${name}`);
			}
			return handler;
		}
	};
}

describe('feedback MCP tools', () => {
	test('acknowledge and resolve tools update annotations through the client', async () => {
		const updated: Array<{ id: string; body: Record<string, unknown> }> = [];
		const threadMessages: Array<{ id: string; content: string; role: 'human' | 'agent' }> = [];
		const annotation = createAnnotation('annotation-1');
		const mock = createMockServer();

		registerFeedbackTools(mock.server as never, {
			listSessions: async (): Promise<Session[]> => [],
			getSession: async (): Promise<SessionWithAnnotations> => ({
				id: 'session-1',
				url: 'https://example.com',
				status: 'active',
				createdAt: 'now',
				annotations: []
			}),
			getPending: async (): Promise<PendingResponse> => createPending(annotation),
			getAllPending: async (): Promise<PendingResponse> => createPending(annotation),
			updateAnnotation: async (id, body) => {
				updated.push({ id, body });
				return {
					...annotation,
					...(body as Partial<Annotation>)
				};
			},
			addThreadMessage: async (id, content, role) => {
				threadMessages.push({ id, content, role });
				return {
					...annotation,
					thread: [{ id: 'thread-1', role, content, timestamp: 456 }]
				};
			}
		});

		const acknowledge = await mock.getHandler('feedback_acknowledge')({
			annotationId: annotation.id
		});
		expect(acknowledge.content[0]?.text).toContain('Acknowledged');

		const resolve = await mock.getHandler('feedback_resolve')({
			annotationId: annotation.id,
			summary: 'Spacing updated in the current implementation.'
		});
		expect(resolve.content[0]?.text).toContain('Resolved');
		expect(updated).toEqual([
			{ id: 'annotation-1', body: { status: 'acknowledged' } },
			{
				id: 'annotation-1',
				body: {
					status: 'resolved',
					resolvedAt: expect.any(String),
					resolvedBy: 'agent'
				}
			}
		]);
		expect(threadMessages).toEqual([
			{
				id: 'annotation-1',
				content: 'Spacing updated in the current implementation.',
				role: 'agent'
			}
		]);
	});

	test('watch_annotations returns once pending feedback exists', async () => {
		const annotation = createAnnotation('annotation-2');
		let calls = 0;
		const mock = createMockServer();

		registerFeedbackTools(mock.server as never, {
			listSessions: async (): Promise<Session[]> => [],
			getSession: async (): Promise<SessionWithAnnotations> => ({
				id: 'session-1',
				url: 'https://example.com',
				status: 'active',
				createdAt: 'now',
				annotations: []
			}),
			getPending: async (): Promise<PendingResponse> => {
				calls += 1;
				return calls === 1 ? createPending() : createPending(annotation);
			},
			getAllPending: async (): Promise<PendingResponse> => createPending(annotation),
			updateAnnotation: async () => annotation,
			addThreadMessage: async () => annotation
		});

		const result = await mock.getHandler('feedback_watch_annotations')({
			sessionId: 'session-1',
			pollIntervalSeconds: 1,
			timeoutSeconds: 5
		});

		expect(result.content[0]?.text).toContain('"timedOut": false');
		expect(result.content[0]?.text).toContain(annotation.id);
		expect(calls).toBe(2);
	});

	test('get_submissions surfaces dual screenshot paths, scroll, hints, and summary', async () => {
		const submission: Submission = {
			id: 'sub-1',
			url: 'https://example.com/page',
			screenshotPath: {
				webp: '/tmp/sub-1.webp',
				png: '/tmp/sub-1.png'
			},
			drawings: [
				{
					id: 'arrow-1',
					kind: 'arrow',
					color: 'hsl(25 100% 55%)',
					start: { x: 100, y: 100 },
					end: { x: 200, y: 150 },
					width: 3
				},
				{
					id: 'text-1',
					kind: 'text',
					color: 'hsl(25 100% 55%)',
					position: { x: 2475, y: 59 },
					text: 'Too tight',
					fontSize: 16
				}
			],
			hints: [
				{
					corner: 'center',
					percentX: 58.6,
					percentY: 10.4,
					element: { tag: 'header', selector: 'header.page' }
				},
				{
					corner: 'top-right',
					percentX: 96.7,
					percentY: 4.1,
					element: { tag: 'button', id: 'close-btn', selector: 'button#close-btn' }
				}
			],
			viewport: { width: 2560, height: 1440 },
			scroll: { x: 0, y: 420 },
			status: 'pending',
			createdAt: '2026-04-20T12:00:00.000Z'
		};
		const mock = createMockServer();

		registerFeedbackTools(mock.server as never, {
			listSessions: async (): Promise<Session[]> => [],
			getSession: async (): Promise<SessionWithAnnotations> => ({
				id: 'session-1',
				url: 'https://example.com',
				status: 'active',
				createdAt: 'now',
				annotations: []
			}),
			getPending: async (): Promise<PendingResponse> => createPending(),
			getAllPending: async (): Promise<PendingResponse> => createPending(),
			updateAnnotation: async () => createAnnotation('x'),
			addThreadMessage: async () => createAnnotation('x'),
			getSubmissions: async () => ({ count: 1, submissions: [submission] }),
			resolveSubmission: async () => undefined
		});

		const result = await mock.getHandler('feedback_get_submissions')({
			timeoutSeconds: 2,
			pollIntervalSeconds: 1
		});

		const text = result.content[0]?.text ?? '';
		const payload = JSON.parse(text) as {
			timedOut: boolean;
			count: number;
			submissions: Array<{
				id: string;
				screenshotPath: { webp: string; png: string };
				scroll: { x: number; y: number } | null;
				hints: Array<{ corner: string; percentX: number; percentY: number }>;
				summary: {
					drawingCount: number;
					hintCount: number;
					drawingKinds: Record<string, number>;
					corners: Record<string, number>;
				};
			}>;
		};

		expect(payload.timedOut).toBe(false);
		expect(payload.count).toBe(1);
		expect(payload.submissions[0]?.screenshotPath).toEqual({
			webp: '/tmp/sub-1.webp',
			png: '/tmp/sub-1.png'
		});
		expect(payload.submissions[0]?.scroll).toEqual({ x: 0, y: 420 });
		expect(payload.submissions[0]?.hints).toHaveLength(2);
		expect(payload.submissions[0]?.summary).toEqual({
			drawingCount: 2,
			hintCount: 2,
			drawingKinds: { arrow: 1, text: 1 },
			corners: { center: 1, 'top-right': 1 }
		});
	});
});
