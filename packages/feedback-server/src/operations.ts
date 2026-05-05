import type { EventBus } from './events.js';
import type {
	ActionRequest,
	ActionResponse,
	Annotation,
	CreateAnnotationInput,
	CreateSessionInput,
	CreateSubmissionInput,
	SSEEvent,
	Session,
	Submission,
	SubmissionStatus,
	ThreadMessage,
	UpdateAnnotationInput
} from './types.js';

export interface FeedbackOperationsStore {
	createSession(input: CreateSessionInput): Session;
	getSession(id: string): Session | null;
	createAnnotation(sessionId: string, input: CreateAnnotationInput): Annotation;
	updateAnnotation(id: string, patch: UpdateAnnotationInput): Annotation | null;
	deleteAnnotation(id: string): Annotation | null;
	addThreadMessage(
		id: string,
		message: Omit<ThreadMessage, 'id' | 'timestamp'> &
			Partial<Pick<ThreadMessage, 'id' | 'timestamp'>>
	): Annotation | null;
	getPending(sessionId?: string): Annotation[];
	saveDrawings(url: string, drawings: unknown[]): void;
	createSubmission(
		input: CreateSubmissionInput,
		context?: { workspace?: string }
	): Submission | null;
	updateSubmissionStatus(id: string, status: SubmissionStatus): Submission | null;
	deleteSubmission(id: string): Submission | null;
}

export interface FeedbackOperationsContext {
	workspace?: string;
}

function createEvent<TPayload>(
	type: string,
	sessionId: string,
	payload: TPayload
): SSEEvent<TPayload> {
	return {
		type,
		timestamp: new Date().toISOString(),
		sessionId,
		payload
	};
}

function emit<TPayload>(
	bus: EventBus,
	type: string,
	sessionId: string,
	payload: TPayload
): ReturnType<EventBus['emit']> {
	return bus.emit(createEvent(type, sessionId, payload));
}

export function createSession(
	store: FeedbackOperationsStore,
	bus: EventBus,
	input: CreateSessionInput
): Session {
	const session = store.createSession(input);
	emit(bus, 'session.created', session.id, session);
	return session;
}

export function createAnnotation(
	store: FeedbackOperationsStore,
	bus: EventBus,
	sessionId: string,
	input: CreateAnnotationInput
): Annotation | null {
	if (!store.getSession(sessionId)) return null;

	const annotation = store.createAnnotation(sessionId, input);
	emit(bus, 'annotation.created', annotation.sessionId, annotation);
	return annotation;
}

export function requestSessionAction(
	store: FeedbackOperationsStore,
	bus: EventBus,
	sessionId: string,
	input: ActionRequest
): ActionResponse | null {
	if (!store.getSession(sessionId)) return null;

	const delivered = emit(bus, 'action.requested', sessionId, { ...input, sessionId });
	return {
		success: true,
		annotationCount: store.getPending(sessionId).length,
		delivered: {
			sseListeners: delivered.activeListeners,
			webhooks: 0,
			total: delivered.activeListeners
		}
	};
}

export function saveDrawings(
	store: FeedbackOperationsStore,
	bus: EventBus,
	url: string,
	drawings: unknown[]
): void {
	store.saveDrawings(url, drawings);
	emit(bus, 'drawings.updated', url, { url });
}

export function createSubmission(
	store: FeedbackOperationsStore,
	bus: EventBus,
	input: CreateSubmissionInput,
	context: FeedbackOperationsContext = {}
): Submission | null {
	const submission = store.createSubmission(input, context);
	if (!submission) return null;
	emit(bus, 'submission.created', submission.url, submission);
	return submission;
}

export function updateSubmissionStatus(
	store: FeedbackOperationsStore,
	bus: EventBus,
	id: string,
	status: SubmissionStatus
): Submission | null {
	const submission = store.updateSubmissionStatus(id, status);
	if (!submission) return null;

	emit(bus, 'submission.updated', submission.url, submission);
	return submission;
}

export function deleteSubmission(
	store: FeedbackOperationsStore,
	bus: EventBus,
	id: string
): Submission | null {
	const submission = store.deleteSubmission(id);
	if (!submission) return null;

	emit(bus, 'submission.deleted', submission.url, submission);
	return submission;
}

export function updateAnnotation(
	store: FeedbackOperationsStore,
	bus: EventBus,
	id: string,
	patch: UpdateAnnotationInput
): Annotation | null {
	const annotation = store.updateAnnotation(id, patch);
	if (!annotation) return null;

	emit(bus, 'annotation.updated', annotation.sessionId, annotation);
	return annotation;
}

export function deleteAnnotation(
	store: FeedbackOperationsStore,
	bus: EventBus,
	id: string
): Annotation | null {
	const annotation = store.deleteAnnotation(id);
	if (!annotation) return null;

	emit(bus, 'annotation.deleted', annotation.sessionId, annotation);
	return annotation;
}

export function addThreadMessage(
	store: FeedbackOperationsStore,
	bus: EventBus,
	id: string,
	message: Omit<ThreadMessage, 'id' | 'timestamp'> &
		Partial<Pick<ThreadMessage, 'id' | 'timestamp'>>
): Annotation | null {
	const annotation = store.addThreadMessage(id, message);
	if (!annotation) return null;

	emit(bus, 'thread.message', annotation.sessionId, annotation);
	return annotation;
}
