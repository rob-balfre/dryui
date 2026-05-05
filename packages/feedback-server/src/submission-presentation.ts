import type {
	Submission,
	SubmissionAddedComponent,
	SubmissionDrawing,
	SubmissionDrawingHint,
	SubmissionMovedElement,
	SubmissionRemovedElement
} from './types.js';

export interface SubmissionDrawingHintPair {
	drawing: SubmissionDrawing;
	hint: SubmissionDrawingHint | null;
}

export interface SubmissionPresentation {
	id: string;
	url: string;
	status: Submission['status'];
	createdAt: string;
	agent?: Submission['agent'];
	workspace?: string;
	screenshotPath: Submission['screenshotPath'];
	preferredScreenshotPath: string;
	viewport: Submission['viewport'];
	scroll: Submission['scroll'] | null;
	drawings: SubmissionDrawing[];
	hints: SubmissionDrawingHint[];
	drawingHints: SubmissionDrawingHintPair[];
	components?: SubmissionAddedComponent[];
	removed?: SubmissionRemovedElement[];
	moved?: SubmissionMovedElement[];
	textNotes: string[];
	summary: {
		drawingCount: number;
		hintCount: number;
		drawingKinds: Record<string, number>;
		corners: Record<string, number>;
		componentCount?: number;
		componentKinds?: Record<string, number>;
		removedCount?: number;
		movedCount?: number;
	};
}

export interface SubmissionPresentationListResponse {
	count: number;
	submissions: SubmissionPresentation[];
}

export function isSubmissionPresentation(
	submission: Submission | SubmissionPresentation
): submission is SubmissionPresentation {
	return (
		'preferredScreenshotPath' in submission &&
		'drawingHints' in submission &&
		'textNotes' in submission &&
		'summary' in submission
	);
}

export function ensureSubmissionPresentation(
	submission: Submission | SubmissionPresentation
): SubmissionPresentation {
	return isSubmissionPresentation(submission)
		? submission
		: buildSubmissionPresentation(submission);
}

export function buildSubmissionPresentationListResponse(
	submissions: Submission[]
): SubmissionPresentationListResponse {
	return {
		count: submissions.length,
		submissions: submissions.map(buildSubmissionPresentation)
	};
}

export function getSubmissionTextNotes(
	input: readonly SubmissionDrawing[] | Pick<Submission, 'drawings'> | undefined
): string[] {
	if (!input) return [];
	const drawings: readonly SubmissionDrawing[] = 'drawings' in input ? input.drawings : input;
	if (!drawings) return [];
	return drawings.flatMap((drawing) =>
		drawing.kind === 'text' && typeof drawing.text === 'string' && drawing.text.length > 0
			? [drawing.text]
			: []
	);
}

export function buildSubmissionPresentation(submission: Submission): SubmissionPresentation {
	const drawings = submission.drawings ?? [];
	const hints = submission.hints ?? [];
	const components = submission.components ?? [];
	const removed = submission.removed ?? [];
	const moved = submission.moved ?? [];
	const drawingKinds: Record<string, number> = {};
	const corners: Record<string, number> = {};
	const componentKinds: Record<string, number> = {};

	for (const drawing of drawings) {
		const kind = drawing.kind ?? 'unknown';
		drawingKinds[kind] = (drawingKinds[kind] ?? 0) + 1;
	}

	for (const hint of hints) {
		corners[hint.corner] = (corners[hint.corner] ?? 0) + 1;
	}

	for (const component of components) {
		componentKinds[component.kind] = (componentKinds[component.kind] ?? 0) + 1;
	}

	return {
		id: submission.id,
		url: submission.url,
		status: submission.status,
		createdAt: submission.createdAt,
		...(submission.agent ? { agent: submission.agent } : {}),
		...(submission.workspace ? { workspace: submission.workspace } : {}),
		screenshotPath: submission.screenshotPath,
		preferredScreenshotPath: submission.screenshotPath.png || submission.screenshotPath.webp,
		viewport: submission.viewport,
		scroll: submission.scroll ?? null,
		drawings,
		hints,
		drawingHints: drawings.map((drawing, index) => ({
			drawing,
			hint: hints[index] ?? null
		})),
		...(components.length > 0 ? { components } : {}),
		...(removed.length > 0 ? { removed } : {}),
		...(moved.length > 0 ? { moved } : {}),
		textNotes: getSubmissionTextNotes(drawings),
		summary: {
			drawingCount: drawings.length,
			hintCount: hints.length,
			drawingKinds,
			corners,
			...(components.length > 0 ? { componentCount: components.length, componentKinds } : {}),
			...(removed.length > 0 ? { removedCount: removed.length } : {}),
			...(moved.length > 0 ? { movedCount: moved.length } : {})
		}
	};
}
