import type { BrowserCreateSubmissionPayload } from './submission-capture.js';
import type { Drawing } from './types.js';

export const FEEDBACK_QUERY_PARAM = 'dryui-feedback';
export const FEEDBACK_SERVER_QUERY_PARAM = 'dryui-feedback-server';
export const FEEDBACK_SERVER_STORAGE_KEY = 'dryui-feedback-server-url';
export const DASHBOARD_TAB_NAME = 'dryui-feedback-list';

export interface FeedbackServerUrlOptions {
	href?: string;
	localStorage?: Storage;
	sessionStorage?: Storage;
}

export function canonicalFeedbackPageUrl(href?: string): string {
	const currentHref = href ?? readDefaultHref();
	if (!currentHref) return '/';
	const url = new URL(currentHref);
	url.searchParams.delete(FEEDBACK_QUERY_PARAM);
	url.searchParams.delete(FEEDBACK_SERVER_QUERY_PARAM);
	url.hash = '';
	return url.toString();
}

export function hasFeedbackLaunchParam(href?: string): boolean {
	const currentHref = href ?? readDefaultHref();
	if (!currentHref) return false;
	const url = new URL(currentHref);
	return url.searchParams.get(FEEDBACK_QUERY_PARAM) === '1';
}

export function normalizeFeedbackServerUrl(value: string | null | undefined): string | null {
	if (!value) return null;
	try {
		const url = new URL(value);
		if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
		if (!isLocalFeedbackHost(url.hostname)) return null;
		url.pathname = '';
		url.search = '';
		url.hash = '';
		return url.toString().replace(/\/$/, '');
	} catch {
		return null;
	}
}

export function resolveFeedbackServerUrl(
	configured: string | undefined,
	options: FeedbackServerUrlOptions = {}
): string | undefined {
	const href = options.href ?? readDefaultHref();
	if (!href) return configured;

	const queryServerUrl = normalizeFeedbackServerUrl(
		new URL(href).searchParams.get(FEEDBACK_SERVER_QUERY_PARAM)
	);
	if (queryServerUrl) {
		storeFeedbackServerUrl(queryServerUrl, options);
		return queryServerUrl;
	}

	const storedServerUrl = readStoredFeedbackServerUrl(options);
	if (hasFeedbackLaunchParam(href) && storedServerUrl) return storedServerUrl;
	return configured ?? storedServerUrl ?? undefined;
}

export function saveFeedbackDrawings(options: {
	serverUrl: string | undefined;
	pageUrl: string;
	drawings: readonly Drawing[];
	fetch?: typeof fetch;
}): void {
	const fetcher = options.fetch ?? globalThis.fetch;
	if (!fetcher || !options.serverUrl || !options.pageUrl) return;
	fetcher(`${options.serverUrl}/drawings?url=${encodeURIComponent(options.pageUrl)}`, {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(options.drawings)
	}).catch(() => {});
}

export async function readFeedbackDrawings(options: {
	serverUrl: string;
	pageUrl: string;
	signal?: AbortSignal;
	fetch?: typeof fetch;
}): Promise<unknown> {
	const fetcher = options.fetch ?? globalThis.fetch;
	const response = await fetcher(
		`${options.serverUrl}/drawings?url=${encodeURIComponent(options.pageUrl)}`,
		{ signal: options.signal }
	);
	return response.json();
}

export async function postFeedbackSubmission(options: {
	serverUrl: string;
	payload: BrowserCreateSubmissionPayload;
	fetch?: typeof fetch;
}): Promise<Response> {
	const fetcher = options.fetch ?? globalThis.fetch;
	return fetcher(`${options.serverUrl}/submissions`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(options.payload)
	});
}

export async function readSubmissionId(response: Response): Promise<string | null> {
	try {
		const data = await response.json();
		if (typeof data === 'object' && data && 'id' in data && typeof data.id === 'string') {
			return data.id;
		}
	} catch {
		// Server did not return JSON; opening the dashboard without focus is still useful.
	}
	return null;
}

