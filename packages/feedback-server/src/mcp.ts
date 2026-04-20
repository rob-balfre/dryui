import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { FeedbackHttpClient } from './client.js';
import type { Annotation, Submission } from './types.js';

type FeedbackToolClient = Pick<
	FeedbackHttpClient,
	| 'listSessions'
	| 'getSession'
	| 'getPending'
	| 'getAllPending'
	| 'updateAnnotation'
	| 'addThreadMessage'
	| 'getSubmissions'
	| 'resolveSubmission'
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

/**
 * Shape a submission row for the MCP wire. We surface both screenshot paths,
 * the scroll offset at submit time, per-drawing hints (parallel array), and a
 * small `summary` block so agents can see drawing counts and top-level corners
 * without iterating. Existing fields pass through unchanged.
 */
function enrichSubmissionForResponse(submission: Submission): Record<string, unknown> {
	const drawings = submission.drawings ?? [];
	const hints = submission.hints ?? [];
	const kindCounts: Record<string, number> = {};
	for (const drawing of drawings) {
		const kind = drawing.kind ?? 'unknown';
		kindCounts[kind] = (kindCounts[kind] ?? 0) + 1;
	}

	const cornerCounts: Record<string, number> = {};
	for (const hint of hints) {
		cornerCounts[hint.corner] = (cornerCounts[hint.corner] ?? 0) + 1;
	}

	return {
		id: submission.id,
		url: submission.url,
		status: submission.status,
		createdAt: submission.createdAt,
		...(submission.agent ? { agent: submission.agent } : {}),
		screenshotPath: submission.screenshotPath,
		viewport: submission.viewport,
		scroll: submission.scroll ?? null,
		drawings,
		hints,
		summary: {
			drawingCount: drawings.length,
			hintCount: hints.length,
			drawingKinds: kindCounts,
			corners: cornerCounts
		}
	};
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
		'feedback_get_submissions',
		'Poll for pending feedback submissions. Returns both WebP and PNG screenshot paths, scroll offset at submit time, per-drawing position hints, and the raw drawings.',
		{
			timeoutSeconds: z
				.number()
				.int()
				.min(1)
				.max(60)
				.optional()
				.describe('Max seconds to wait (default 30)'),
			pollIntervalSeconds: z
				.number()
				.int()
				.min(1)
				.max(10)
				.optional()
				.describe('Polling interval in seconds (default 3)')
		},
		async ({ timeoutSeconds = 30, pollIntervalSeconds = 3 }) => {
			const startedAt = Date.now();

			while (Date.now() - startedAt < timeoutSeconds * 1000) {
				const result = await client.getSubmissions('pending');

				if (result.count > 0) {
					const submissions = result.submissions.map(enrichSubmissionForResponse);
					return {
						content: [
							{
								type: 'text',
								text: JSON.stringify({ timedOut: false, count: result.count, submissions }, null, 2)
							}
						]
					};
				}

				await new Promise((resolve) => setTimeout(resolve, pollIntervalSeconds * 1000));
			}

			return {
				content: [
					{
						type: 'text',
						text: JSON.stringify({ timedOut: true, count: 0, submissions: [] }, null, 2)
					}
				]
			};
		}
	);

	server.tool(
		'feedback_resolve_submission',
		'Mark a feedback submission as resolved after acting on it.',
		{
			submissionId: z.string().describe('Submission ID to resolve')
		},
		async ({ submissionId }) => {
			await client.resolveSubmission(submissionId);
			return {
				content: [{ type: 'text', text: `Submission ${submissionId} resolved.` }]
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
