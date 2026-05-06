import { sanitizeLayoutSnapshot, type LayoutSnapshot } from './layout-snapshot.js';
import type { ElementDescriptor } from './position-hints.js';
import type { Drawing, Tool } from './types.js';

export const WIDGET_STATE_STORAGE_KEY = 'dryui-feedback-widget-state:v1';

export type WidgetDraftMode = 'annotate' | 'components';

export interface AddedSnapshot {
	id: string;
	kind: string;
	snap: LayoutSnapshot;
	label?: string;
	propsJson?: string;
}

export interface StoredMovedElement {
	descriptor: ElementDescriptor;
	snap: LayoutSnapshot;
}

export interface StoredRemovedElement {
	descriptor: ElementDescriptor;
}

export interface StoredWidgetState {
	active?: boolean;
	tool?: Tool;
	mode?: WidgetDraftMode;
	placingComponent?: string | null;
	drawings?: Drawing[];
	added?: AddedSnapshot[];
	moved?: StoredMovedElement[];
	removed?: StoredRemovedElement[];
}

export interface WidgetDraftStorageOptions {
	key?: string;
	normalizeDrawing?: (drawing: Drawing) => Drawing;
	storage?: Storage;
}

const TOOL_VALUES: readonly Tool[] = ['pencil', 'arrow', 'text', 'move', 'eraser'];
const MODE_VALUES: readonly WidgetDraftMode[] = ['annotate', 'components'];

export function sanitizeStoredWidgetState(
	value: unknown,
	options: Pick<WidgetDraftStorageOptions, 'normalizeDrawing'> = {}
): StoredWidgetState | null {
	if (!isObject(value)) return null;
	const normalizeDrawing = options.normalizeDrawing ?? cloneDrawing;
	const state: StoredWidgetState = {};
	if (typeof value.active === 'boolean') state.active = value.active;
	if (isToolValue(value.tool)) state.tool = value.tool;
	if (isModeValue(value.mode)) state.mode = value.mode;
	if (typeof value.placingComponent === 'string') state.placingComponent = value.placingComponent;
	if (Array.isArray(value.drawings)) {
		state.drawings = value.drawings.map((drawing) => normalizeDrawing(drawing as Drawing));
	}
	if (Array.isArray(value.added)) {
		state.added = value.added
			.map(sanitizeAddedSnapshot)
			.filter((entry): entry is AddedSnapshot => entry !== null);
	}
	if (Array.isArray(value.moved)) {
		state.moved = value.moved
			.map(sanitizeStoredMovedElement)
			.filter((entry): entry is StoredMovedElement => entry !== null);
	}
	if (Array.isArray(value.removed)) {
		state.removed = value.removed
			.map(sanitizeStoredRemovedElement)
			.filter((entry): entry is StoredRemovedElement => entry !== null);
	}
	return state;
}

export function hasStoredFeedbackContent(state: StoredWidgetState): boolean {
	return (
		(state.drawings?.length ?? 0) > 0 ||
		(state.added?.length ?? 0) > 0 ||
		(state.moved?.length ?? 0) > 0 ||
		(state.removed?.length ?? 0) > 0
	);
}

export function hasPersistableWidgetState(state: StoredWidgetState): boolean {
	return (
		state.active === true ||
		(state.tool !== undefined && state.tool !== 'pencil') ||
		(state.mode !== undefined && state.mode !== 'annotate') ||
		!!state.placingComponent ||
		hasStoredFeedbackContent(state)
	);
}

export function readStoredWidgetStateMap(
	options: WidgetDraftStorageOptions = {}
): Record<string, StoredWidgetState> {
	const storage = options.storage ?? readDefaultSessionStorage();
	if (!storage) return {};
	try {
		const raw = storage.getItem(options.key ?? WIDGET_STATE_STORAGE_KEY);
		if (!raw) return {};
		const parsed: unknown = JSON.parse(raw);
		if (!isObject(parsed)) return {};
		const out: Record<string, StoredWidgetState> = {};
		for (const [pageUrl, value] of Object.entries(parsed)) {
			const state = sanitizeStoredWidgetState(value, options);
			if (state && hasPersistableWidgetState(state)) out[pageUrl] = state;
		}
		return out;
	} catch {
		return {};
	}
}

export function readStoredWidgetState(
	pageUrl: string,
	options: WidgetDraftStorageOptions = {}
): StoredWidgetState | null {
	const map = readStoredWidgetStateMap(options);
	return map[pageUrl] ?? null;
}

export function writeStoredWidgetState(
	pageUrl: string,
	state: StoredWidgetState | null,
	options: WidgetDraftStorageOptions = {}
): void {
	const storage = options.storage ?? readDefaultSessionStorage();
	if (!storage || !pageUrl) return;
	try {
		const key = options.key ?? WIDGET_STATE_STORAGE_KEY;
		const map = readStoredWidgetStateMap(options);
		if (state && hasPersistableWidgetState(state)) {
			map[pageUrl] = state;
		} else {
			delete map[pageUrl];
		}
		if (Object.keys(map).length === 0) {
			storage.removeItem(key);
		} else {
			storage.setItem(key, JSON.stringify(map));
		}
	} catch {
		// Draft persistence is best-effort; quota and private-mode failures should not break feedback.
	}
}

export function removeStoredWidgetState(
	pageUrl: string,
	options: WidgetDraftStorageOptions = {}
): void {
	writeStoredWidgetState(pageUrl, null, options);
}

function sanitizeAddedSnapshot(value: unknown): AddedSnapshot | null {
	if (!isObject(value) || typeof value.id !== 'string' || typeof value.kind !== 'string') {
		return null;
	}
	const snap = sanitizeLayoutSnapshot(value.snap);
	if (!snap) return null;
	return {
		id: value.id,
		kind: value.kind,
		snap,
		...(typeof value.label === 'string' ? { label: value.label } : {}),
		...(typeof value.propsJson === 'string' ? { propsJson: value.propsJson } : {})
	};
}

function sanitizeElementDescriptor(value: unknown): ElementDescriptor | null {
	if (!isObject(value) || typeof value.tag !== 'string') return null;
	return {
		tag: value.tag,
		...(typeof value.id === 'string' ? { id: value.id } : {}),
		...(typeof value.selector === 'string' ? { selector: value.selector } : {})
	};
}

function sanitizeStoredMovedElement(value: unknown): StoredMovedElement | null {
	if (!isObject(value)) return null;
	const descriptor = sanitizeElementDescriptor(value.descriptor);
	const snap = sanitizeLayoutSnapshot(value.snap);
	if (!descriptor || !snap) return null;
	return { descriptor, snap };
}

function sanitizeStoredRemovedElement(value: unknown): StoredRemovedElement | null {
	if (!isObject(value)) return null;
	const descriptor = sanitizeElementDescriptor(value.descriptor);
	if (!descriptor) return null;
	return { descriptor };
}

function isToolValue(value: unknown): value is Tool {
	return typeof value === 'string' && TOOL_VALUES.includes(value as Tool);
}

function isModeValue(value: unknown): value is WidgetDraftMode {
	return typeof value === 'string' && MODE_VALUES.includes(value as WidgetDraftMode);
}

function isObject(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object';
}

function cloneDrawing(drawing: Drawing): Drawing {
	return { ...drawing };
}

function readDefaultSessionStorage(): Storage | undefined {
	if (typeof window === 'undefined') return undefined;
	try {
		return window.sessionStorage;
	} catch {
		return undefined;
	}
}
