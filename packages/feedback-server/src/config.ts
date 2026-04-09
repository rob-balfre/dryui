import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';

export const DEFAULT_FEEDBACK_PORT = 4748;
export const DEFAULT_FEEDBACK_HOST = '127.0.0.1';
export const DEFAULT_FEEDBACK_URL = `http://localhost:${DEFAULT_FEEDBACK_PORT}`;
export const DEFAULT_STORE_DIR = join(homedir(), '.dryui-feedback');
export const DEFAULT_STORE_PATH = join(DEFAULT_STORE_DIR, 'store.db');
export const SCREENSHOTS_DIR = join(DEFAULT_STORE_DIR, 'screenshots');
export const DEFAULT_CONFIG_PATH = join(DEFAULT_STORE_DIR, 'server.json');
export const KEEPALIVE_INTERVAL_MS = 15_000;

export interface FeedbackServerConfig {
	host: string;
	port: number;
	baseUrl: string;
	dbPath: string;
	updatedAt: string;
}

function ensureParentDirectory(filePath: string): void {
	const parent = dirname(filePath);
	if (!existsSync(parent)) {
		mkdirSync(parent, { recursive: true });
	}
}

export function toFeedbackBaseUrl(host: string, port: number): string {
	const normalizedHost = host === '0.0.0.0' || host === '::' ? DEFAULT_FEEDBACK_HOST : host;
	return `http://${normalizedHost}:${port}`;
}

export function readFeedbackServerConfig(path = DEFAULT_CONFIG_PATH): FeedbackServerConfig | null {
	try {
		return JSON.parse(readFileSync(path, 'utf-8')) as FeedbackServerConfig;
	} catch {
		return null;
	}
}

export function writeFeedbackServerConfig(
	config: FeedbackServerConfig,
	path = DEFAULT_CONFIG_PATH
): void {
	try {
		ensureParentDirectory(path);
		writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`, 'utf-8');
	} catch {
		// Ignore config persistence failures. The server can still run.
	}
}
