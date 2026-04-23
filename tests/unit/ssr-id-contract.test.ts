import { describe, expect, test } from 'bun:test';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const repoRoot = join(import.meta.dir, '../..');

function collectSvelteFiles(dir: string): string[] {
	const entries = readdirSync(dir, { withFileTypes: true });
	const files: string[] = [];

	for (const entry of entries) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) {
			files.push(...collectSvelteFiles(path));
		} else if (entry.isFile() && entry.name.endsWith('.svelte')) {
			files.push(path);
		}
	}

	return files;
}

describe('SSR-safe generated IDs', () => {
	test('Svelte components do not use module-global ID helpers for markup IDs', () => {
		const componentFiles = [
			...collectSvelteFiles(join(repoRoot, 'packages/primitives/src')),
			...collectSvelteFiles(join(repoRoot, 'packages/ui/src'))
		];

		const offenders = componentFiles
			.map((path) => {
				const source = readFileSync(path, 'utf8');
				return /\b(createId|generateFormId)\s*\(/.test(source) ? relative(repoRoot, path) : null;
			})
			.filter(Boolean);

		expect(offenders).toEqual([]);
	});
});
