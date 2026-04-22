import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';

export const DEFAULT_FEEDBACK_PORT = 4748;
export const DEFAULT_FEEDBACK_HOST = '127.0.0.1';
export const DEFAULT_FEEDBACK_URL = `http://localhost:${DEFAULT_FEEDBACK_PORT}`;
export const FEEDBACK_DIR_NAME = join('.dryui', 'feedback');
export const KEEPALIVE_INTERVAL_MS = 15_000;
// Try up to this many contiguous ports starting from the requested one before
// bailing. Enough headroom for a handful of concurrent projects on one machine.
export const FEEDBACK_PORT_SEARCH_LIMIT = 20;

export interface FeedbackServerConfig {
	host: string;
	port: number;
	baseUrl: string;
	dbPath: string;
	projectRoot: string;
	updatedAt: string;
}

export interface ProjectFeedbackPaths {
	root: string;
	dir: string;
	dbPath: string;
	screenshotsDir: string;
	configPath: string;
}

function ensureParentDirectory(filePath: string): void {
	const parent = dirname(filePath);
	if (!existsSync(parent)) {
		mkdirSync(parent, { recursive: true });
	}
}

export function projectFeedbackPaths(projectRoot: string): ProjectFeedbackPaths {
	const root = resolve(projectRoot);
	const dir = join(root, FEEDBACK_DIR_NAME);
	return {
		root,
		dir,
		dbPath: join(dir, 'store.db'),
		screenshotsDir: join(dir, 'screenshots'),
		configPath: join(dir, 'server.json')
	};
}

export function toFeedbackBaseUrl(host: string, port: number): string {
	const normalizedHost = host === '0.0.0.0' || host === '::' ? DEFAULT_FEEDBACK_HOST : host;
	return `http://${normalizedHost}:${port}`;
}

export function readFeedbackServerConfig(projectRoot: string): FeedbackServerConfig | null {
	const { configPath } = projectFeedbackPaths(projectRoot);
	try {
		return JSON.parse(readFileSync(configPath, 'utf-8')) as FeedbackServerConfig;
	} catch {
		return null;
	}
}

export function writeFeedbackServerConfig(
	projectRoot: string,
	config: Omit<FeedbackServerConfig, 'projectRoot'>
): void {
	const paths = projectFeedbackPaths(projectRoot);
	const payload: FeedbackServerConfig = { ...config, projectRoot: paths.root };
	try {
		ensureParentDirectory(paths.configPath);
		writeFileSync(paths.configPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf-8');
	} catch {
		// Ignore config persistence failures. The server can still run.
	}
}

/**
 * Walk up from `start` looking for an existing `.dryui/feedback/server.json`.
 * Used by the MCP server and hook script, which don't know the project root up
 * front but inherit the CWD the editor or shell ran them from.
 */
export function findProjectFeedbackConfig(
	start: string = process.cwd()
): { projectRoot: string; config: FeedbackServerConfig } | null {
	let current = resolve(start);
	while (true) {
		const configPath = join(current, FEEDBACK_DIR_NAME, 'server.json');
		try {
			const config = JSON.parse(readFileSync(configPath, 'utf-8')) as FeedbackServerConfig;
			return { projectRoot: current, config };
		} catch {
			// Missing or corrupt — keep walking so a valid ancestor still wins.
		}
		const parent = dirname(current);
		if (parent === current) return null;
		current = parent;
	}
}

/**
 * Resolve a path option against a project root when it's relative. Absolute
 * paths pass through unchanged so callers can still opt out of the project
 * directory (e.g. tests writing to a temp dir).
 */
export function resolveProjectPath(projectRoot: string, value: string | undefined): string | null {
	if (!value) return null;
	return isAbsolute(value) ? value : resolve(projectRoot, value);
}
