import { describe, expect, test } from 'bun:test';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { loadComponentMeta } from './load-component-meta.ts';

const tempDirs: string[] = [];

function createRoot(files: Record<string, string>): string {
	const root = mkdtempSync(resolve(tmpdir(), 'dryui-meta-'));
	tempDirs.push(root);
	for (const [rel, contents] of Object.entries(files)) {
		const abs = resolve(root, rel);
		mkdirSync(resolve(abs, '..'), { recursive: true });
		writeFileSync(abs, contents);
	}
	return root;
}

function cleanup(): void {
	for (const dir of tempDirs.splice(0)) {
		rmSync(dir, { recursive: true, force: true });
	}
}

describe('loadComponentMeta', () => {
	test('aggregates .meta.ts files into a manifest-shaped record', async () => {
		const root = createRoot({
			'button/button.meta.ts': `export default {
				name: 'Button',
				description: 'Button desc',
				category: 'action',
				tags: ['form', 'action']
			};`,
			'accordion/accordion.meta.ts': `export default {
				name: 'Accordion',
				description: 'Accordion desc',
				category: 'nav',
				tags: [],
				surface: 'primitive'
			};`,
			'button/button.svelte': '<!-- ignored -->'
		});

		try {
			const { metas, entries } = await loadComponentMeta([root]);
			expect(metas.map((m) => m.name).sort()).toEqual(['Accordion', 'Button']);
			expect(entries.Button).toEqual({
				description: 'Button desc',
				category: 'action',
				tags: ['form', 'action']
			});
			expect(entries.Accordion.surface).toBe('primitive');
		} finally {
			cleanup();
		}
	});

	test('throws a clear error if a meta file has no default export', async () => {
		const root = createRoot({
			'broken/broken.meta.ts': `export const notDefault = {};`
		});

		try {
			await expect(loadComponentMeta([root])).rejects.toThrow(/no default export/);
		} finally {
			cleanup();
		}
	});

	test('throws a clear error if the default export fails schema validation', async () => {
		const root = createRoot({
			'broken/broken.meta.ts': `export default { name: 'X' };`
		});

		try {
			await expect(loadComponentMeta([root])).rejects.toThrow(/failed schema validation/);
		} finally {
			cleanup();
		}
	});

	test('returns an empty record when no meta files exist', async () => {
		const root = createRoot({});
		try {
			const { metas, entries } = await loadComponentMeta([root]);
			expect(metas).toEqual([]);
			expect(entries).toEqual({});
		} finally {
			cleanup();
		}
	});
});
