import type { CliId } from './cli-definitions.ts';

export type LauncherStep =
	| 'cli-selection'
	| 'terminal'
	| 'project'
	| 'setup'
	| 'theme'
	| 'workspace';

export interface SessionRow {
	id: number;
	selected_cli: CliId | null;
	project_path: string | null;
	current_step: LauncherStep;
	updated_at: number;
}

export interface ProjectRow {
	project_path: string;
	selected_cli: CliId;
	current_step: LauncherStep;
	created_at: number;
	updated_at: number;
}

export interface CliValidationRow {
	cli_id: CliId;
	status: 'found' | 'not-found' | 'error';
	version: string | null;
	path: string | null;
	validated_at: number;
}

export interface SessionData {
	session: SessionRow | null;
	cliValidations: CliValidationRow[];
	projects: ProjectRow[];
	activeProjectPath: string | null;
}

export interface SaveSessionInput {
	selected_cli?: CliId | null;
	project_path?: string | null;
	current_step?: LauncherStep;
}

export interface SaveCliValidationInput {
	cliId: CliId;
	status: CliValidationRow['status'];
	version: string | null;
	path: string | null;
}
