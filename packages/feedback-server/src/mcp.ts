import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { FeedbackHttpClient } from './client.js';
import type { Annotation } from './types.js';

type FeedbackToolClient = Pick<
	FeedbackHttpClient,
	| 'listSessions'
	| 'getSession'
	| 'getPending'
	| 'getAllPending'
	| 'updateAnnotation'
	| 'addThreadMessage'
>;

type ToolRegistrar = Pick<McpServer, 'tool'>;

function formatAnnotation(annotation: Annotation): string {
	const lines = [
		`ID: ${annotation.id}`,
		`Element: ${annotation.element}`,
		`Path: ${annotation.elementPath}`,
		`Comment: ${annotation.comment}`,
		`Status: ${annotation.status ?? 'pending'}`
	];

	if (annotation.intent) lines.push(`Intent: ${annotation.intent}`);
	if (annotation.severity) lines.push(`Severity: ${annotation.severity}`);
	if (annotation.svelteComponents) lines.push(`Svelte: ${annotation.svelteComponents}`);

	return lines.join('\n');
}

export function registerFeedbackTools(server: ToolRegistrar, client: FeedbackToolClient): void {
	server.tool('feedback_list_sessions', 'List active feedback sessions.', {}, async () => {
		const sessions = await client.listSessions();
		return {
			content: [{ type: 'text', text: JSON.stringify(sessions, null, 2) }]
		};
	});

	server.tool(
		'feedback_get_session',
		'Get a feedback session and its annotations.',
		{
			sessionId: z.string().describe('Feedback session ID')
		},
		async ({ sessionId }) => {
			const session = await client.getSession(sessionId);
			return {
				content: [{ type: 'text', text: JSON.stringify(session, null, 2) }]
			};
		}
	);

	server.tool(
		'feedback_get_pending',
		'Get pending annotations for a session.',
		{
			sessionId: z.string().describe('Feedback session ID')
		},
		async ({ sessionId }) => {
			const pending = await client.getPending(sessionId);
			return {
				content: [{ type: 'text', text: JSON.stringify(pending, null, 2) }]
			};
		}
	);

	server.tool(
		'feedback_get_all_pending',
		'Get all pending annotations across sessions.',
		{},
		async () => {
			const pending = await client.getAllPending();
			return {
				content: [{ type: 'text', text: JSON.stringify(pending, null, 2) }]
			};
		}
	);

	server.tool(
		'feedback_acknowledge',
		'Mark an annotation as acknowledged.',
		{
			annotationId: z.string().describe('Annotation ID')
		},
		async ({ annotationId }) => {
			const annotation = await client.updateAnnotation(annotationId, { status: 'acknowledged' });
			return {
				content: [{ type: 'text', text: `Acknowledged\n\n${formatAnnotation(annotation)}` }]
			};
		}
	);

	server.tool(
		'feedback_resolve',
		'Mark an annotation as resolved and optionally add a summary.',
		{
			annotationId: z.string().describe('Annotation ID'),
			summary: z.string().optional().describe('Optional resolution summary')
		},
		async ({ annotationId, summary }) => {
			const annotation = await client.updateAnnotation(annotationId, {
				status: 'resolved',
				resolvedAt: new Date().toISOString(),
				resolvedBy: 'agent'
			});

			if (summary) {
				await client.addThreadMessage(annotationId, summary, 'agent');
			}

			return {
				content: [{ type: 'text', text: `Resolved\n\n${formatAnnotation(annotation)}` }]
			};
		}
	);

	server.tool(
		'feedback_dismiss',
		'Dismiss an annotation with a reason.',
		{
			annotationId: z.string().describe('Annotation ID'),
			reason: z.string().describe('Dismissal reason')
		},
		async ({ annotationId, reason }) => {
			const annotation = await client.updateAnnotation(annotationId, {
				status: 'dismissed'
			});
			await client.addThreadMessage(annotationId, reason, 'agent');
			return {
				content: [{ type: 'text', text: `Dismissed\n\n${formatAnnotation(annotation)}` }]
			};
		}
	);

	server.tool(
		'feedback_reply',
		'Reply to an annotation thread.',
		{
			annotationId: z.string().describe('Annotation ID'),
			message: z.string().describe('Reply content')
		},
		async ({ annotationId, message }) => {
			const annotation = await client.addThreadMessage(annotationId, message, 'agent');
			return {
				content: [{ type: 'text', text: `Replied\n\n${formatAnnotation(annotation)}` }]
			};
		}
	);

	server.tool(
		'feedback_watch_annotations',
		'Poll pending annotations until something appears or the timeout expires.',
		{
			sessionId: z.string().optional().describe('Optional session filter'),
			pollIntervalSeconds: z
				.number()
				.int()
				.min(1)
				.max(10)
				.optional()
				.describe('Polling interval in seconds'),
			timeoutSeconds: z.number().int().min(1).max(300).optional().describe('Timeout in seconds')
		},
		async ({ sessionId, pollIntervalSeconds = 3, timeoutSeconds = 120 }) => {
			const startedAt = Date.now();

			while (Date.now() - startedAt < timeoutSeconds * 1000) {
				const pending = sessionId
					? await client.getPending(sessionId)
					: await client.getAllPending();

				if (pending.count > 0) {
					return {
						content: [
							{ type: 'text', text: JSON.stringify({ timedOut: false, ...pending }, null, 2) }
						]
					};
				}

				await new Promise((resolve) => setTimeout(resolve, pollIntervalSeconds * 1000));
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ timedOut: true, count: 0, annotations: [] }, null, 2)
					}
				]
			};
		}
	);
}

export function createFeedbackMcpServer(baseUrl?: string): McpServer {
	const client = new FeedbackHttpClient(baseUrl);
	const server = new McpServer({ name: '@dryui/feedback-server', version: '0.0.1' });

	registerFeedbackTools(server, client);

	return server;
}

async function main(): Promise<void> {
	const server = createFeedbackMcpServer();
	await server.connect(new StdioServerTransport());
}

if (import.meta.main) {
	await main();
}
