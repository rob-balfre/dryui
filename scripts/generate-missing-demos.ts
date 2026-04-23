/**
 * generate-missing-demos.ts
 *
 * Compares the docs-nav component catalog
 * (packages/mcp/src/component-catalog.ts → docsNavComponentNames) against the
 * demo files at apps/docs/src/lib/demos/*Demo.svelte and reports any
 * components that lack a demo.
 *
 * Modes:
 *   (no flag)    TOON report to stdout, exit 0 regardless.
 *   --write      Write minimal starter <ComponentName>Demo.svelte files for
 *                every missing component, then re-report. Exit 0.
 *   --check      TOON report; exit 1 if any are missing. Strict gate for CI.
 *   --warn       TOON report; exit 0 always, but prints a warning to stderr
 *                when demos are missing. Used by check:docs:demos in the root
 *                check pipeline while the gate is being phased in. Flip to
 *                --check in package.json to make it a hard error.
 *   --json       Plain JSON output instead of TOON.
 *
 * Primitives-only components (surface === 'primitive') are intentionally
 * excluded — they're headless and docs-nav already hides them.
 *
 * Demo starters follow DryUI conventions:
 *   - Import the component from its per-component subpath.
 *   - Use the DocsDemo wrapper at $lib/components/DocsDemo.svelte.
 *   - CSS grid only (no flexbox), scoped styles, no inline styles.
 */

import { resolve } from 'node:path';
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { docsNavComponentNames } from '../packages/mcp/src/component-catalog.js';
import { loadComponentMeta } from '../packages/mcp/src/load-component-meta.js';

const { entries: componentMeta } = await loadComponentMeta();

const repoRoot = resolve(import.meta.dir, '..');
const demosDir = resolve(repoRoot, 'apps/docs/src/lib/demos');

const args = new Set(process.argv.slice(2));
const writeMode = args.has('--write');
const checkMode = args.has('--check');
const warnMode = args.has('--warn');
const jsonMode = args.has('--json');

function toKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

function existingDemos(): Set<string> {
	const files = readdirSync(demosDir).filter((f) => f.endsWith('Demo.svelte'));
	return new Set(files.map((f) => f.replace(/Demo\.svelte$/, '')));
}

function describe(name: string): string {
	const meta = componentMeta[name];
	return meta?.description ?? `${name} component example.`;
}

function starterTemplate(name: string): string {
	const subpath = toKebab(name);
	const description = describe(name);
	return `<script lang="ts">
	import { ${name} } from '@dryui/ui/${subpath}';
	import DocsDemo from '$lib/components/DocsDemo.svelte';
</script>

<DocsDemo
	title="${name}"
	description="${description.replace(/"/g, '\\"')}"
>
	<div class="demo">
		<${name} />
	</div>
</DocsDemo>

<style>
	.demo {
		display: grid;
		gap: var(--dry-space-3);
		justify-items: start;
	}
</style>
`;
}

function renderTOON(missing: string[], mode: 'report' | 'check' | 'write'): string {
	const coverage = docsNavComponentNames.length - missing.length;
	const lines: string[] = [];
	lines.push(
		`demos{mode,total,existing,missing,coverage}: ${mode},${docsNavComponentNames.length},${coverage},${missing.length},${((coverage / docsNavComponentNames.length) * 100).toFixed(1)}%`
	);
	if (missing.length === 0) {
		lines.push('missing[0]: clean');
	} else {
		lines.push(`missing[${missing.length}]{name,demoPath}:`);
		for (const name of missing) {
			lines.push(`  ${name},apps/docs/src/lib/demos/${name}Demo.svelte`);
		}
	}
	const nextHints: string[] = [];
	if (missing.length > 0 && mode === 'report') {
		nextHints.push('bun run scripts/generate-missing-demos.ts --write');
	}
	if (mode === 'write' && missing.length === 0) {
		nextHints.push('bun run --cwd apps/docs build');
	}
	if (mode === 'check' && missing.length > 0) {
		nextHints.push('bun run scripts/generate-missing-demos.ts --write');
	}
	if (nextHints.length > 0) {
		lines.push(`next[${nextHints.length}]:`);
		for (const hint of nextHints) lines.push(`  ${hint}`);
	}
	return lines.join('\n');
}

function renderJSON(missing: string[], mode: string): string {
	const coverage = docsNavComponentNames.length - missing.length;
	return JSON.stringify(
		{
			mode,
			total: docsNavComponentNames.length,
			existing: coverage,
			missing: missing.length,
			missingNames: missing
		},
		null,
		2
	);
}

const existing = existingDemos();
const missing = docsNavComponentNames.filter((name) => !existing.has(name));

if (writeMode && missing.length > 0) {
	for (const name of missing) {
		const filePath = resolve(demosDir, `${name}Demo.svelte`);
		if (existsSync(filePath)) continue;
		writeFileSync(filePath, starterTemplate(name), 'utf8');
		console.error(`wrote ${filePath}`);
	}
	// re-scan after write so the final report shows zero missing
	const afterWrite = docsNavComponentNames.filter((name) => !existingDemos().has(name));
	console.log(jsonMode ? renderJSON(afterWrite, 'write') : renderTOON(afterWrite, 'write'));
	process.exit(0);
}

const mode = checkMode ? 'check' : warnMode ? 'warn' : 'report';
console.log(jsonMode ? renderJSON(missing, mode) : renderTOON(missing, mode));

if (checkMode && missing.length > 0) {
	process.exit(1);
}
if (warnMode && missing.length > 0) {
	// Phased-in gate: emit a warning header to stderr so it's visible in CI logs
	// but do not fail the overall check pipeline. Flip --warn to --check on the
	// check:docs:demos script entry in package.json to make this a hard error.
	console.error(
		`\nWARNING: ${missing.length} docs-nav component(s) have no demo file. Run \`bun run scripts/generate-missing-demos.ts --write\` to scaffold them.`
	);
}
process.exit(0);
