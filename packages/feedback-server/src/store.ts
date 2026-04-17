import { mkdirSync, existsSync, writeFileSync } from 'node:fs';
import { Database } from 'bun:sqlite';
import { randomUUID } from 'node:crypto';
import { DEFAULT_STORE_DIR, DEFAULT_STORE_PATH, SCREENSHOTS_DIR } from './config.js';
import { DISPATCH_AGENTS } from './dispatch.js';
import type {
	Annotation,
	AnnotationKind,
	AnnotationStatus,
	CreateAnnotationInput,
	CreateSessionInput,
	CreateSubmissionInput,
	Session,
	SessionStatus,
	SessionWithAnnotations,
	Submission,
	SubmissionAgent,
	SubmissionQueryStatus,
	SubmissionStatus,
	ThreadMessage,
	UpdateAnnotationInput
} from './types.js';

const VALID_AGENTS: ReadonlySet<SubmissionAgent> = new Set<SubmissionAgent>([
	...DISPATCH_AGENTS,
	'off'
]);

function normalizeAgent(value: string | null | undefined): SubmissionAgent | undefined {
	if (value && VALID_AGENTS.has(value as SubmissionAgent)) return value as SubmissionAgent;
	return undefined;
}

interface SessionRow {
	id: string;
	url: string;
	status: SessionStatus;
	created_at: string;
	updated_at: string | null;
	project_id: string | null;
	metadata: string | null;
}

interface AnnotationRow {
	id: string;
	session_id: string;
	x: number | null;
	y: number | null;
	comment: string;
	element: string;
	element_path: string;
	timestamp: number;
	selected_text: string | null;
	bounding_box: string | null;
	nearby_text: string | null;
	css_classes: string | null;
	nearby_elements: string | null;
	computed_styles: string | null;
	full_path: string | null;
	accessibility: string | null;
	is_multi_select: number | null;
	is_fixed: number | null;
	svelte_components: string | null;
	url: string | null;
	intent: Annotation['intent'] | null;
	severity: Annotation['severity'] | null;
	status: AnnotationStatus;
	thread: string | null;
	created_at: string;
	updated_at: string | null;
	resolved_at: string | null;
	resolved_by: Annotation['resolvedBy'] | null;
	resolution_note: string | null;
	author_id: string | null;
	kind: AnnotationKind | null;
	color: Annotation['color'] | null;
	extra: string | null;
}

interface SubmissionRow {
	id: string;
	url: string;
	screenshot_path: string;
	drawings: string;
	viewport: string | null;
	status: SubmissionStatus;
	created_at: string;
	agent: string | null;
}

interface TableColumnRow {
	name: string;
}

function ensureStoreDir(dbPath: string): void {
	const lastSlash = dbPath.lastIndexOf('/');
	const dir = lastSlash === -1 ? DEFAULT_STORE_DIR : dbPath.slice(0, lastSlash);
	if (!existsSync(dir)) {
		mkdirSync(dir, { recursive: true });
	}
}

