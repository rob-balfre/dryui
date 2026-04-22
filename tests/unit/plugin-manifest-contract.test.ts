import { describe, expect, test } from 'bun:test';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

/**
 * Plugin-side guidance must not duplicate the long editor-setup blocks that
 * live in the docs site. If a plugin manifest crosses a soft length budget
 * it likely re-stated setup prose that should live on dryui.dev instead.
 */

const pluginRoot = resolve(import.meta.dir, '../../packages/plugin');
const manifestPaths = [
	'.claude-plugin/plugin.json',
	'.plugin/plugin.json',
	'gemini-extension.json'
];

// Plugin manifests should be under ~30 lines of pure manifest (name, version,
// skills, hooks, repo). Anything over means someone inlined a setup tutorial.
const MANIFEST_LINE_BUDGET = 30;

describe('plugin manifest contract', () => {
	for (const rel of manifestPaths) {
		test(`${rel} stays under ${MANIFEST_LINE_BUDGET} lines`, () => {
			const abs = resolve(pluginRoot, rel);
			if (!existsSync(abs)) return; // manifest is optional per ecosystem
			const lines = readFileSync(abs, 'utf8').split('\n').length;
			expect(
				lines,
				`${rel} is ${lines} lines — manifests should point at dryui.dev for setup prose`
			).toBeLessThanOrEqual(MANIFEST_LINE_BUDGET);
		});

		test(`${rel} declares the minimum required fields`, () => {
			const abs = resolve(pluginRoot, rel);
			if (!existsSync(abs)) return;
			const raw = JSON.parse(readFileSync(abs, 'utf8')) as Record<string, unknown>;
			expect(raw.name, `${rel} missing "name"`).toBeDefined();
			expect(raw.version, `${rel} missing "version"`).toBeDefined();
		});
	}

	test('GEMINI.md plugin guidance points at dryui.dev, does not re-document setup', () => {
		const abs = resolve(pluginRoot, 'GEMINI.md');
		if (!existsSync(abs)) return;
		const body = readFileSync(abs, 'utf8');
		// Cheap heuristic: anything long enough to be a tutorial has headings and
		// code fences. Short pointer files will not.
		const codeFences = (body.match(/```/g) ?? []).length / 2;
		expect(
			codeFences,
			'GEMINI.md has multiple code fences — move setup prose to dryui.dev/getting-started'
		).toBeLessThanOrEqual(3);
	});
});
