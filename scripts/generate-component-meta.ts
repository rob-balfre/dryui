/**
 * Migrates the legacy `packages/mcp/src/component-catalog.ts` into per-component
 * `.meta.ts` sibling files under `packages/ui/src/<dir>/` or
 * `packages/primitives/src/<dir>/`.
 *
 * Emits one file per catalog entry, locating the component by converting the
 * PascalCase catalog key into the existing kebab-case directory. Components
 * whose catalog entry has `surface: 'primitive'` land in primitives; everything
 * else is composed and lands in ui. A catalog entry whose target directory
 * does not exist is logged and skipped so the migration is self-reporting.
 *
 * Re-runnable: generated files are idempotent. The accompanying
 * `loadComponentMeta` in `packages/mcp/src/load-component-meta.ts` aggregates
 * these files at build time, and `generate-spec.ts` prefers the meta entries
 * over the catalog while both exist (dual-read).
 *
 * Usage:
 *   bun scripts/generate-component-meta.ts         # emit files
 *   bun scripts/generate-component-meta.ts --dry   # print plan, write nothing
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

const dry = process.argv.includes('--dry');

// ── Import catalog dynamically (Bun resolves the .ts source) ────────────────
const { componentMeta } = (await import(
	resolve(repoRoot, 'packages/mcp/src/component-catalog.ts')
)) as {
	componentMeta: Record<
		string,
		{
			description: string;
			category: string;
			tags: string[];
			surface?: 'primitive' | 'composed';
		}
	>;
};

function pascalToKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

function renderMetaFile(name: string, entry: (typeof componentMeta)[string]): string {
	const surfaceLine = entry.surface ? `\n\tsurface: '${entry.surface}',` : '';
	const tags = entry.tags.map((t) => JSON.stringify(t)).join(', ');
	// Deliberately plain-object export — no '@dryui/mcp/define' import so that
	// ui/primitives do not gain a workspace dep on mcp. The mcp loader
	// validates these objects against the defineComponent schema at build time.
	// Keep meta files dependency-free so ui/primitives do not gain a workspace
	// dep on mcp. The mcp loader validates these objects against the
	// defineComponent schema at build time, which catches type drift.
	return `/** DryUI agent metadata. Consumed by @dryui/mcp/load-component-meta. */
export default {
	name: ${JSON.stringify(name)},
	description: ${JSON.stringify(entry.description)},
	category: ${JSON.stringify(entry.category)},${surfaceLine}
	tags: [${tags}]
};
`;
}

const uiSrc = resolve(repoRoot, 'packages/ui/src');
const primSrc = resolve(repoRoot, 'packages/primitives/src');

type Plan = {
	readonly name: string;
	readonly dir: string;
	readonly file: string;
	readonly skipped?: string;
};

const plans: Plan[] = [];

for (const [name, entry] of Object.entries(componentMeta)) {
	const kebab = pascalToKebab(name);
	const uiDir = resolve(uiSrc, kebab);
	const primDir = resolve(primSrc, kebab);

	let targetDir: string | null = null;
	if (entry.surface === 'primitive') {
		if (existsSync(primDir)) targetDir = primDir;
		else if (existsSync(uiDir)) targetDir = uiDir;
	} else {
		if (existsSync(uiDir)) targetDir = uiDir;
		else if (existsSync(primDir)) targetDir = primDir;
	}

	if (!targetDir) {
		plans.push({
			name,
			dir: kebab,
			file: '',
			skipped: `no ui/ or primitives/ dir for "${kebab}"`
		});
		continue;
	}

	const file = resolve(targetDir, `${kebab}.meta.ts`);
	plans.push({ name, dir: kebab, file });
}

let wrote = 0;
let skipped = 0;
for (const plan of plans) {
	if (plan.skipped) {
		console.warn(`  skip ${plan.name}: ${plan.skipped}`);
		skipped += 1;
		continue;
	}
	const entry = componentMeta[plan.name];
	const contents = renderMetaFile(plan.name, entry);
	if (dry) {
		console.log(`  ${plan.file.replace(repoRoot + '/', '')}`);
		continue;
	}
	mkdirSync(dirname(plan.file), { recursive: true });
	writeFileSync(plan.file, contents);
	wrote += 1;
}

console.log(
	`\ngenerate-component-meta: wrote ${wrote} file(s), skipped ${skipped}${dry ? ' (dry run)' : ''}`
);
