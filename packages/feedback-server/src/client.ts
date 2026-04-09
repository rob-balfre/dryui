import {
	DEFAULT_FEEDBACK_HOST,
	DEFAULT_FEEDBACK_PORT,
	DEFAULT_FEEDBACK_URL,
	readFeedbackServerConfig
} from './config.js';
import type { Annotation, PendingResponse, Session, SessionWithAnnotations } from './types.js';

function trimTrailingSlash(value: string): string {
	return value.replace(/\/$/, '');
}

export function resolveFeedbackBaseUrl(input?: string): string {
	if (input) return trimTrailingSlash(input);
	const envUrl = process.env['DRYUI_FEEDBACK_URL'];
	if (envUrl) return trimTrailingSlash(envUrl);

	const config = readFeedbackServerConfig();
	if (config?.baseUrl) {
		return trimTrailingSlash(config.baseUrl);
	}

	const envHost = process.env['DRYUI_FEEDBACK_HOST'] ?? DEFAULT_FEEDBACK_HOST;
	const envPort = Number(process.env['DRYUI_FEEDBACK_PORT'] ?? DEFAULT_FEEDBACK_PORT);
	if (Number.isFinite(envPort) && envPort > 0) {
		return `http://${envHost}:${envPort}`;
	}

	return DEFAULT_FEEDBACK_URL;
}

async function parseJson<T>(response: Response): Promise<T> {
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`HTTP ${response.status}: ${body}`);
	}
	return response.json() as Promise<T>;
}

export class FeedbackHttpClient {
	readonly baseUrl: string;

	constructor(baseUrl?: string) {
		this.baseUrl = resolveFeedbackBaseUrl(baseUrl);
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
		const response = await fetch(`${this.baseUrl}/drawings?url=${encodeURIComponent(url)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(drawings)
		});
		if (!response.ok) {
			const body = await response.text();
			throw new Error(`HTTP ${response.status}: ${body}`);
		}
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
