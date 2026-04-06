import type {
	Annotation,
	DesignPlacement,
	FeedbackSettings,
	RearrangeState,
	WireframeState
} from '../types.js';
import { DEFAULT_SETTINGS, normalizeAnnotationColor } from '../constants.js';

const ANNOTATION_PREFIX = 'dryui-feedback-';
const DESIGN_PREFIX = 'dryui-feedback-design-';
const REARRANGE_PREFIX = 'dryui-feedback-rearrange-';
const WIREFRAME_PREFIX = 'dryui-feedback-wireframe-';
const SESSION_PREFIX = 'dryui-feedback-session-';
const SETTINGS_KEY = 'dryui-feedback-settings';
const URL_ANNOTATION_PREFIX = 'dryui-feedback:annotations:';
const URL_DESIGN_PLACEMENTS_PREFIX = 'dryui-feedback:design-placements:';
const URL_REARRANGE_STATE_PREFIX = 'dryui-feedback:rearrange-state:';
const URL_WIREFRAME_STATE_PREFIX = 'dryui-feedback:wireframe-state:';
const LEGACY_DESIGN_PLACEMENTS_KEY = 'dryui-feedback:design-placements';
const LEGACY_REARRANGE_STATE_KEY = 'dryui-feedback:rearrange-state';
const LEGACY_WIREFRAME_STATE_KEY = 'dryui-feedback:wireframe-state';
const URL_SESSION_PREFIX = 'dryui-feedback:session:';
const URL_SETTINGS_KEY = 'dryui-feedback:settings';
const TOOLBAR_HIDDEN_SESSION_KEY = `${SESSION_PREFIX}toolbar-hidden`;
const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

