import { DISPATCH_AGENTS } from './dispatch.js';
import type {
	Submission,
	SubmissionAddedComponent,
	SubmissionAgent,
	SubmissionDrawing,
	SubmissionDrawingHint,
	SubmissionMovedElement,
	SubmissionRemovedElement,
	SubmissionScrollOffset,
	SubmissionStatus,
	SubmissionWorker
} from './types.js';

const VALID_AGENTS: ReadonlySet<SubmissionAgent> = new Set<SubmissionAgent>([
	...DISPATCH_AGENTS,
	'off'
]);

export interface SubmissionRow {
	id: string;
	url: string;
	screenshot_path: string;
	screenshot_png_path: string | null;
	drawings: string;
	hints: string | null;
	components: string | null;
	removed: string | null;
	moved: string | null;
	// Dormant legacy column. Kept on the schema so existing databases don't need
	// a destructive migration; the store no longer reads or writes to it.
	layout_boxes: string | null;
	viewport: string | null;
	scroll: string | null;
	status: SubmissionStatus;
	created_at: string;
	agent: string | null;
	workspace: string | null;
	worker: string | null;
	processing_started_at: string | null;
	resolved_at: string | null;
	duration_ms: number | null;
}

export interface SubmissionInsertSerializationInput {
	id: string;
	url: string;
	screenshotPath: {
		webp: string;
		png: string;
	};
	drawings: SubmissionDrawing[];
	hints: SubmissionDrawingHint[];
	components: SubmissionAddedComponent[];
	removed: SubmissionRemovedElement[];
	moved: SubmissionMovedElement[];
	viewport?: { width: number; height: number };
	scroll?: SubmissionScrollOffset;
	createdAt: string;
	agent?: SubmissionAgent;
	workspace?: string | null;
}

export type SubmissionInsertValues = [
	string,
	string,
	string,
	string,
	string,
	string | null,
	string | null,
	string | null,
	string | null,
	string | null,
	string | null,
	string,
	SubmissionAgent | null,
	string | null
];

export function normalizeSubmissionAgent(
	value: string | null | undefined
): SubmissionAgent | undefined {
	if (value && VALID_AGENTS.has(value as SubmissionAgent)) return value as SubmissionAgent;
	return undefined;
}

function parseJson<T>(value: string | null): T | undefined {
	if (!value) return undefined;
	try {
		return JSON.parse(value) as T;
	} catch {
		return undefined;
	}
}

function serializeOptionalArray<T>(value: T[]): string | null {
	return value.length > 0 ? JSON.stringify(value) : null;
}

function serializeOptionalJson<T>(value: T | undefined): string | null {
	return value === undefined ? null : JSON.stringify(value);
}

export function serializeSubmissionInsert(
	input: SubmissionInsertSerializationInput
): SubmissionInsertValues {
	return [
		input.id,
		input.url,
		input.screenshotPath.webp,
		input.screenshotPath.png,
		JSON.stringify(input.drawings),
		serializeOptionalArray(input.hints),
		serializeOptionalArray(input.components),
		serializeOptionalArray(input.removed),
		serializeOptionalArray(input.moved),
		serializeOptionalJson(input.viewport),
		serializeOptionalJson(input.scroll),
		input.createdAt,
		input.agent ?? null,
		input.workspace ?? null
	];
}

export function toSubmission(row: SubmissionRow): Submission {
	const agent = normalizeSubmissionAgent(row.agent);
	const hints = parseJson<SubmissionDrawingHint[]>(row.hints);
	const components = parseJson<SubmissionAddedComponent[]>(row.components);
	const removed = parseJson<SubmissionRemovedElement[]>(row.removed);
	const moved = parseJson<SubmissionMovedElement[]>(row.moved);
	const scroll = parseJson<SubmissionScrollOffset>(row.scroll);
	const worker = parseJson<SubmissionWorker>(row.worker);
	return {
		id: row.id,
		url: row.url,
		screenshotPath: {
			webp: row.screenshot_path,
			// Legacy rows pre-dual-emission only have the WebP file. Expose an
			// empty PNG path so readers can fall back to WebP explicitly.
			png: row.screenshot_png_path ?? ''
		},
		drawings: parseJson<SubmissionDrawing[]>(row.drawings) ?? [],
		...(hints ? { hints } : {}),
		...(components && components.length > 0 ? { components } : {}),
		...(removed && removed.length > 0 ? { removed } : {}),
		...(moved && moved.length > 0 ? { moved } : {}),
		viewport: parseJson<{ width: number; height: number }>(row.viewport) ?? null,
		...(scroll !== undefined ? { scroll } : {}),
		status: row.status as SubmissionStatus,
		createdAt: row.created_at,
		...(agent ? { agent } : {}),
		...(row.workspace ? { workspace: row.workspace } : {}),
		...(worker ? { worker } : {}),
		...(row.processing_started_at ? { processingStartedAt: row.processing_started_at } : {}),
		...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
		...(row.duration_ms !== null ? { durationMs: row.duration_ms } : {})
	};
}
