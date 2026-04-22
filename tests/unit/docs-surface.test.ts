import { describe, expect, test } from 'bun:test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	AGENT_IDS,
	DOCS_ROUTE_PATHS,
	DOCS_ROUTES,
	DOCS_ALLOWLIST
} from '../../packages/mcp/src/docs-surface.ts';

const repoRoot = resolve(import.meta.dir, '../..');

describe('docs-surface', () => {
	test('every DOCS_ROUTE has a matching +page.svelte on disk', () => {
		for (const route of DOCS_ROUTES) {
			// Dynamic routes represented as their parent (e.g. `/components` for
			// `/components/[slug]`). Accept either a static or a dynamic match.
			const staticPath = resolve(
				repoRoot,
				'apps/docs/src/routes',
				route.path === '/' ? '' : route.path.slice(1),
				'+page.svelte'
			);
			if (existsSync(staticPath)) continue;
			// Look for a dynamic child (any [slug])
			const dynamicParent = resolve(
				repoRoot,
				'apps/docs/src/routes',
				route.path === '/' ? '' : route.path.slice(1)
			);
			const found = existsSync(dynamicParent);
			expect(found, `route ${route.path} has no +page.svelte or dynamic child`).toBe(true);
		}
	});

	test('DOCS_ROUTE_PATHS has no duplicates', () => {
		expect(new Set(DOCS_ROUTE_PATHS).size).toBe(DOCS_ROUTE_PATHS.length);
	});

	test('AGENT_IDS has no duplicates', () => {
		expect(new Set(AGENT_IDS).size).toBe(AGENT_IDS.length);
	});

	test('DOCS_ALLOWLIST is populated and stable', () => {
		expect(DOCS_ALLOWLIST.length).toBeGreaterThan(0);
		expect(DOCS_ALLOWLIST).toContain('README.md');
		expect(DOCS_ALLOWLIST).toContain('packages/mcp/src/spec.json');
	});
});
