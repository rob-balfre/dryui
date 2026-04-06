import { describe, expect, it } from 'bun:test';
import { createDocument } from '../../../packages/canvas/src/ast/factory.js';
import {
	createAutosave,
	loadDocuments,
	saveDocuments
} from '../../../packages/canvas/src/persistence/storage.js';
import {
	createDocumentExportBlob,
	deserializeDocument
} from '../../../packages/canvas/src/persistence/export.js';

class MemoryStorage {
	#store = new Map<string, string>();

	getItem(key: string): string | null {
		return this.#store.get(key) ?? null;
	}

	setItem(key: string, value: string): void {
		this.#store.set(key, value);
	}
}

describe('canvas persistence', () => {
	it('round-trips documents through the storage helpers', () => {
		const storage = new MemoryStorage();
		const document = createDocument('Saved doc');

		saveDocuments([document], storage);
		const [loaded] = loadDocuments(storage);

		expect(loaded?.id).toBe(document.id);
		expect(loaded?.name).toBe('Saved doc');
	});

	it('exports and imports Studio documents as JSON', async () => {
		const document = createDocument('Exported doc');
		const blob = createDocumentExportBlob(document);
		const restored = deserializeDocument(await blob.text());

		expect(restored.id).toBe(document.id);
		expect(restored.name).toBe(document.name);
	});

	it('debounces autosave execution', async () => {
		let calls = 0;
		const autosave = createAutosave(() => {
			calls += 1;
		}, 10);

		autosave.schedule();
		autosave.schedule();

		await new Promise((resolve) => setTimeout(resolve, 30));
		expect(calls).toBe(1);
	});
});
