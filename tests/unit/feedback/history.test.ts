import { describe, expect, it } from 'bun:test';
import { createHistory } from '../../../packages/feedback/src/layout-mode/history.js';
import type { DesignPlacement } from '../../../packages/feedback/src/layout-mode/types.js';

function placement(id: string, x = 0, y = 0): DesignPlacement {
	return { id, type: 'button', x, y, width: 100, height: 40, scrollY: 0, timestamp: Date.now() };
}

describe('history', () => {
	it('starts with empty stacks', () => {
		const h = createHistory();
		expect(h.canUndo()).toBe(false);
		expect(h.canRedo()).toBe(false);
	});

	it('pushes snapshots and undoes', () => {
		const h = createHistory();
		h.push([placement('a')]);
		h.push([placement('a'), placement('b')]);

		expect(h.canUndo()).toBe(true);
		const prev = h.undo();
		expect(prev).toHaveLength(1);
		expect(prev![0].id).toBe('a');
	});

	it('redoes after undo', () => {
		const h = createHistory();
		h.push([placement('a')]);
		h.push([placement('a'), placement('b')]);

		h.undo();
		expect(h.canRedo()).toBe(true);
		const next = h.redo();
		expect(next).toHaveLength(2);
	});

	it('clears redo stack on new push', () => {
		const h = createHistory();
		h.push([placement('a')]);
		h.push([placement('a'), placement('b')]);

		h.undo();
		h.push([placement('c')]);
		expect(h.canRedo()).toBe(false);
	});

	it('caps at max entries', () => {
		const h = createHistory(3);
		h.push([placement('a')]);
		h.push([placement('b')]);
		h.push([placement('c')]);
		h.push([placement('d')]);

		let count = 0;
		while (h.canUndo()) {
			h.undo();
			count++;
		}
		expect(count).toBe(3);
	});

	it('clear resets both stacks', () => {
		const h = createHistory();
		h.push([placement('a')]);
		h.push([placement('b')]);
		h.undo();
		h.clear();
		expect(h.canUndo()).toBe(false);
		expect(h.canRedo()).toBe(false);
	});
});