function ensureColumn(db: Database, table: string, column: string, definition: string): void {
	const columns = db.query(`PRAGMA table_info(${table})`).all() as TableColumnRow[];
	if (columns.some((entry) => entry.name === column)) {
		return;
	}
	db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function parseJson<T>(value: string | null): T | undefined {
	if (!value) return undefined;
	try {
		return JSON.parse(value) as T;
	} catch {
		return undefined;
	}
}

function toSession(row: SessionRow): Session {
	return {
		id: row.id,
		url: row.url,
		status: row.status,
		createdAt: row.created_at,
		...(row.updated_at ? { updatedAt: row.updated_at } : {}),
		...(row.project_id ? { projectId: row.project_id } : {}),
		...(row.metadata ? { metadata: parseJson<Record<string, unknown>>(row.metadata) } : {})
	};
}

function toAnnotation(row: AnnotationRow): Annotation {
	const extra = parseJson<Annotation['extra']>(row.extra);

	return {
		id: row.id,
		sessionId: row.session_id,
		x: row.x ?? 0,
		y: row.y ?? 0,
		comment: row.comment,
		element: row.element,
		elementPath: row.element_path,
		timestamp: row.timestamp,
		...(row.selected_text ? { selectedText: row.selected_text } : {}),
		...(row.bounding_box
			? { boundingBox: parseJson<Annotation['boundingBox']>(row.bounding_box) }
			: {}),
		...(row.nearby_text ? { nearbyText: row.nearby_text } : {}),
		...(row.css_classes ? { cssClasses: row.css_classes } : {}),
		...(row.nearby_elements ? { nearbyElements: row.nearby_elements } : {}),
		...(row.computed_styles ? { computedStyles: row.computed_styles } : {}),
		...(row.full_path ? { fullPath: row.full_path } : {}),
		...(row.accessibility ? { accessibility: row.accessibility } : {}),
		...(row.is_multi_select ? { isMultiSelect: Boolean(row.is_multi_select) } : {}),
		isFixed: Boolean(row.is_fixed),
		...(row.svelte_components ? { svelteComponents: row.svelte_components } : {}),
		...(row.url ? { url: row.url } : {}),
		...(row.intent ? { intent: row.intent } : {}),
		...(row.severity ? { severity: row.severity } : {}),
		status: row.status,
		...(row.thread ? { thread: parseJson<ThreadMessage[]>(row.thread) ?? [] } : {}),
		createdAt: row.created_at,
		...(row.updated_at ? { updatedAt: row.updated_at } : {}),
		...(row.resolved_at ? { resolvedAt: row.resolved_at } : {}),
		...(row.resolved_by ? { resolvedBy: row.resolved_by } : {}),
		...(row.resolution_note ? { resolutionNote: row.resolution_note } : {}),
		...(row.author_id ? { authorId: row.author_id } : {}),
		kind: row.kind ?? 'feedback',
		color: row.color ?? 'brand',
		...(extra ? { extra } : {})
	};
}

function toSubmission(row: SubmissionRow): Submission {
	const agent = normalizeAgent(row.agent);
	return {
		id: row.id,
		url: row.url,
		screenshotPath: row.screenshot_path,
		drawings: parseJson<unknown[]>(row.drawings) ?? [],
		viewport: parseJson<{ width: number; height: number }>(row.viewport) ?? null,
		status: row.status as SubmissionStatus,
		createdAt: row.created_at,
		...(agent ? { agent } : {})
	};
}

function toDbBoolean(value: boolean | undefined): number | null {
	if (value === undefined) return null;
	return value ? 1 : 0;
}

function createTimestamp(): string {
	return new Date().toISOString();
}

export class FeedbackStore {
	readonly db: Database;
	readonly dbPath: string;

	constructor(dbPath: string = DEFAULT_STORE_PATH) {
		this.dbPath = dbPath;
		ensureStoreDir(dbPath);
		this.db = new Database(dbPath, { create: true });
		this.db.exec('PRAGMA journal_mode = WAL');
		this.init();
	}

	init(): void {
		this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK(status IN ('active', 'approved', 'closed')),
        created_at TEXT NOT NULL,
        updated_at TEXT,
        project_id TEXT,
        metadata TEXT
      );

      CREATE TABLE IF NOT EXISTS annotations (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL REFERENCES sessions(id),
        x REAL,
        y REAL,
        comment TEXT NOT NULL,
        element TEXT NOT NULL,
        element_path TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        selected_text TEXT,
        bounding_box TEXT,
        nearby_text TEXT,
        css_classes TEXT,
        nearby_elements TEXT,
        computed_styles TEXT,
        full_path TEXT,
        accessibility TEXT,
        is_multi_select INTEGER,
        is_fixed INTEGER,
        svelte_components TEXT,
        url TEXT,
        intent TEXT CHECK(intent IN ('fix', 'change', 'question', 'approve')),
        severity TEXT CHECK(severity IN ('blocking', 'important', 'suggestion')),
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'acknowledged', 'resolved', 'dismissed', 'failed')),
        thread TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT,
        resolved_at TEXT,
        resolved_by TEXT CHECK(resolved_by IN ('human', 'agent')),
        resolution_note TEXT,
        author_id TEXT,
        kind TEXT DEFAULT 'feedback' CHECK(kind IN ('feedback', 'placement', 'rearrange')),
        color TEXT CHECK(color IN ('brand', 'info', 'success', 'warning', 'error', 'neutral')),
        extra TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_annotations_session ON annotations(session_id);
      CREATE INDEX IF NOT EXISTS idx_annotations_status ON annotations(status);

      CREATE TABLE IF NOT EXISTS drawings (
        url TEXT PRIMARY KEY,
        data TEXT NOT NULL DEFAULT '[]',
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        url TEXT NOT NULL,
        screenshot_path TEXT NOT NULL,
        drawings TEXT NOT NULL DEFAULT '[]',
        viewport TEXT,
        status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'resolved')),
        created_at TEXT NOT NULL,
        agent TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);
    `);

		ensureColumn(this.db, 'annotations', 'resolution_note', 'TEXT');
		ensureColumn(
			this.db,
			'annotations',
			'color',
			"TEXT CHECK(color IN ('brand', 'info', 'success', 'warning', 'error', 'neutral'))"
		);
		ensureColumn(this.db, 'submissions', 'agent', 'TEXT');

		if (!existsSync(SCREENSHOTS_DIR)) {
			mkdirSync(SCREENSHOTS_DIR, { recursive: true });
		}
	}

	close(): void {
		this.db.close();
	}

	createSession(input: CreateSessionInput): Session {
		const session: Session = {
			id: randomUUID(),
			url: input.url,
			status: 'active',
			createdAt: createTimestamp()
		};

		this.db
			.query(
				`
      INSERT INTO sessions (id, url, status, created_at)
      VALUES (?, ?, ?, ?)
    `
			)
			.run(session.id, session.url, session.status, session.createdAt);

		return session;
	}

	listSessions(): Session[] {
		const rows = this.db.query<SessionRow>('SELECT * FROM sessions ORDER BY created_at DESC').all();
		return rows.map(toSession);
	}

	getSession(id: string): Session | null {
		const row = this.db.query<SessionRow>('SELECT * FROM sessions WHERE id = ?').get(id);
		return row ? toSession(row) : null;
	}

	getSessionUrl(id: string): string | null {
		const row = this.db.query<{ url: string }>('SELECT url FROM sessions WHERE id = ?').get(id);
		return row?.url ?? null;
	}

	getSessionWithAnnotations(id: string): SessionWithAnnotations | null {
		const session = this.getSession(id);
		if (!session) return null;
		return {
			...session,
			annotations: this.listAnnotations(id)
		};
	}

	listAnnotations(sessionId: string): Annotation[] {
		const rows = this.db
			.query<AnnotationRow>(
				'SELECT * FROM annotations WHERE session_id = ? ORDER BY timestamp ASC, created_at ASC'
			)
			.all(sessionId);
		return rows.map(toAnnotation);
	}

	getAnnotation(id: string): Annotation | null {
		const row = this.db.query<AnnotationRow>('SELECT * FROM annotations WHERE id = ?').get(id);
		return row ? toAnnotation(row) : null;
	}

	createAnnotation(sessionId: string, input: CreateAnnotationInput): Annotation {
		const annotation: Annotation = {
			id: input.id || randomUUID(),
			sessionId,
			x: input.x,
			y: input.y,
			comment: input.comment,
			element: input.element,
			elementPath: input.elementPath,
			timestamp: input.timestamp,
			...(input.selectedText ? { selectedText: input.selectedText } : {}),
			...(input.boundingBox ? { boundingBox: input.boundingBox } : {}),
			...(input.nearbyText ? { nearbyText: input.nearbyText } : {}),
			...(input.cssClasses ? { cssClasses: input.cssClasses } : {}),
			...(input.nearbyElements ? { nearbyElements: input.nearbyElements } : {}),
			...(input.computedStyles ? { computedStyles: input.computedStyles } : {}),
			...(input.fullPath ? { fullPath: input.fullPath } : {}),
			...(input.accessibility ? { accessibility: input.accessibility } : {}),
			...(input.isMultiSelect !== undefined ? { isMultiSelect: input.isMultiSelect } : {}),
			isFixed: input.isFixed ?? false,
			...(input.svelteComponents ? { svelteComponents: input.svelteComponents } : {}),
			...(input.url ? { url: input.url } : {}),
			...(input.intent ? { intent: input.intent } : {}),
			...(input.severity ? { severity: input.severity } : {}),
			status: input.status ?? 'pending',
			...(input.thread ? { thread: input.thread } : {}),
			createdAt: createTimestamp(),
			...(input.resolvedBy ? { resolvedBy: input.resolvedBy } : {}),
			...(input.resolutionNote ? { resolutionNote: input.resolutionNote } : {}),
			...(input.authorId ? { authorId: input.authorId } : {}),
			kind: input.kind ?? 'feedback',
			color: input.color ?? 'brand',
			...(input.extra ? { extra: input.extra } : {})
		};

		this.db
			.query(
				`
      INSERT INTO annotations (
        id, session_id, x, y, comment, element, element_path, timestamp,
        selected_text, bounding_box, nearby_text, css_classes, nearby_elements,
        computed_styles, full_path, accessibility, is_multi_select, is_fixed,
        svelte_components, url, intent, severity, status, thread, created_at,
        resolved_at, resolved_by, resolution_note, author_id, kind, color, extra
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
			)
			.run(
				annotation.id,
				annotation.sessionId,
				annotation.x,
				annotation.y,
				annotation.comment,
				annotation.element,
				annotation.elementPath,
				annotation.timestamp,
				annotation.selectedText ?? null,
				annotation.boundingBox ? JSON.stringify(annotation.boundingBox) : null,
				annotation.nearbyText ?? null,
				annotation.cssClasses ?? null,
				annotation.nearbyElements ?? null,
				annotation.computedStyles ?? null,
				annotation.fullPath ?? null,
				annotation.accessibility ?? null,
				toDbBoolean(annotation.isMultiSelect),
				toDbBoolean(annotation.isFixed),
				annotation.svelteComponents ?? null,
				annotation.url ?? null,
				annotation.intent ?? null,
				annotation.severity ?? null,
				annotation.status,
				annotation.thread ? JSON.stringify(annotation.thread) : null,
				annotation.createdAt,
				annotation.resolvedAt ?? null,
				annotation.resolvedBy ?? null,
				annotation.resolutionNote ?? null,
				annotation.authorId ?? null,
				annotation.kind,
				annotation.color ?? null,
				annotation.extra ? JSON.stringify(annotation.extra) : null
			);

		return annotation;
	}

	updateAnnotation(id: string, patch: UpdateAnnotationInput): Annotation | null {
		const existing = this.getAnnotation(id);
		if (!existing) return null;

		const updated: Annotation = {
			...existing,
			...patch,
			id: existing.id,
			sessionId: existing.sessionId,
			updatedAt: createTimestamp()
		};

		this.db
			.query(
				`
      UPDATE annotations
      SET x = ?, y = ?, comment = ?, element = ?, element_path = ?, timestamp = ?,
          selected_text = ?, bounding_box = ?, nearby_text = ?, css_classes = ?,
          nearby_elements = ?, computed_styles = ?, full_path = ?, accessibility = ?,
          is_multi_select = ?, is_fixed = ?, svelte_components = ?, url = ?, intent = ?,
          severity = ?, status = ?, thread = ?, updated_at = ?, resolved_at = ?,
          resolved_by = ?, resolution_note = ?, author_id = ?, kind = ?, color = ?, extra = ?
      WHERE id = ?
    `
			)
			.run(
				updated.x,
				updated.y,
				updated.comment,
				updated.element,
				updated.elementPath,
				updated.timestamp,
				updated.selectedText ?? null,
				updated.boundingBox ? JSON.stringify(updated.boundingBox) : null,
				updated.nearbyText ?? null,
				updated.cssClasses ?? null,
				updated.nearbyElements ?? null,
				updated.computedStyles ?? null,
				updated.fullPath ?? null,
				updated.accessibility ?? null,
				toDbBoolean(updated.isMultiSelect),
				toDbBoolean(updated.isFixed),
				updated.svelteComponents ?? null,
				updated.url ?? null,
				updated.intent ?? null,
				updated.severity ?? null,
				updated.status ?? 'pending',
				updated.thread ? JSON.stringify(updated.thread) : null,
				updated.updatedAt ?? null,
				updated.resolvedAt ?? null,
				updated.resolvedBy ?? null,
				updated.resolutionNote ?? null,
				updated.authorId ?? null,
				updated.kind ?? 'feedback',
				updated.color ?? null,
				updated.extra ? JSON.stringify(updated.extra) : null,
				id
			);

		return updated;
	}

	deleteAnnotation(id: string): Annotation | null {
		const existing = this.getAnnotation(id);
		if (!existing) return null;
		this.db.query('DELETE FROM annotations WHERE id = ?').run(id);
		return existing;
	}

	getPending(sessionId?: string): Annotation[] {
		if (sessionId) {
			const rows = this.db
				.query<AnnotationRow>(
					"SELECT * FROM annotations WHERE session_id = ? AND status = 'pending' ORDER BY timestamp ASC, created_at ASC"
				)
				.all(sessionId);
			return rows.map(toAnnotation);
		}

		const rows = this.db
			.query<AnnotationRow>(
				"SELECT * FROM annotations WHERE status = 'pending' ORDER BY timestamp ASC, created_at ASC"
			)
			.all();
		return rows.map(toAnnotation);
	}

	addThreadMessage(
		id: string,
		message: Omit<ThreadMessage, 'id' | 'timestamp'> &
			Partial<Pick<ThreadMessage, 'id' | 'timestamp'>>
	): Annotation | null {
		const existing = this.getAnnotation(id);
		if (!existing) return null;

		const thread: ThreadMessage[] = existing.thread ? [...existing.thread] : [];
		thread.push({
			id: message.id ?? randomUUID(),
			role: message.role,
			content: message.content,
			timestamp: message.timestamp ?? Date.now()
		});

		return this.updateAnnotation(id, { thread });
	}

	getDrawings(url: string): unknown[] {
		const row = this.db.query<{ data: string }>('SELECT data FROM drawings WHERE url = ?').get(url);
		return row ? (parseJson<unknown[]>(row.data) ?? []) : [];
	}

	saveDrawings(url: string, drawings: unknown[]): void {
		this.db
			.query(`INSERT OR REPLACE INTO drawings (url, data, updated_at) VALUES (?, ?, ?)`)
			.run(url, JSON.stringify(drawings), createTimestamp());
	}

	createSubmission(input: CreateSubmissionInput): Submission {
		const id = randomUUID();
		const screenshotPath = `${SCREENSHOTS_DIR}/${id}.webp`;
		writeFileSync(screenshotPath, Buffer.from(input.image, 'base64'));

		const now = createTimestamp();
		const agent = normalizeAgent(input.agent);
		this.db
			.query(
				`INSERT INTO submissions (id, url, screenshot_path, drawings, viewport, status, created_at, agent)
				 VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`
			)
			.run(
				id,
				input.url,
				screenshotPath,
				JSON.stringify(input.drawings),
				input.viewport ? JSON.stringify(input.viewport) : null,
				now,
				agent ?? null
			);

		return {
			id,
			url: input.url,
			screenshotPath,
			drawings: input.drawings,
			viewport: input.viewport ?? null,
			status: 'pending',
			createdAt: now,
			...(agent ? { agent } : {})
		};
	}

	getSubmission(id: string): Submission | null {
		const row = this.db.query<SubmissionRow>('SELECT * FROM submissions WHERE id = ?').get(id);
		return row ? toSubmission(row) : null;
	}

	listSubmissions(status: SubmissionQueryStatus = 'all'): Submission[] {
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

	updateSubmissionStatus(id: string, status: SubmissionStatus): Submission | null {
		const existing = this.getSubmission(id);
		if (!existing) return null;
		this.db.query('UPDATE submissions SET status = ? WHERE id = ?').run(status, id);
		return { ...existing, status };
	}
}
