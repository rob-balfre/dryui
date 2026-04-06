import { validateDocument } from '../ast/validate.js';
import type { LayoutDocument } from '../ast/types.js';

export const STUDIO_STORAGE_KEY = 'dryui-studio-documents';
export const STUDIO_SNAPSHOT_KEY = 'dryui-studio-snapshots';

export interface StorageLike {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem?(key: string): void;
}

export interface StoredStudioPayload {
	documents: LayoutDocument[];
}

export interface StoredStudioSnapshots {
	snapshots: LayoutDocument[];
}

function getDefaultStorage(storage?: StorageLike): StorageLike | null {
	if (storage) {
		return storage;
	}

	if (typeof window === 'undefined') {
		return null;
	}

	return window.localStorage;
}

export function loadDocuments(storage?: StorageLike): LayoutDocument[] {
	const target = getDefaultStorage(storage);
	const raw = target?.getItem(STUDIO_STORAGE_KEY);

	if (!raw) {
		return [];
	}

	try {
		const parsed = JSON.parse(raw) as StoredStudioPayload;
		return (parsed.documents ?? []).filter((document) =>
			validateDocument(document).every((issue) => issue.severity !== 'error')
		);
	} catch {
		return [];
	}
}

export function saveDocuments(documents: LayoutDocument[], storage?: StorageLike): void {
	const target = getDefaultStorage(storage);
	target?.setItem(
		STUDIO_STORAGE_KEY,
		JSON.stringify({
			documents
		} satisfies StoredStudioPayload)
	);
}

export function saveSnapshot(document: LayoutDocument, storage?: StorageLike): LayoutDocument[] {
	const target = getDefaultStorage(storage);
	if (!target) {
		return [];
	}

	let snapshots: LayoutDocument[] = [];
	try {
		snapshots =
			(JSON.parse(target.getItem(STUDIO_SNAPSHOT_KEY) ?? '{}') as StoredStudioSnapshots)
				.snapshots ?? [];
	} catch {
		snapshots = [];
	}

	snapshots = [document, ...snapshots].slice(0, 20);
	target.setItem(
		STUDIO_SNAPSHOT_KEY,
		JSON.stringify({
			snapshots
		} satisfies StoredStudioSnapshots)
	);

	return snapshots;
}

export function createAutosave(
	save: () => void,
	delay = 1000
): {
	schedule: () => void;
	flush: () => void;
	cancel: () => void;
} {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	const flush = () => {
		if (timeout) {
			clearTimeout(timeout);
			timeout = null;
		}
		save();
	};

	return {
		schedule() {
			if (timeout) {
				clearTimeout(timeout);
			}

			timeout = setTimeout(() => {
				timeout = null;
				save();
			}, delay);
		},
		flush,
		cancel() {
			if (timeout) {
				clearTimeout(timeout);
				timeout = null;
			}
		}
	};
}
