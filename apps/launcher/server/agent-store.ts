import type { Database, SQLQueryBindings } from 'bun:sqlite';

export interface AnnotationRow {
	id: string;
	project_path: string;
	element: string | null;
	element_path: string | null;
	comment: string;
	status: string;
	intent: string | null;
	severity: string | null;
	kind: string;
	color: string;
	context_json: string | null;
	thread_json: string | null;
	resolved_at: number | null;
	resolved_by: string | null;
	resolution_note: string | null;
	created_at: number;
	updated_at: number | null;
}

export interface AgentSessionRow {
	id: string;
	annotation_id: string | null;
	project_path: string;
	cli: string;
	prompt: string;
	status: string;
	progress_state: string;
	attempt: number;
	retry_of_session_id: string | null;
	exit_code: number | null;
	started_at: number;
	spawned_at: number | null;
	first_output_at: number | null;
	first_edit_at: number | null;
	last_output_at: number | null;
	finished_at: number | null;
	terminal_reason: string | null;
	failure_reason: string | null;
}

export interface AnnotationFilters {
	status?: string;
	severity?: string;
	project_path?: string;
}

export interface ThreadMessageRow {
	id: string;
	role: 'human' | 'agent';
	content: string;
	timestamp: number;
}

export interface AgentSessionFilters {
	status?: string;
	project_path?: string;
	annotation_id?: string;
}

interface TableColumnRow {
	name: string;
}

function ensureColumn(db: Database, table: string, column: string, definition: string): void {
	const columns = db.query(`PRAGMA table_info(${table})`).all() as TableColumnRow[];
	if (columns.some((entry) => entry.name === column)) return;
	db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
}

function queryAll<T>(db: Database, sql: string, params: SQLQueryBindings[] = []): T[] {
	return db.query(sql).all(...params) as T[];
}

function queryOne<T>(db: Database, sql: string, params: SQLQueryBindings[] = []): T | null {
	return db.query(sql).get(...params) as T | null;
}

export function initAnnotationDb(db: Database): void {
	db.exec(`
    CREATE TABLE IF NOT EXISTS annotations (
      id TEXT PRIMARY KEY,
      project_path TEXT NOT NULL,
      element TEXT,
      element_path TEXT,
      comment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      intent TEXT,
      severity TEXT,
      kind TEXT NOT NULL DEFAULT 'feedback',
      color TEXT NOT NULL DEFAULT 'brand',
      context_json TEXT,
      thread_json TEXT,
      resolved_at INTEGER,
      resolved_by TEXT,
      resolution_note TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER
    )
  `);
	ensureColumn(db, 'annotations', 'thread_json', 'TEXT');
	ensureColumn(db, 'annotations', 'updated_at', 'INTEGER');
	db.exec('CREATE INDEX IF NOT EXISTS idx_annotations_status ON annotations(status)');
	db.exec('CREATE INDEX IF NOT EXISTS idx_annotations_project ON annotations(project_path)');
	db.exec('CREATE INDEX IF NOT EXISTS idx_annotations_created ON annotations(created_at)');

	db.exec(`
    CREATE TABLE IF NOT EXISTS agent_sessions (
      id TEXT PRIMARY KEY,
      annotation_id TEXT,
      project_path TEXT NOT NULL,
      cli TEXT NOT NULL,
      prompt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'running',
      progress_state TEXT NOT NULL DEFAULT 'working',
      attempt INTEGER NOT NULL DEFAULT 1,
      retry_of_session_id TEXT,
      exit_code INTEGER,
      started_at INTEGER NOT NULL,
      spawned_at INTEGER,
      first_output_at INTEGER,
      first_edit_at INTEGER,
      last_output_at INTEGER,
      finished_at INTEGER,
      terminal_reason TEXT,
      failure_reason TEXT
    )
  `);
	ensureColumn(db, 'agent_sessions', 'progress_state', "TEXT NOT NULL DEFAULT 'working'");
	ensureColumn(db, 'agent_sessions', 'attempt', 'INTEGER NOT NULL DEFAULT 1');
	ensureColumn(db, 'agent_sessions', 'retry_of_session_id', 'TEXT');
	ensureColumn(db, 'agent_sessions', 'spawned_at', 'INTEGER');
	ensureColumn(db, 'agent_sessions', 'first_output_at', 'INTEGER');
	ensureColumn(db, 'agent_sessions', 'first_edit_at', 'INTEGER');
	ensureColumn(db, 'agent_sessions', 'last_output_at', 'INTEGER');
	ensureColumn(db, 'agent_sessions', 'terminal_reason', 'TEXT');
	ensureColumn(db, 'agent_sessions', 'failure_reason', 'TEXT');
	db.exec(
		'CREATE INDEX IF NOT EXISTS idx_agent_sessions_annotation ON agent_sessions(annotation_id)'
	);
	db.exec('CREATE INDEX IF NOT EXISTS idx_agent_sessions_project ON agent_sessions(project_path)');
	db.exec('CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status)');

	db.exec(`
    CREATE TABLE IF NOT EXISTS agent_session_output (
      session_id TEXT NOT NULL,
      seq INTEGER NOT NULL,
      line TEXT NOT NULL,
      timestamp INTEGER NOT NULL,
      PRIMARY KEY (session_id, seq)
    )
  `);
	db.exec(
		'CREATE INDEX IF NOT EXISTS idx_agent_output_session ON agent_session_output(session_id)'
	);
}

