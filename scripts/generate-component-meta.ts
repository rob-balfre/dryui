/**
 * Rebuilds the per-component `.meta.ts` sibling files under
 * `packages/ui/src/<dir>/` or `packages/primitives/src/<dir>/` from the
 * aggregated view produced by walking those source trees.
 *
 * Emits one file per entry, locating the component by converting the
 * PascalCase name into the existing kebab-case directory. Components whose
 * entry has `surface: 'primitive'` land in primitives; everything else is
 * composed and lands in ui. An entry whose target directory does not exist is
 * logged and skipped so the regeneration is self-reporting.
 *
 * Re-runnable: generated files are idempotent.
 *
 * Usage:
 *   bun scripts/generate-component-meta.ts         # emit files
 *   bun scripts/generate-component-meta.ts --dry   # print plan, write nothing
 */

import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(scriptDir, '..');

const dry = process.argv.includes('--dry');

interface ComponentMetaEntry {
	readonly name: string;
	readonly description: string;
	readonly category: string;
	readonly tags: readonly string[];
	readonly surface?: 'primitive' | 'composed';
}

const META_ROOTS = [
	resolve(repoRoot, 'packages/ui/src'),
	resolve(repoRoot, 'packages/primitives/src')
];

async function walk(root: string): Promise<string[]> {
	if (!existsSync(root)) return [];
	const out: string[] = [];
	const entries = await readdir(root, { withFileTypes: true });
	for (const entry of entries) {
		const full = resolve(root, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
			out.push(...(await walk(full)));
		} else if (entry.isFile() && entry.name.endsWith('.meta.ts')) {
			out.push(full);
		}
	}
	return out;
}

function assertEntry(value: unknown, file: string): ComponentMetaEntry {
	if (!value || typeof value !== 'object') {
		throw new Error(`generate-component-meta: ${file} default export is not an object`);
	}
	const obj = value as Record<string, unknown>;
	const name = obj.name;
	const description = obj.description;
	const category = obj.category;
	const tags = obj.tags;
	const surface = obj.surface;
	if (typeof name !== 'string' || name.length === 0) {
		throw new Error(`generate-component-meta: ${file} missing string "name"`);
	}
	if (typeof description !== 'string' || description.length === 0) {
		throw new Error(`generate-component-meta: ${file} missing string "description"`);
	}
	if (typeof category !== 'string' || category.length === 0) {
		throw new Error(`generate-component-meta: ${file} missing string "category"`);
	}
	if (!Array.isArray(tags) || !tags.every((t) => typeof t === 'string' && t.length > 0)) {
		throw new Error(`generate-component-meta: ${file} "tags" must be a non-empty string[]`);
	}
	if (surface !== undefined && surface !== 'primitive' && surface !== 'composed') {
		throw new Error(`generate-component-meta: ${file} "surface" must be 'primitive' | 'composed'`);
	}
	return {
		name,
		description,
		category,
		tags: tags as string[],
		...(surface ? { surface: surface as 'primitive' | 'composed' } : {})
	};
}

async function loadComponentMeta(): Promise<Record<string, ComponentMetaEntry>> {
	const files: string[] = [];
	for (const root of META_ROOTS) {
		files.push(...(await walk(root)));
	}
	const entries: Record<string, ComponentMetaEntry> = {};
	for (const file of files) {
		const mod = (await import(pathToFileURL(file).href)) as { default?: unknown };
		if (!mod.default) {
			throw new Error(`generate-component-meta: ${file} has no default export`);
		}
		const entry = assertEntry(mod.default, file);
		entries[entry.name] = entry;
	}
	return entries;
}

const componentMeta = await loadComponentMeta();

function pascalToKebab(name: string): string {
	return name
		.replace(/([a-z0-9])([A-Z])/g, '$1-$2')
		.replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
		.toLowerCase();
}

function renderMetaFile(name: string, entry: ComponentMetaEntry): string {
	const surfaceLine = entry.surface ? `\n\tsurface: '${entry.surface}',` : '';
	const tags = entry.tags.map((t) => JSON.stringify(t)).join(', ');
	return `/** DryUI agent metadata. */
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
