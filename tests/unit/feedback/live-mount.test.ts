import { describe, expect, it } from 'bun:test';
import { createMountManager } from '../../../packages/feedback/src/layout-mode/live-mount.js';

describe('mount manager', () => {
	it('tracks mounted instances by placement id', () => {
		const mm = createMountManager();
		expect(mm.hasMounted('test-1')).toBe(false);
	});

	it('reconcile returns diff of added and removed ids', () => {
		const mm = createMountManager();
		const diff = mm.reconcile(['a', 'b', 'c'], new Set<string>());
		expect(diff.added).toEqual(['a', 'b', 'c']);
		expect(diff.removed).toEqual([]);
	});

	it('reconcile detects removals', () => {
		const mm = createMountManager();
		mm.markMounted('a');
		mm.markMounted('b');

		const diff = mm.reconcile(['b'], new Set(['a', 'b']));
		expect(diff.removed).toEqual(['a']);
		expect(diff.added).toEqual([]);
	});

	it('unmountAll clears all tracked instances', () => {
		const mm = createMountManager();
		mm.markMounted('a');
		mm.markMounted('b');
		expect(mm.hasMounted('a')).toBe(true);
		mm.unmountAll();
		expect(mm.hasMounted('a')).toBe(false);
		expect(mm.hasMounted('b')).toBe(false);
	});
});