export function insertAnnotation(db: Database, row: AnnotationRow): void {
	db.run(
		`INSERT OR IGNORE INTO annotations (id, project_path, element, element_path, comment, status, intent, severity, kind, color, context_json, thread_json, resolved_at, resolved_by, resolution_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			row.id,
			row.project_path,
			row.element,
			row.element_path,
			row.comment,
			row.status,
			row.intent,
			row.severity,
			row.kind,
			row.color,
			row.context_json,
			row.thread_json,
			row.resolved_at,
			row.resolved_by,
			row.resolution_note,
			row.created_at,
			row.updated_at
		]
	);
}

export function insertAnnotationBatch(db: Database, rows: AnnotationRow[]): void {
	const stmt = db.prepare(
		`INSERT OR IGNORE INTO annotations (id, project_path, element, element_path, comment, status, intent, severity, kind, color, context_json, thread_json, resolved_at, resolved_by, resolution_note, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
	);

	const tx = db.transaction(() => {
		for (const row of rows) {
			stmt.run(
				row.id,
				row.project_path,
				row.element,
				row.element_path,
				row.comment,
				row.status,
				row.intent,
				row.severity,
				row.kind,
				row.color,
				row.context_json,
				row.thread_json,
				row.resolved_at,
				row.resolved_by,
				row.resolution_note,
				row.created_at,
				row.updated_at
			);
		}
	});

	tx();
}

export function getAnnotation(db: Database, id: string): AnnotationRow | null {
	return queryOne<AnnotationRow>(db, 'SELECT * FROM annotations WHERE id = ?', [id]);
}

export function listAnnotations(db: Database, filters: AnnotationFilters): AnnotationRow[] {
	const conditions: string[] = [];
	const params: SQLQueryBindings[] = [];

	if (filters.status) {
		conditions.push('status = ?');
		params.push(filters.status);
	}
	if (filters.severity) {
		conditions.push('severity = ?');
		params.push(filters.severity);
	}
	if (filters.project_path) {
		conditions.push('project_path = ?');
		params.push(filters.project_path);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	return queryAll<AnnotationRow>(
		db,
		`SELECT * FROM annotations ${where} ORDER BY created_at ASC`,
		params
	);
}

const ANNOTATION_COLUMNS = new Set([
	'project_path',
	'element',
	'element_path',
	'comment',
	'status',
	'intent',
	'severity',
	'kind',
	'color',
	'context_json',
	'thread_json',
	'resolved_at',
	'resolved_by',
	'resolution_note',
	'created_at',
	'updated_at'
]);

export function updateAnnotation(
	db: Database,
	id: string,
	patch: Partial<Omit<AnnotationRow, 'id'>>
): AnnotationRow | null {
	const existing = getAnnotation(db, id);
	if (!existing) return null;

	const fields: string[] = [];
	const values: SQLQueryBindings[] = [];

	for (const [key, value] of Object.entries(patch)) {
		if (!ANNOTATION_COLUMNS.has(key)) continue;
		fields.push(`${key} = ?`);
		values.push(value as SQLQueryBindings);
	}

	if (fields.length === 0) return existing;
	if (!('updated_at' in patch)) {
		fields.push('updated_at = ?');
		values.push(Date.now());
	}

	values.push(id);
	db.run(`UPDATE annotations SET ${fields.join(', ')} WHERE id = ?`, values);
	return getAnnotation(db, id);
}

export function appendAnnotationThreadMessage(
	db: Database,
	id: string,
	message: ThreadMessageRow
): AnnotationRow | null {
	const annotation = getAnnotation(db, id);
	if (!annotation) return null;

	const thread = annotation.thread_json
		? (JSON.parse(annotation.thread_json) as ThreadMessageRow[])
		: [];
	thread.push(message);
	const updated = updateAnnotation(db, id, {
		thread_json: JSON.stringify(thread),
		updated_at: Date.now()
	});

	return updated;
}

export function clearAnnotations(db: Database, projectPath?: string): void {
	if (projectPath) {
		db.run('DELETE FROM annotations WHERE project_path = ?', [projectPath]);
		return;
	}

	db.run('DELETE FROM annotations');
}

export function insertAgentSession(db: Database, row: AgentSessionRow): void {
	db.run(
		`INSERT OR REPLACE INTO agent_sessions (
      id, annotation_id, project_path, cli, prompt, status, progress_state, attempt,
      retry_of_session_id, exit_code, started_at, spawned_at, first_output_at, first_edit_at,
      last_output_at, finished_at, terminal_reason, failure_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		[
			row.id,
			row.annotation_id,
			row.project_path,
			row.cli,
			row.prompt,
			row.status,
			row.progress_state,
			row.attempt,
			row.retry_of_session_id,
			row.exit_code,
			row.started_at,
			row.spawned_at,
			row.first_output_at,
			row.first_edit_at,
			row.last_output_at,
			row.finished_at,
			row.terminal_reason,
			row.failure_reason
		]
	);
}

export function getAgentSession(db: Database, id: string): AgentSessionRow | null {
	return queryOne<AgentSessionRow>(db, 'SELECT * FROM agent_sessions WHERE id = ?', [id]);
}

export function listAgentSessions(db: Database, filters: AgentSessionFilters): AgentSessionRow[] {
	const conditions: string[] = [];
	const params: SQLQueryBindings[] = [];

	if (filters.status) {
		conditions.push('status = ?');
		params.push(filters.status);
	}
	if (filters.project_path) {
		conditions.push('project_path = ?');
		params.push(filters.project_path);
	}
	if (filters.annotation_id) {
		conditions.push('annotation_id = ?');
		params.push(filters.annotation_id);
	}

	const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
	return queryAll<AgentSessionRow>(
		db,
		`SELECT * FROM agent_sessions ${where} ORDER BY started_at ASC`,
		params
	);
}

export function updateAgentSession(
	db: Database,
	id: string,
	patch: Partial<Omit<AgentSessionRow, 'id'>>
): AgentSessionRow | null {
	const existing = getAgentSession(db, id);
	if (!existing) return null;

	const fields: string[] = [];
	const values: SQLQueryBindings[] = [];

	for (const [key, value] of Object.entries(patch)) {
		fields.push(`${key} = ?`);
		values.push(value as SQLQueryBindings);
	}

	if (fields.length === 0) return existing;

	values.push(id);
	db.run(`UPDATE agent_sessions SET ${fields.join(', ')} WHERE id = ?`, values);
	return getAgentSession(db, id);
}

export interface SessionOutputRow {
	session_id: string;
	seq: number;
	line: string;
	timestamp: number;
}

export function insertOutputLine(db: Database, sessionId: string, seq: number, line: string): void {
	db.run(
		'INSERT OR REPLACE INTO agent_session_output (session_id, seq, line, timestamp) VALUES (?, ?, ?, ?)',
		[sessionId, seq, line, Date.now()]
	);
}

export function getSessionOutput(db: Database, sessionId: string): SessionOutputRow[] {
	return queryAll<SessionOutputRow>(
		db,
		'SELECT session_id, seq, line, timestamp FROM agent_session_output WHERE session_id = ? ORDER BY seq ASC',
		[sessionId]
	);
}
