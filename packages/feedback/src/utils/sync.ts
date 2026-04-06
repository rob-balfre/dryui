import type { Annotation, Session, SessionWithAnnotations, ThreadMessage } from '../types.js';

async function readJson<T>(response: Response, message: string): Promise<T> {
	if (!response.ok) {
		throw new Error(`${message}: ${response.status}`);
	}

	return response.json() as Promise<T>;
}

export interface ActionResponse {
	success: boolean;
	annotationCount: number;
	delivered: {
		sseListeners: number;
		webhooks: number;
		total: number;
	};
}

export interface PendingResponse {
	count: number;
	annotations: Annotation[];
}

export async function listSessions(endpoint: string): Promise<Session[]> {
	const response = await fetch(`${endpoint}/sessions`);
	return readJson<Session[]>(response, 'Failed to list sessions');
}

export async function createSession(endpoint: string, url: string): Promise<Session> {
	const response = await fetch(`${endpoint}/sessions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ url })
	});

	return readJson<Session>(response, 'Failed to create session');
}

export async function getSession(
	endpoint: string,
	sessionId: string
): Promise<SessionWithAnnotations> {
	const response = await fetch(`${endpoint}/sessions/${sessionId}`);
	return readJson<SessionWithAnnotations>(response, 'Failed to get session');
}

export async function getPending(endpoint: string, sessionId: string): Promise<PendingResponse> {
	const response = await fetch(`${endpoint}/sessions/${sessionId}/pending`);
	return readJson<PendingResponse>(response, 'Failed to get pending annotations');
}

export async function getAllPending(endpoint: string): Promise<PendingResponse> {
	const response = await fetch(`${endpoint}/pending`);
	return readJson<PendingResponse>(response, 'Failed to get pending annotations');
}

export async function syncAnnotation(
	endpoint: string,
	sessionId: string,
	annotation: Annotation
): Promise<Annotation> {
	const response = await fetch(`${endpoint}/sessions/${sessionId}/annotations`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(annotation)
	});

	return readJson<Annotation>(response, 'Failed to sync annotation');
}

export async function updateAnnotation(
	endpoint: string,
	annotationId: string,
	data: Partial<Annotation>
): Promise<Annotation> {
	const response = await fetch(`${endpoint}/annotations/${annotationId}`, {
		method: 'PATCH',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data)
	});

	return readJson<Annotation>(response, 'Failed to update annotation');
}

export async function replyToAnnotation(
	endpoint: string,
	annotationId: string,
	message: ThreadMessage
): Promise<Annotation> {
	const response = await fetch(`${endpoint}/annotations/${annotationId}/thread`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(message)
	});

	return readJson<Annotation>(response, 'Failed to reply to annotation');
}

export async function deleteAnnotation(endpoint: string, annotationId: string): Promise<void> {
	const response = await fetch(`${endpoint}/annotations/${annotationId}`, {
		method: 'DELETE'
	});

	if (!response.ok) {
		throw new Error(`Failed to delete annotation: ${response.status}`);
	}
}

export async function requestAction(
	endpoint: string,
	sessionId: string,
	output: string
): Promise<ActionResponse> {
	const response = await fetch(`${endpoint}/sessions/${sessionId}/action`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ output })
	});

	return readJson<ActionResponse>(response, 'Failed to request action');
}