function hasStorage(): boolean {
	return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hasSessionStorage(): boolean {
	return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined';
}

function filterRetained<T extends { timestamp?: number }>(items: T[]): T[] {
	const cutoff = Date.now() - RETENTION_MS;
	return items.filter((item) => !item.timestamp || item.timestamp > cutoff);
}

function normalizeAnnotationColors<T>(items: T[]): T[] {
	return items.map((item) => {
		if (!item || typeof item !== 'object' || !('color' in item)) return item;
		const color = (item as { color?: string | null }).color;
		if (typeof color !== 'string') return item;
		return {
			...item,
			color: normalizeAnnotationColor(color)
		};
	}) as T[];
}

function loadJson<T>(key: string, fallback: T): T {
	if (!hasStorage()) return fallback;
	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function saveJson(key: string, value: unknown): void {
	if (!hasStorage()) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// localStorage can be unavailable or full
	}
}

function getPathnameKey(urlOrPath: string): string {
	try {
		return new URL(urlOrPath).pathname || '/';
	} catch {
		return urlOrPath || '/';
	}
}

function getUrlScopedKey(prefix: string, url: string): string {
	return `${prefix}${url}`;
}

function readJsonFromKeys<T>(keys: string[], fallback: T): T {
	if (!hasStorage()) return fallback;

	for (const key of keys) {
		try {
			const raw = localStorage.getItem(key);
			if (raw === null) continue;
			return JSON.parse(raw) as T;
		} catch {
			continue;
		}
	}

	return fallback;
}

function writeJsonToKeys(keys: string[], value: unknown): void {
	for (const key of keys) {
		saveJson(key, value);
	}
}

function removeKeys(keys: string[]): void {
	for (const key of keys) {
		removeStorageKey(key);
	}
}

function removeStorageKey(key: string): void {
	if (!hasStorage()) return;
	try {
		localStorage.removeItem(key);
	} catch {
		// ignore write failures
	}
}

export function getStorageKey(pathname: string): string {
	return `${ANNOTATION_PREFIX}${pathname}`;
}

export function getAnnotationStorageKey(url: string): string {
	return getUrlScopedKey(URL_ANNOTATION_PREFIX, url);
}

export function getDesignPlacementsStorageKey(_url: string): string {
	return getUrlScopedKey(URL_DESIGN_PLACEMENTS_PREFIX, _url);
}

export function getRearrangeStateStorageKey(_url: string): string {
	return getUrlScopedKey(URL_REARRANGE_STATE_PREFIX, _url);
}

export function getWireframeStateStorageKey(_url: string): string {
	return getUrlScopedKey(URL_WIREFRAME_STATE_PREFIX, _url);
}

export function getSessionStorageKeyForUrl(url: string): string {
	return getUrlScopedKey(URL_SESSION_PREFIX, url);
}

export function loadAnnotations<T = Annotation>(pathname: string): T[] {
	const annotations = loadJson<T[]>(getStorageKey(pathname), []);
	return normalizeAnnotationColors(
		filterRetained(annotations as Array<T & { timestamp?: number }>) as T[]
	);
}

export function loadAnnotationsForUrl<T = Annotation>(url: string): T[] {
	const annotations = readJsonFromKeys<T[]>(
		[getAnnotationStorageKey(url), getStorageKey(getPathnameKey(url))],
		[]
	);
	return normalizeAnnotationColors(
		filterRetained(annotations as Array<T & { timestamp?: number }>) as T[]
	);
}

export function loadAllAnnotations<T = Annotation>(): Map<string, T[]> {
	const result = new Map<string, T[]>();
	if (!hasStorage()) return result;

	const cutoff = Date.now() - RETENTION_MS;
	const seenPathnames = new Set<string>();

	try {
		for (let index = 0; index < localStorage.length; index += 1) {
			const key = localStorage.key(index);
			if (!key?.startsWith(URL_ANNOTATION_PREFIX)) continue;

			const url = key.slice(URL_ANNOTATION_PREFIX.length);
			seenPathnames.add(getPathnameKey(url));
			const annotations = normalizeAnnotationColors(
				loadJson<Array<T & { timestamp?: number }>>(key, []).filter(
					(annotation) => !annotation.timestamp || annotation.timestamp > cutoff
				) as T[]
			);

			if (annotations.length > 0) {
				result.set(url, annotations);
			}
		}

		for (let index = 0; index < localStorage.length; index += 1) {
			const key = localStorage.key(index);
			if (!key?.startsWith(ANNOTATION_PREFIX)) continue;

			const pathname = key.slice(ANNOTATION_PREFIX.length);
			if (seenPathnames.has(pathname)) continue;

			const annotations = normalizeAnnotationColors(
				loadJson<Array<T & { timestamp?: number }>>(key, []).filter(
					(annotation) => !annotation.timestamp || annotation.timestamp > cutoff
				) as T[]
			);

			if (annotations.length > 0) {
				result.set(pathname, annotations);
			}
		}
	} catch {
		return result;
	}

	return result;
}

export function saveAnnotations<T = Annotation>(pathname: string, annotations: T[]): void {
	saveJson(getStorageKey(pathname), annotations);
}

export function saveAnnotationsForUrl<T = Annotation>(url: string, annotations: T[]): void {
	saveJson(getAnnotationStorageKey(url), annotations);
}

export function saveAnnotationsWithSyncMarker(
	url: string,
	annotations: Annotation[],
	sessionId: string
): void {
	saveAnnotationsForUrl(
		url,
		annotations.map((annotation) => ({
			...annotation,
			_syncedTo: sessionId
		}))
	);
}

export function getUnsyncedAnnotations(url: string, sessionId?: string): Annotation[] {
	return loadAnnotationsForUrl<Annotation>(url).filter((annotation) => {
		if (!annotation._syncedTo) return true;
		return sessionId ? annotation._syncedTo !== sessionId : false;
	});
}

export function clearSyncMarkers(url: string): void {
	const annotations = loadAnnotationsForUrl<Annotation>(url).map((annotation) => {
		const { _syncedTo, ...rest } = annotation;
		return rest;
	});
	saveAnnotationsForUrl(url, annotations);
}

export function clearAnnotations(pathname: string): void {
	removeStorageKey(getStorageKey(pathname));
}

export function clearAnnotationsForUrl(url: string): void {
	removeKeys([getAnnotationStorageKey(url), getStorageKey(getPathnameKey(url))]);
}

export function getDesignStorageKey(pathname: string): string {
	return `${DESIGN_PREFIX}${pathname}`;
}

export function loadDesignPlacements(pathname: string): DesignPlacement[] {
	return loadJson<DesignPlacement[]>(getDesignStorageKey(pathname), []);
}

export function loadDesignPlacementsForUrl(url: string): DesignPlacement[] {
	return readJsonFromKeys<DesignPlacement[]>(
		[
			getDesignPlacementsStorageKey(url),
			LEGACY_DESIGN_PLACEMENTS_KEY,
			getDesignStorageKey(getPathnameKey(url))
		],
		[]
	);
}

export function saveDesignPlacements(pathname: string, placements: DesignPlacement[]): void {
	saveJson(getDesignStorageKey(pathname), placements);
}

export function saveDesignPlacementsForUrl(url: string, placements: DesignPlacement[]): void {
	saveJson(getDesignPlacementsStorageKey(url), placements);
}

export function clearDesignPlacements(pathname: string): void {
	removeStorageKey(getDesignStorageKey(pathname));
}

export function clearDesignPlacementsForUrl(url: string): void {
	removeKeys([
		getDesignPlacementsStorageKey(url),
		LEGACY_DESIGN_PLACEMENTS_KEY,
		getDesignStorageKey(getPathnameKey(url))
	]);
}

export function getRearrangeStorageKey(pathname: string): string {
	return `${REARRANGE_PREFIX}${pathname}`;
}

export function loadRearrangeState(pathname: string): RearrangeState | null {
	return loadJson<RearrangeState | null>(getRearrangeStorageKey(pathname), null);
}

export function loadRearrangeStateForUrl(url: string): RearrangeState | null {
	return readJsonFromKeys<RearrangeState | null>(
		[
			getRearrangeStateStorageKey(url),
			LEGACY_REARRANGE_STATE_KEY,
			getRearrangeStorageKey(getPathnameKey(url))
		],
		null
	);
}

export function saveRearrangeState(pathname: string, state: RearrangeState): void {
	saveJson(getRearrangeStorageKey(pathname), state);
}

export function saveRearrangeStateForUrl(url: string, state: RearrangeState): void {
	saveJson(getRearrangeStateStorageKey(url), state);
}

export function clearRearrangeState(pathname: string): void {
	removeStorageKey(getRearrangeStorageKey(pathname));
}

export function clearRearrangeStateForUrl(url: string): void {
	removeKeys([
		getRearrangeStateStorageKey(url),
		LEGACY_REARRANGE_STATE_KEY,
		getRearrangeStorageKey(getPathnameKey(url))
	]);
}

export function getWireframeStorageKey(pathname: string): string {
	return `${WIREFRAME_PREFIX}${pathname}`;
}

export function loadWireframeState(pathname: string): WireframeState | null {
	return loadJson<WireframeState | null>(getWireframeStorageKey(pathname), null);
}

export function loadWireframeStateForUrl(url: string): WireframeState | null {
	return readJsonFromKeys<WireframeState | null>(
		[
			getWireframeStateStorageKey(url),
			LEGACY_WIREFRAME_STATE_KEY,
			getWireframeStorageKey(getPathnameKey(url))
		],
		null
	);
}

export function saveWireframeState(pathname: string, state: WireframeState): void {
	saveJson(getWireframeStorageKey(pathname), state);
}

export function saveWireframeStateForUrl(url: string, state: WireframeState): void {
	saveJson(getWireframeStateStorageKey(url), state);
}

export function clearWireframeState(pathname: string): void {
	removeStorageKey(getWireframeStorageKey(pathname));
}

export function clearWireframeStateForUrl(url: string): void {
	removeKeys([
		getWireframeStateStorageKey(url),
		LEGACY_WIREFRAME_STATE_KEY,
		getWireframeStorageKey(getPathnameKey(url))
	]);
}

export function getSessionStorageKey(pathname: string): string {
	return `${SESSION_PREFIX}${pathname}`;
}

export function loadSessionId(pathname: string): string | null {
	return loadJson<string | null>(getSessionStorageKey(pathname), null);
}

export function loadSessionIdForUrl(url: string): string | null {
	return readJsonFromKeys<string | null>(
		[getSessionStorageKeyForUrl(url), getSessionStorageKey(getPathnameKey(url))],
		null
	);
}

export function saveSessionId(pathname: string, sessionId: string): void {
	saveJson(getSessionStorageKey(pathname), sessionId);
}

export function saveSessionIdForUrl(url: string, sessionId: string): void {
	saveJson(getSessionStorageKeyForUrl(url), sessionId);
}

export function clearSessionId(pathname: string): void {
	removeStorageKey(getSessionStorageKey(pathname));
}

export function clearSessionIdForUrl(url: string): void {
	removeKeys([getSessionStorageKeyForUrl(url), getSessionStorageKey(getPathnameKey(url))]);
}

export function loadToolbarHidden(): boolean {
	if (!hasSessionStorage()) return false;
	try {
		return sessionStorage.getItem(TOOLBAR_HIDDEN_SESSION_KEY) === '1';
	} catch {
		return false;
	}
}

export function saveToolbarHidden(hidden: boolean): void {
	if (!hasSessionStorage()) return;
	try {
		if (hidden) {
			sessionStorage.setItem(TOOLBAR_HIDDEN_SESSION_KEY, '1');
			return;
		}
		sessionStorage.removeItem(TOOLBAR_HIDDEN_SESSION_KEY);
	} catch {
		// sessionStorage can be unavailable
	}
}

export function loadSettings(): FeedbackSettings {
	const settings = readJsonFromKeys<Partial<FeedbackSettings>>(
		[URL_SETTINGS_KEY, SETTINGS_KEY],
		{}
	);
	return {
		...DEFAULT_SETTINGS,
		...settings,
		annotationColor: normalizeAnnotationColor(settings.annotationColor)
	};
}

export function saveSettings(settings: FeedbackSettings): void {
	writeJsonToKeys([URL_SETTINGS_KEY, SETTINGS_KEY], settings);
}

export function clearSettings(): void {
	removeKeys([URL_SETTINGS_KEY, SETTINGS_KEY]);
}
