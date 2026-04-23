import { describe, expect, test } from 'bun:test';
import { existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import {
	AGENT_IDS,
	DOCS_ROUTE_PATHS,
	DOCS_ROUTES,
	DOCS_ALLOWLIST
} from '../../packages/mcp/src/docs-surface.ts';

const repoRoot = resolve(import.meta.dir, '../..');

function hasPageDescendant(dir: string): boolean {
	let entries;
	try {
		entries = readdirSync(dir, { withFileTypes: true });
	} catch {
		return false;
	}
	for (const entry of entries) {
		if (entry.isFile() && entry.name === '+page.svelte') return true;
		if (entry.isDirectory() && hasPageDescendant(resolve(dir, entry.name))) return true;
	}
	return false;
}

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
			// Look for a +page.svelte anywhere beneath the route's folder (e.g. a
			// dynamic `[slug]` child). Walk is recursive so nested dynamic routes
			// would also satisfy this check.
			const dynamicParent = resolve(
				repoRoot,
				'apps/docs/src/routes',
				route.path === '/' ? '' : route.path.slice(1)
			);
			const found = hasPageDescendant(dynamicParent);
			expect(found, `route ${route.path} has no +page.svelte descendant on disk`).toBe(true);
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
