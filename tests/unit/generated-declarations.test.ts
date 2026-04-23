import { afterEach, describe, expect, test } from 'bun:test';
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
	cleanPackageSrcDeclarations,
	collectPackageSrcDeclarations
} from '../../scripts/lib/generated-declarations.ts';

const roots: string[] = [];

function makeRoot(): string {
	const root = mkdtempSync(join(tmpdir(), 'dryui-generated-declarations-'));
	roots.push(root);
	mkdirSync(join(root, 'packages', 'ui', 'src', 'button'), { recursive: true });
	mkdirSync(join(root, 'packages', 'mcp', 'src'), { recursive: true });
	return root;
}

function write(root: string, path: string, contents = 'export {};\n'): void {
	const absolutePath = join(root, path);
	mkdirSync(dirname(absolutePath), { recursive: true });
	writeFileSync(absolutePath, contents);
}

afterEach(() => {
	for (const root of roots.splice(0)) {
		rmSync(root, { recursive: true, force: true });
	}
});

describe('package source declaration hygiene', () => {
	test('classifies tracked shims separately from ignored generated declarations', async () => {
		const root = makeRoot();
		write(root, 'packages/ui/src/button/button.svelte.d.ts');
		write(root, 'packages/ui/src/button/index.d.ts');
		write(root, 'packages/mcp/src/node-shims.d.ts');

		const scan = await collectPackageSrcDeclarations({
			repoRoot: root,
			trackedPaths: ['packages/mcp/src/node-shims.d.ts'],
			ignoredPaths: [
				'packages/ui/src/button/button.svelte.d.ts',
				'packages/ui/src/button/index.d.ts'
			]
		});

		expect(scan).toEqual({
			generated: ['packages/ui/src/button/button.svelte.d.ts', 'packages/ui/src/button/index.d.ts'],
			tracked: ['packages/mcp/src/node-shims.d.ts'],
			unexpected: []
		});
	});

	test('removes ignored generated declarations and preserves tracked declarations', async () => {
		const root = makeRoot();
		write(root, 'packages/ui/src/button/button.svelte.d.ts');
		write(root, 'packages/mcp/src/node-shims.d.ts');

		const scan = await cleanPackageSrcDeclarations({
			repoRoot: root,
			trackedPaths: ['packages/mcp/src/node-shims.d.ts'],
			ignoredPaths: ['packages/ui/src/button/button.svelte.d.ts']
		});

		expect(scan.generated).toEqual(['packages/ui/src/button/button.svelte.d.ts']);
		expect(existsSync(join(root, 'packages/ui/src/button/button.svelte.d.ts'))).toBe(false);
		expect(existsSync(join(root, 'packages/mcp/src/node-shims.d.ts'))).toBe(true);
	});

	test('does not delete unexpected untracked declarations', async () => {
		const root = makeRoot();
		write(root, 'packages/ui/src/button/manual.d.ts');

		const scan = await cleanPackageSrcDeclarations({
			repoRoot: root,
			trackedPaths: [],
			ignoredPaths: []
		});

		expect(scan).toEqual({
			generated: [],
			tracked: [],
			unexpected: ['packages/ui/src/button/manual.d.ts']
		});
		expect(existsSync(join(root, 'packages/ui/src/button/manual.d.ts'))).toBe(true);
	});
});
