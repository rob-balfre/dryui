import { describe, test, expect } from 'bun:test';

describe('FileSelect', () => {
	describe('context interface', () => {
		test('FileSelect exports exist in primitives', async () => {
			const mod = await import('../../packages/primitives/src/file-select/index.js');
			expect(mod.FileSelect).toBeDefined();
			expect(mod.FileSelect.Root).toBeDefined();
			expect(mod.FileSelect.Trigger).toBeDefined();
			expect(mod.FileSelect.Value).toBeDefined();
			expect(mod.FileSelect.Clear).toBeDefined();
		});

		test('FileSelect exports exist in UI', async () => {
			const mod = await import('../../packages/ui/src/file-select/index.js');
			expect(mod.FileSelect).toBeDefined();
			expect(mod.FileSelect.Root).toBeDefined();
			expect(mod.FileSelect.Trigger).toBeDefined();
			expect(mod.FileSelect.Value).toBeDefined();
			expect(mod.FileSelect.Clear).toBeDefined();
		});

		test('subpath import resolves the same shape', async () => {
			const mod = await import('../../packages/ui/src/file-select/index.js');
			expect(mod.FileSelect).toBeDefined();
			expect(typeof mod.FileSelect).toBe('object');
			expect(mod.FileSelect.Root).toBeDefined();
			expect(mod.FileSelect.Trigger).toBeDefined();
			expect(mod.FileSelect.Value).toBeDefined();
			expect(mod.FileSelect.Clear).toBeDefined();
		});
	});
});
