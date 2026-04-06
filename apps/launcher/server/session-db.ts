import { Database } from 'bun:sqlite';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';
import type { CliId } from '../src/lib/cli-definitions.ts';
import type {
	CliValidationRow,
	LauncherStep,
	ProjectRow,
	SaveSessionInput,
	SessionData,
	SessionRow
} from '../src/lib/session-types.ts';

const DB_DIR = join(homedir(), '.dryui');
const DB_PATH = join(DB_DIR, 'launcher.db');

let db: Database | null = null;

export function getDb(): Database {
	if (db) return db;

	mkdirSync(DB_DIR, { recursive: true });
	db = new Database(DB_PATH);
	db.exec('PRAGMA journal_mode=WAL');

	db.exec(`
    CREATE TABLE IF NOT EXISTS cli_validations (
      cli_id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      version TEXT,
      path TEXT,
      validated_at INTEGER NOT NULL
    )
  `);

	db.exec(`
    CREATE TABLE IF NOT EXISTS session (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      selected_cli TEXT,
      project_path TEXT,
      current_step TEXT NOT NULL DEFAULT 'cli-selection',
      updated_at INTEGER NOT NULL
    )
  `);

	db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_path TEXT PRIMARY KEY,
      selected_cli TEXT NOT NULL,
      current_step TEXT NOT NULL DEFAULT 'cli-selection',
      theme_recipe TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `);

	// Add theme_recipe column if it doesn't exist (for existing databases)
	try {
		db.exec(`ALTER TABLE projects ADD COLUMN theme_recipe TEXT`);
	} catch {
		// Column already exists
	}

	db.exec(`
    CREATE TABLE IF NOT EXISTS active_project (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      project_path TEXT REFERENCES projects(project_path) ON DELETE SET NULL,
      updated_at INTEGER NOT NULL
    )
  `);

	return db;
}

export function getSessionRow(): SessionRow | null {
	return getDb().query('SELECT * FROM session WHERE id = 1').get() as SessionRow | null;
}

export function getCliValidationRows(): CliValidationRow[] {
	return getDb().query('SELECT * FROM cli_validations').all() as CliValidationRow[];
}

export function getSessionSnapshot(): SessionData {
	return {
		session: getSessionRow(),
		cliValidations: getCliValidationRows(),
		projects: getAllProjects(),
		activeProjectPath: getActiveProjectPath()
	};
}

export function shouldSyncProjectFromSession(currentStep: LauncherStep): boolean {
	return currentStep !== 'cli-selection' && currentStep !== 'project';
}

export function upsertSession(data: SaveSessionInput): void {
	const database = getDb();
	const existing = getSessionRow();
	const now = Date.now();

	if (existing) {
		const selectedCli = data.selected_cli !== undefined ? data.selected_cli : existing.selected_cli;
		const projectPath = data.project_path !== undefined ? data.project_path : existing.project_path;
		const currentStep = data.current_step ?? existing.current_step;

		database.run(
			'UPDATE session SET selected_cli = ?, project_path = ?, current_step = ?, updated_at = ? WHERE id = 1',
			[selectedCli, projectPath, currentStep, now]
		);

		// Only treat progressed sessions as reusable projects.
		if (projectPath && selectedCli && shouldSyncProjectFromSession(currentStep)) {
			upsertProject(projectPath, selectedCli as CliId, currentStep);
		}
		return;
	}

	database.run(
		'INSERT INTO session (id, selected_cli, project_path, current_step, updated_at) VALUES (1, ?, ?, ?, ?)',
		[
			data.selected_cli ?? null,
			data.project_path ?? null,
			data.current_step ?? 'cli-selection',
			now
		]
	);

	const currentStep = data.current_step ?? 'cli-selection';

	if (data.project_path && data.selected_cli && shouldSyncProjectFromSession(currentStep)) {
		upsertProject(data.project_path, data.selected_cli as CliId, currentStep);
	}
}

export function clearSession(): void {
	getDb().run('DELETE FROM session WHERE id = 1');
}

// --- Multi-project support ---

export function getAllProjects(): ProjectRow[] {
	return getDb().query('SELECT * FROM projects ORDER BY updated_at DESC').all() as ProjectRow[];
}

export function getProject(projectPath: string): ProjectRow | null {
	return getDb()
		.query('SELECT * FROM projects WHERE project_path = ?')
		.get(projectPath) as ProjectRow | null;
}

export function upsertProject(projectPath: string, selectedCli: CliId, currentStep?: string): void {
	const database = getDb();
	const now = Date.now();
	const existing = getProject(projectPath);

	if (existing) {
		const step = currentStep ?? existing.current_step;
		database.run(
			'UPDATE projects SET selected_cli = ?, current_step = ?, updated_at = ? WHERE project_path = ?',
			[selectedCli, step, now, projectPath]
		);
	} else {
		database.run(
			'INSERT INTO projects (project_path, selected_cli, current_step, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
			[projectPath, selectedCli, currentStep ?? 'cli-selection', now, now]
		);
	}

	setActiveProject(projectPath);
}

export function deleteProject(projectPath: string): void {
	const database = getDb();
	const active = getActiveProjectPath();
	if (active === projectPath) {
		database.run('DELETE FROM active_project WHERE id = 1');
	}
	database.run('DELETE FROM projects WHERE project_path = ?', [projectPath]);
}

export function getActiveProjectPath(): string | null {
	const row = getDb().query('SELECT project_path FROM active_project WHERE id = 1').get() as {
		project_path: string | null;
	} | null;
	return row?.project_path ?? null;
}

export function setActiveProject(projectPath: string): void {
	const database = getDb();
	const now = Date.now();
	database.run(
		`INSERT INTO active_project (id, project_path, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET project_path = ?, updated_at = ?`,
		[projectPath, now, projectPath, now]
	);
}

export function upsertCliValidation(input: {
	cliId: CliId;
	status: CliValidationRow['status'];
	version: string | null;
	path: string | null;
}): void {
	const now = Date.now();

	getDb().run(
		`INSERT INTO cli_validations (cli_id, status, version, path, validated_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(cli_id) DO UPDATE SET status = ?, version = ?, path = ?, validated_at = ?`,
		[
			input.cliId,
			input.status,
			input.version,
			input.path,
			now,
			input.status,
			input.version,
			input.path,
			now
		]
	);
}

export function deleteCliValidation(cliId: CliId): void {
	getDb().run('DELETE FROM cli_validations WHERE cli_id = ?', [cliId]);
}

// --- Theme recipe persistence ---

export function saveThemeRecipe(projectPath: string, recipe: string): void {
	const database = getDb();
	const now = Date.now();
	database.run('UPDATE projects SET theme_recipe = ?, updated_at = ? WHERE project_path = ?', [
		recipe,
		now,
		projectPath
	]);
}

export function getThemeRecipe(projectPath: string): string | null {
	const row = getDb()
		.query('SELECT theme_recipe FROM projects WHERE project_path = ?')
		.get(projectPath) as { theme_recipe: string | null } | null;
	return row?.theme_recipe ?? null;
}
