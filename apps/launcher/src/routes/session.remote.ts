import { command, query } from '$app/server';
import {
	clearPersistedCliValidation,
	clearPersistedSession,
	getSessionData,
	getProjects,
	persistCliValidation,
	persistSession,
	switchActiveProject,
	removeProject
} from '$lib/server/session-api.ts';
import type { CliId } from '$lib/cli-definitions.ts';
import type {
	ProjectRow,
	SaveCliValidationInput,
	SaveSessionInput,
	SessionData
} from '$lib/session-types.ts';

export const getSession = query(async (): Promise<SessionData> => {
	return getSessionData();
});

export const saveSession = command('unchecked', async (data: SaveSessionInput): Promise<void> => {
	await persistSession(data);
});

export const saveCliValidation = command(
	'unchecked',
	async (data: SaveCliValidationInput): Promise<void> => {
		await persistCliValidation(data);
	}
);

export const clearCliValidationCache = command('unchecked', async (cliId: CliId): Promise<void> => {
	await clearPersistedCliValidation(cliId);
});

export const resetSession = command(async (): Promise<void> => {
	await clearPersistedSession();
});

export const fetchProjects = query(async (): Promise<ProjectRow[]> => {
	return getProjects();
});

export const activateProject = command('unchecked', async (projectPath: string): Promise<void> => {
	await switchActiveProject(projectPath);
});

export const deleteProject = command('unchecked', async (projectPath: string): Promise<void> => {
	await removeProject(projectPath);
});
