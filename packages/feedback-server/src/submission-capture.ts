import { rmSync, writeFileSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { Database } from 'bun:sqlite';
import { DISPATCH_AGENTS } from './dispatch.js';
import type {
	CreateSubmissionInput,
	Submission,
	SubmissionAddedComponent,
	SubmissionAgent,
	SubmissionDrawing,
	SubmissionDrawingHint,
	SubmissionMovedElement,
	SubmissionQueryStatus,
	SubmissionRemovedElement,
	SubmissionScrollOffset,
	SubmissionStatus
} from './types.js';

const VALID_AGENTS: ReadonlySet<SubmissionAgent> = new Set<SubmissionAgent>([
	...DISPATCH_AGENTS,
	'off'
]);

function normalizeAgent(value: string | null | undefined): SubmissionAgent | undefined {
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

function createTimestamp(): string {
	return new Date().toISOString();
}

interface SubmissionRow {
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
}

function toSubmission(row: SubmissionRow): Submission {
	const agent = normalizeAgent(row.agent);
	const hints = parseJson<SubmissionDrawingHint[]>(row.hints);
	const components = parseJson<SubmissionAddedComponent[]>(row.components);
	const removed = parseJson<SubmissionRemovedElement[]>(row.removed);
	const moved = parseJson<SubmissionMovedElement[]>(row.moved);
	const scroll = parseJson<SubmissionScrollOffset>(row.scroll);
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
		...(row.workspace ? { workspace: row.workspace } : {})
	};
}

export interface SubmissionCaptureOptions {
	db: Database;
	screenshotsDir: string;
}

export class SubmissionCapture {
	readonly db: Database;
	readonly screenshotsDir: string;

	constructor(options: SubmissionCaptureOptions) {
		this.db = options.db;
		this.screenshotsDir = options.screenshotsDir;
	}

	create(input: CreateSubmissionInput, context: { workspace?: string } = {}): Submission {
		const id = randomUUID();
		const webpPath = join(this.screenshotsDir, `${id}.webp`);
		const pngPath = join(this.screenshotsDir, `${id}.png`);
		writeFileSync(webpPath, Buffer.from(input.image.webp, 'base64'));
		writeFileSync(pngPath, Buffer.from(input.image.png, 'base64'));

		const now = createTimestamp();
		const agent = normalizeAgent(input.agent);
		const hints = input.hints ?? [];
		const components = input.components ?? [];
		const removed = input.removed ?? [];
		const moved = input.moved ?? [];
		const workspace = context.workspace ?? null;
		this.db
			.query(
				`INSERT INTO submissions (
					id, url, screenshot_path, screenshot_png_path, drawings, hints, components, removed, moved, viewport, scroll, status, created_at, agent, workspace
				) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
			)
			.run(
				id,
				input.url,
				webpPath,
				pngPath,
				JSON.stringify(input.drawings),
				hints.length > 0 ? JSON.stringify(hints) : null,
				components.length > 0 ? JSON.stringify(components) : null,
				removed.length > 0 ? JSON.stringify(removed) : null,
				moved.length > 0 ? JSON.stringify(moved) : null,
				input.viewport ? JSON.stringify(input.viewport) : null,
				input.scroll ? JSON.stringify(input.scroll) : null,
				now,
				agent ?? null,
				workspace
			);

		return {
			id,
			url: input.url,
			screenshotPath: { webp: webpPath, png: pngPath },
			drawings: input.drawings,
			...(hints.length > 0 ? { hints } : {}),
			...(components.length > 0 ? { components } : {}),
			...(removed.length > 0 ? { removed } : {}),
			...(moved.length > 0 ? { moved } : {}),
			viewport: input.viewport ?? null,
			...(input.scroll ? { scroll: input.scroll } : {}),
			status: 'pending',
			createdAt: now,
			...(agent ? { agent } : {}),
			...(workspace ? { workspace } : {})
		};
	}

	get(id: string): Submission | null {
		const row = this.db.query<SubmissionRow>('SELECT * FROM submissions WHERE id = ?').get(id);
		return row ? toSubmission(row) : null;
	}

	list(status: SubmissionQueryStatus = 'all'): Submission[] {
		// Pending uses ASC so it acts like a FIFO queue; history filters use DESC (newest first).
		if (status === 'pending') {
			const rows = this.db
				.query<SubmissionRow>(
					"SELECT * FROM submissions WHERE status = 'pending' ORDER BY created_at ASC"
				)
				.all();
			return rows.map(toSubmission);
		}

		const rows =
			status === 'all'
				? this.db.query<SubmissionRow>('SELECT * FROM submissions ORDER BY created_at DESC').all()
				: this.db
						.query<SubmissionRow>(
							'SELECT * FROM submissions WHERE status = ? ORDER BY created_at DESC'
						)
						.all(status);
		return rows.map(toSubmission);
	}

	updateStatus(id: string, status: SubmissionStatus): Submission | null {
		const existing = this.get(id);
		if (!existing) return null;
		this.db.query('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
		return { ...existing, status };
	}

	delete(id: string): Submission | null {
		const existing = this.get(id);
		if (!existing) return null;

		this.db.query('DELETE FROM submissions WHERE id = ?').run(id);

		for (const screenshotPath of new Set([
			existing.screenshotPath.webp,
			existing.screenshotPath.png
		])) {
			if (screenshotPath) {
				rmSync(screenshotPath, { force: true });
			}
		}

		return existing;
	}
}
