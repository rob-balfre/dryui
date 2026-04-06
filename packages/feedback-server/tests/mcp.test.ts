import { describe, expect, test } from 'bun:test';
import { registerFeedbackTools } from '../src/mcp.ts';
import type { Annotation, PendingResponse, Session, SessionWithAnnotations } from '../src/types.ts';

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
});
