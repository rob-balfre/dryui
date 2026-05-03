import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	DEFAULT_FEEDBACK_URL,
	findProjectFeedbackConfig,
	readFeedbackServerConfig
} from './config.js';
import type {
	Annotation,
	CreateSubmissionInput,
	PendingResponse,
	Session,
	SessionWithAnnotations,
	Submission,
	SubmissionQueryStatus,
	SubmissionStatus
} from './types.js';

function trimTrailingSlash(value: string): string {
	return value.replace(/\/$/, '');
}

export interface ResolveFeedbackBaseUrlOptions {
	/** Explicit base URL takes precedence over everything. */
	baseUrl?: string;
	/** Project root to read `.dryui/feedback/server.json` from. */
	projectRoot?: string;
	/** Walk up from this directory looking for a project config. */
	cwd?: string;
}

/**
 * Resolve the feedback base URL for a given project context.
 *
 * Priority: explicit baseUrl > DRYUI_FEEDBACK_URL > project config (exact root)
 * > project config (walking up from cwd) > DRYUI_FEEDBACK_HOST/PORT env pair
 * > DEFAULT_FEEDBACK_URL.
 */
export function resolveFeedbackBaseUrl(
	options: ResolveFeedbackBaseUrlOptions | string = {}
): string {
	const opts: ResolveFeedbackBaseUrlOptions =
		typeof options === 'string' ? { baseUrl: options } : options;
	if (opts.baseUrl) return trimTrailingSlash(opts.baseUrl);
	const envUrl = process.env['DRYUI_FEEDBACK_URL'];
	if (envUrl) return trimTrailingSlash(envUrl);

	if (opts.projectRoot) {
		const config = readFeedbackServerConfig(opts.projectRoot);
		if (config?.baseUrl) return trimTrailingSlash(config.baseUrl);
	}

	const discovered = findProjectFeedbackConfig(opts.cwd ?? process.cwd());
	if (discovered?.config.baseUrl) {
		return trimTrailingSlash(discovered.config.baseUrl);
	}

	const envHost = process.env['DRYUI_FEEDBACK_HOST'] ?? DEFAULT_FEEDBACK_HOST;
	const envPort = Number(process.env['DRYUI_FEEDBACK_PORT'] ?? DEFAULT_FEEDBACK_PORT);
	if (Number.isFinite(envPort) && envPort > 0) {
		return `http://${envHost}:${envPort}`;
	}

	return DEFAULT_FEEDBACK_URL;
}

async function ensureOk(response: Response): Promise<void> {
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`HTTP ${response.status}: ${body}`);
	}
}

async function parseJson<T>(response: Response): Promise<T> {
	await ensureOk(response);
	return response.json() as Promise<T>;
}

export class FeedbackHttpClient {
	readonly baseUrl: string;

	constructor(input?: string | ResolveFeedbackBaseUrlOptions) {
		this.baseUrl = resolveFeedbackBaseUrl(input);
	}

	async listSessions(): Promise<Session[]> {
		return parseJson<Session[]>(await fetch(`${this.baseUrl}/sessions`));
	}

	async getSession(sessionId: string): Promise<SessionWithAnnotations> {
		return parseJson<SessionWithAnnotations>(
			await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(sessionId)}`)
		);
	}

	async getPending(sessionId: string): Promise<PendingResponse> {
		return parseJson<PendingResponse>(
			await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(sessionId)}/pending`)
		);
	}

	async getAllPending(): Promise<PendingResponse> {
		return parseJson<PendingResponse>(await fetch(`${this.baseUrl}/pending`));
	}

	async updateAnnotation(annotationId: string, body: Record<string, unknown>): Promise<Annotation> {
		return parseJson<Annotation>(
			await fetch(`${this.baseUrl}/annotations/${encodeURIComponent(annotationId)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body)
			})
		);
	}

	async addThreadMessage(
		annotationId: string,
		content: string,
		role: 'human' | 'agent' = 'agent'
	): Promise<Annotation> {
		return parseJson<Annotation>(
			await fetch(`${this.baseUrl}/annotations/${encodeURIComponent(annotationId)}/thread`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ role, content })
			})
		);
	}

	async getDrawings(url: string): Promise<unknown[]> {
		return parseJson<unknown[]>(
			await fetch(`${this.baseUrl}/drawings?url=${encodeURIComponent(url)}`)
		);
	}

	async saveDrawings(url: string, drawings: unknown[]): Promise<void> {
		await ensureOk(
			await fetch(`${this.baseUrl}/drawings?url=${encodeURIComponent(url)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(drawings)
			})
		);
	}

	async submitFeedback(input: CreateSubmissionInput): Promise<Submission> {
		return parseJson<Submission>(
			await fetch(`${this.baseUrl}/submissions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(input)
			})
		);
	}

	async getSubmissions(
		status: SubmissionQueryStatus = 'all'
	): Promise<{ count: number; submissions: Submission[] }> {
		return parseJson<{ count: number; submissions: Submission[] }>(
			await fetch(`${this.baseUrl}/submissions?status=${encodeURIComponent(status)}`)
		);
	}

	async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<void> {
		await ensureOk(
			await fetch(`${this.baseUrl}/submissions/${encodeURIComponent(id)}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status })
			})
		);
	}

	async deleteSubmission(id: string): Promise<void> {
		await ensureOk(
			await fetch(`${this.baseUrl}/submissions/${encodeURIComponent(id)}`, {
				method: 'DELETE'
			})
		);
	}

	async resolveSubmission(id: string): Promise<void> {
		await this.updateSubmissionStatus(id, 'resolved');
	}

	async health(): Promise<{ status: string }> {
		return parseJson<{ status: string }>(await fetch(`${this.baseUrl}/health`));
	}

	async status(): Promise<{ activeListeners: number; agentListeners: number }> {
		return parseJson<{ activeListeners: number; agentListeners: number }>(
			await fetch(`${this.baseUrl}/status`)
		);
	}
}

export function parsePort(input: string | undefined, fallback = DEFAULT_FEEDBACK_PORT): number {
	if (!input) return fallback;
	const value = Number(input);
	if (!Number.isFinite(value) || value <= 0) return fallback;
	return value;
}
