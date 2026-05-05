import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
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

interface TableColumnRow {
	name: string;
}

interface NormalizedCreateSubmissionInput {
	url: string;
	image: {
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
	agent?: SubmissionAgent;
}

function ensureDirectory(path: string): void {
	if (!existsSync(path)) {
		mkdirSync(path, { recursive: true });
	}
}

function ensureColumn(db: Database, table: string, column: string, definition: string): void {
	const columns = db.query(`PRAGMA table_info(${table})`).all() as TableColumnRow[];
	if (columns.some((entry) => entry.name === column)) {
		return;
	}
	db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function normalizeAgent(value: string | null | undefined): SubmissionAgent | undefined {
	if (value && VALID_AGENTS.has(value as SubmissionAgent)) return value as SubmissionAgent;
	return undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
	return typeof value === 'string' && value.trim().length > 0;
}

function readRequiredArray<T>(value: unknown): T[] | null {
	return Array.isArray(value) ? (value as T[]) : null;
}

function readOptionalArray<T>(value: unknown): T[] | null {
	if (value === undefined) return [];
	return Array.isArray(value) ? (value as T[]) : null;
}

function readNumericPair<K1 extends string, K2 extends string>(
	value: unknown,
	firstKey: K1,
	secondKey: K2
): Record<K1 | K2, number> | null | undefined {
	if (value === undefined) return undefined;
	if (!isRecord(value)) return null;
	const first = value[firstKey];
	const second = value[secondKey];
	if (typeof first !== 'number' || typeof second !== 'number') return null;
	if (!Number.isFinite(first) || !Number.isFinite(second)) return null;
	return { [firstKey]: first, [secondKey]: second } as Record<K1 | K2, number>;
}

function normalizeCreateInput(
	input: CreateSubmissionInput
): NormalizedCreateSubmissionInput | null {
	const raw: unknown = input;
	if (!isRecord(raw)) return null;

	const url = raw['url'];
	if (!isNonEmptyString(url)) return null;

	const image = raw['image'];
	if (!isRecord(image)) return null;
	const webp = image['webp'];
	const png = image['png'];
	if (!isNonEmptyString(webp) || !isNonEmptyString(png)) return null;

	const drawings = readRequiredArray<SubmissionDrawing>(raw['drawings']);
	if (!drawings) return null;

	const hints = readOptionalArray<SubmissionDrawingHint>(raw['hints']);
	const components = readOptionalArray<SubmissionAddedComponent>(raw['components']);
	const removed = readOptionalArray<SubmissionRemovedElement>(raw['removed']);
	const moved = readOptionalArray<SubmissionMovedElement>(raw['moved']);
	if (!hints || !components || !removed || !moved) return null;

	const viewport = readNumericPair(raw['viewport'], 'width', 'height');
	if (viewport === null) return null;

	const scroll = readNumericPair(raw['scroll'], 'x', 'y');
	if (scroll === null) return null;

	let agent: SubmissionAgent | undefined;
	if (raw['agent'] !== undefined) {
		if (typeof raw['agent'] !== 'string') return null;
		agent = normalizeAgent(raw['agent']);
		if (!agent) return null;
	}

	return {
		url,
		image: {
			webp,
			png
		},
		drawings,
		hints,
		components,
		removed,
		moved,
		...(viewport ? { viewport: { width: viewport.width, height: viewport.height } } : {}),
		...(scroll ? { scroll: { x: scroll.x, y: scroll.y } } : {}),
		...(agent ? { agent } : {})
	};
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

	initSchema(): void {
		this.db.exec(`
			CREATE TABLE IF NOT EXISTS submissions (
				id TEXT PRIMARY KEY,
				url TEXT NOT NULL,
				screenshot_path TEXT NOT NULL,
				screenshot_png_path TEXT,
				drawings TEXT NOT NULL DEFAULT '[]',
				hints TEXT,
				components TEXT,
				removed TEXT,
				moved TEXT,
				layout_boxes TEXT,
				viewport TEXT,
				scroll TEXT,
				status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
				created_at TEXT NOT NULL,
				agent TEXT,
				workspace TEXT
			);
			CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
		`);
		ensureColumn(this.db, 'submissions', 'agent', 'TEXT');
		// Additive migration for pre-dual-emission databases. Existing rows keep
		// their WebP-only screenshot_path; new columns default to NULL and new
		// submissions populate both screenshot columns.
		ensureColumn(this.db, 'submissions', 'screenshot_png_path', 'TEXT');
		ensureColumn(this.db, 'submissions', 'hints', 'TEXT');
		ensureColumn(this.db, 'submissions', 'components', 'TEXT');
		ensureColumn(this.db, 'submissions', 'removed', 'TEXT');
		ensureColumn(this.db, 'submissions', 'moved', 'TEXT');
		ensureColumn(this.db, 'submissions', 'layout_boxes', 'TEXT');
		ensureColumn(this.db, 'submissions', 'scroll', 'TEXT');
		ensureColumn(this.db, 'submissions', 'workspace', 'TEXT');
		ensureDirectory(this.screenshotsDir);
	}

	create(input: CreateSubmissionInput, context: { workspace?: string } = {}): Submission | null {
		const normalized = normalizeCreateInput(input);
		if (!normalized) return null;

		const id = randomUUID();
		const webpPath = join(this.screenshotsDir, `${id}.webp`);
		const pngPath = join(this.screenshotsDir, `${id}.png`);
		const now = createTimestamp();
		const workspace = context.workspace ?? null;
		const writtenPaths: string[] = [];

		try {
			writeFileSync(webpPath, Buffer.from(normalized.image.webp, 'base64'));
			writtenPaths.push(webpPath);
			writeFileSync(pngPath, Buffer.from(normalized.image.png, 'base64'));
			writtenPaths.push(pngPath);

			this.db
				.query(
					`INSERT INTO submissions (
						id, url, screenshot_path, screenshot_png_path, drawings, hints, components, removed, moved, viewport, scroll, status, created_at, agent, workspace
					) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?, ?)`
				)
				.run(
					id,
					normalized.url,
					webpPath,
					pngPath,
					JSON.stringify(normalized.drawings),
					normalized.hints.length > 0 ? JSON.stringify(normalized.hints) : null,
					normalized.components.length > 0 ? JSON.stringify(normalized.components) : null,
					normalized.removed.length > 0 ? JSON.stringify(normalized.removed) : null,
					normalized.moved.length > 0 ? JSON.stringify(normalized.moved) : null,
					normalized.viewport ? JSON.stringify(normalized.viewport) : null,
					normalized.scroll ? JSON.stringify(normalized.scroll) : null,
					now,
					normalized.agent ?? null,
					workspace
				);
		} catch (error) {
			for (const path of writtenPaths) {
				rmSync(path, { force: true });
			}
			throw error;
		}

		return {
			id,
			url: normalized.url,
			screenshotPath: { webp: webpPath, png: pngPath },
			drawings: normalized.drawings,
			...(normalized.hints.length > 0 ? { hints: normalized.hints } : {}),
			...(normalized.components.length > 0 ? { components: normalized.components } : {}),
			...(normalized.removed.length > 0 ? { removed: normalized.removed } : {}),
			...(normalized.moved.length > 0 ? { moved: normalized.moved } : {}),
			viewport: normalized.viewport ?? null,
			...(normalized.scroll ? { scroll: normalized.scroll } : {}),
			status: 'pending',
			createdAt: now,
			...(normalized.agent ? { agent: normalized.agent } : {}),
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