export async function readSubmissionError(response: Response): Promise<string> {
	try {
		const data = await response.json();
		if (
			typeof data === 'object' &&
			data &&
			'error' in data &&
			typeof data.error === 'string' &&
			data.error.trim()
		) {
			return data.error.trim();
		}
	} catch {
		// Fall back to the HTTP metadata below when the body is not JSON.
	}

	if (response.statusText) {
		return `${response.status} ${response.statusText}`;
	}

	return `Request failed with status ${response.status}`;
}

export function openDashboardTab(options: {
	serverUrl: string | undefined;
	submissionId: string | null;
	targetWindow?: Pick<Window, 'open'>;
	tabName?: string;
}): void {
	const targetWindow = options.targetWindow ?? readDefaultWindow();
	if (!options.serverUrl || !targetWindow) return;
	const target = new URL('/ui/', options.serverUrl);
	if (options.submissionId) target.searchParams.set('focus', options.submissionId);
	targetWindow.open(target.toString(), options.tabName ?? DASHBOARD_TAB_NAME);
}

export function submissionErrorDescription(error: unknown, serverUrl?: string): string {
	if (error instanceof DOMException) {
		if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
			return 'Screen capture was cancelled. Choose this browser tab when prompted to send feedback.';
		}

		if (error.name === 'NotFoundError') {
			return 'No capturable browser tab was available. Try again from the tab you want to annotate.';
		}
	}

	if (error instanceof TypeError && error.message === 'Failed to fetch' && serverUrl) {
		return `Could not reach the feedback server at ${serverUrl}.`;
	}

	if (error instanceof Error && error.message.trim()) return error.message;
	return 'Please try again.';
}

function storeFeedbackServerUrl(value: string, options: FeedbackServerUrlOptions): void {
	const localStorage = options.localStorage ?? readDefaultLocalStorage();
	try {
		localStorage?.setItem(FEEDBACK_SERVER_STORAGE_KEY, value);
	} catch {
		// Storage can be blocked in some browser contexts; the query param still works for this tab.
	}

	const sessionStorage = options.sessionStorage ?? readDefaultSessionStorage();
	try {
		sessionStorage?.setItem(FEEDBACK_SERVER_STORAGE_KEY, value);
	} catch {
		// Back-compat only. Ignore when session storage is unavailable.
	}
}

function readStoredFeedbackServerUrl(options: FeedbackServerUrlOptions): string | null {
	const localStorage = options.localStorage ?? readDefaultLocalStorage();
	try {
		const localValue = normalizeFeedbackServerUrl(
			localStorage?.getItem(FEEDBACK_SERVER_STORAGE_KEY) ?? null
		);
		if (localValue) return localValue;
	} catch {
		// Fall through to session storage for older tabs and constrained browsers.
	}

	const sessionStorage = options.sessionStorage ?? readDefaultSessionStorage();
	try {
		return normalizeFeedbackServerUrl(sessionStorage?.getItem(FEEDBACK_SERVER_STORAGE_KEY) ?? null);
	} catch {
		return null;
	}
}

function isPrivateOrLoopbackIpv4(hostname: string): boolean {
	const parts = hostname.split('.').map((part) => Number(part));
	if (
		parts.length !== 4 ||
		parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)
	) {
		return false;
	}

	const [first = -1, second = -1] = parts;
	return (
		first === 10 ||
		first === 127 ||
		first === 0 ||
		(first === 172 && second >= 16 && second <= 31) ||
		(first === 192 && second === 168) ||
		(first === 169 && second === 254)
	);
}

function isLocalFeedbackHost(hostname: string): boolean {
	const normalized =
		hostname.startsWith('[') && hostname.endsWith(']')
			? hostname.slice(1, -1)
			: hostname.toLowerCase();
	return (
		normalized === 'localhost' ||
		normalized.endsWith('.localhost') ||
		normalized === '::1' ||
		isPrivateOrLoopbackIpv4(normalized)
	);
}

function readDefaultHref(): string | undefined {
	return readDefaultWindow()?.location.href;
}

function readDefaultWindow(): Window | undefined {
	return typeof window === 'undefined' ? undefined : window;
}

function readDefaultLocalStorage(): Storage | undefined {
	try {
		return readDefaultWindow()?.localStorage;
	} catch {
		return undefined;
	}
}

function readDefaultSessionStorage(): Storage | undefined {
	try {
		return readDefaultWindow()?.sessionStorage;
	} catch {
		return undefined;
	}
}
