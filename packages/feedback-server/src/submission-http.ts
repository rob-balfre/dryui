import { EventBus } from './events.js';
import { FeedbackStore } from './store.js';
import type {
	CreateSubmissionInput,
	SSEEvent,
	SubmissionQueryStatus,
	SubmissionStatus
} from './types.js';

type JsonResponse = (data: unknown, status?: number) => Response;
type ErrorResponse = (status: number, error: string) => Response;
type FileResponse = (
	filePath: string,
	headers?: Record<string, string>
) => Promise<Response | null>;
type ReadJson = <T>(request: Request) => Promise<T>;

export interface SubmissionHttpOptions {
	store: FeedbackStore;
	bus: EventBus;
	dispatcherWorkspace?: string;
	corsHeaders: Record<string, string>;
	json: JsonResponse;
	errorResponse: ErrorResponse;
	fileResponse: FileResponse;
	readJson: ReadJson;
}

function emit<TPayload>(
	bus: EventBus,
	type: string,
	sessionId: string,
	payload: TPayload
): ReturnType<EventBus['emit']> {
	return bus.emit({
		type,
		timestamp: new Date().toISOString(),
		sessionId,
		payload
	} satisfies SSEEvent);
}

function isSubmissionQueryStatus(value: string | null): value is SubmissionQueryStatus {
	return value === null || value === 'pending' || value === 'resolved' || value === 'all';
}

export async function handleSubmissionHttp(
	request: Request,
	url: URL,
	options: SubmissionHttpOptions
): Promise<Response | null> {
	const { pathname } = url;
	const {
		store,
		bus,
		dispatcherWorkspace,
		corsHeaders,
		json,
		errorResponse,
		fileResponse,
		readJson
	} = options;

	if (pathname === '/submissions' && request.method === 'POST') {
		let body: CreateSubmissionInput;
		try {
			body = await readJson<CreateSubmissionInput>(request);
		} catch {
			return errorResponse(400, 'Invalid JSON');
		}

		const submission = store.createSubmissionPresentation(body, {
			workspace: dispatcherWorkspace
		});
		if (!submission) return errorResponse(400, 'Invalid submission');
		emit(bus, 'submission.created', submission.url, submission);
		return json(submission, 201);
	}

	if (pathname === '/submissions' && request.method === 'GET') {
		const status = url.searchParams.get('status');
		if (!isSubmissionQueryStatus(status)) {
			return errorResponse(400, 'Invalid submission status filter');
		}

		return json(store.listSubmissionPresentations(status ?? 'pending'));
	}

	const submissionScreenshotMatch = pathname.match(/^\/submissions\/([^/]+)\/screenshot$/);
	if (submissionScreenshotMatch && request.method === 'GET') {
		const submissionId = decodeURIComponent(submissionScreenshotMatch[1] ?? '');
		const requested = url.searchParams.get('format');
		const targetPath = store.selectSubmissionScreenshotPath(
			submissionId,
			requested === 'png' ? 'png' : null
		);
		if (!targetPath) return errorResponse(404, 'Not found');
		return (await fileResponse(targetPath)) ?? errorResponse(404, 'Not found');
	}

	const submissionMatch = pathname.match(/^\/submissions\/([^/]+)$/);
	if (submissionMatch && request.method === 'GET') {
		const submissionId = decodeURIComponent(submissionMatch[1] ?? '');
		const submission = store.getSubmissionPresentation(submissionId);
		if (!submission) return errorResponse(404, 'Not found');
		return json(submission);
	}

	if (submissionMatch && request.method === 'PATCH') {
		const submissionId = decodeURIComponent(submissionMatch[1] ?? '');
		try {
			const body = await readJson<{ status: SubmissionStatus }>(request);
			const submission = store.updateSubmissionStatusPresentation(submissionId, body.status);
			if (!submission) return errorResponse(404, 'Not found');
			emit(bus, 'submission.updated', submission.url, submission);
			return json(submission);
		} catch {
			return errorResponse(400, 'Invalid JSON');
		}
	}

	if (submissionMatch && request.method === 'DELETE') {
		const submissionId = decodeURIComponent(submissionMatch[1] ?? '');
		const submission = store.deleteSubmission(submissionId);
		if (!submission) return errorResponse(404, 'Not found');
		emit(bus, 'submission.deleted', submission.url, submission);
		return new Response(null, { status: 204, headers: corsHeaders });
	}

	return null;
}
