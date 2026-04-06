import { env } from '$env/dynamic/private';
import type {
	CliValidationRow,
	ProjectRow,
	SaveCliValidationInput,
	SaveSessionInput,
	SessionData
} from '$lib/session-types.ts';
import type { CliId } from '$lib/cli-definitions.ts';

const BASE_URL = env.DRYUI_LAUNCHER_SERVER_URL ?? 'http://127.0.0.1:4210';
const SESSION_URL = `${BASE_URL}/api/session`;
const PROJECTS_URL = `${BASE_URL}/api/projects`;

const EMPTY_SESSION_DATA: SessionData = {
	session: null,
	cliValidations: [],
	projects: [],
	activeProjectPath: null
};

async function request(pathname = '', init?: RequestInit): Promise<Response> {
	return fetch(`${SESSION_URL}${pathname}`, {
		...init,
		headers: {
			'content-type': 'application/json',
			...init?.headers
		}
	});
}

async function requestJson<T>(pathname = '', init?: RequestInit): Promise<T> {
	const response = await request(pathname, init);
	if (!response.ok) {
		throw new Error(`Launcher server request failed: ${response.status}`);
	}
	return response.json() as Promise<T>;
}

export async function getSessionData(): Promise<SessionData> {
	try {
		return await requestJson<SessionData>();
	} catch {
		return EMPTY_SESSION_DATA;
	}
}

export async function persistSession(data: SaveSessionInput): Promise<void> {
	try {
		await request('', {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	} catch {}
}

export async function clearPersistedSession(): Promise<void> {
	try {
		await request('', { method: 'DELETE' });
	} catch {}
}

export async function persistCliValidation(data: SaveCliValidationInput): Promise<void> {
	try {
		await request('/cli-validation', {
			method: 'PUT',
			body: JSON.stringify(data)
		});
	} catch {}
}

export async function clearPersistedCliValidation(cliId: CliId): Promise<void> {
	try {
		await request(`/cli-validation/${encodeURIComponent(cliId)}`, { method: 'DELETE' });
	} catch {}
}

export function hasCachedValidation(cliId: CliId, rows: CliValidationRow[]): boolean {
	return rows.some((row) => row.cli_id === cliId && row.status === 'found');
}

export async function getProjects(): Promise<ProjectRow[]> {
	try {
		const response = await fetch(PROJECTS_URL, {
			headers: { 'content-type': 'application/json' }
		});
		if (!response.ok) return [];
		return response.json() as Promise<ProjectRow[]>;
	} catch {
		return [];
	}
}

export async function switchActiveProject(projectPath: string): Promise<void> {
	try {
		await fetch(`${PROJECTS_URL}/${encodeURIComponent(projectPath)}`, {
			method: 'PUT',
			headers: { 'content-type': 'application/json' }
		});
	} catch {}
}

export async function removeProject(projectPath: string): Promise<void> {
	try {
		await fetch(`${PROJECTS_URL}/${encodeURIComponent(projectPath)}`, {
			method: 'DELETE',
			headers: { 'content-type': 'application/json' }
		});
	} catch {}
}
