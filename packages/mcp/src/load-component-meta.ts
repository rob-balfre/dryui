/**
 * Loader for per-component `<name>.meta.ts` files.
 *
 * Glob-scans the ui + primitives source trees, dynamically imports every
 * `*.meta.ts` file, and produces the aggregated `Record<string, ComponentMetaEntry>`
 * that generate-spec.ts historically got from `component-catalog.ts`.
 *
 * Falls back cleanly: if no meta files exist yet, the loader returns an empty
 * record and the generator keeps using the catalog (dual-read migration path).
 */
import { existsSync } from 'node:fs';
import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { ComponentMetaEntry } from './component-catalog.js';
import { componentMetaSchema, type ComponentMeta } from './define.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULT_META_ROOTS = [
	resolve(__dirname, '../../ui/src'),
	resolve(__dirname, '../../primitives/src')
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

function toEntry(meta: ComponentMeta): ComponentMetaEntry {
	const entry: ComponentMetaEntry = {
		description: meta.description,
		category: meta.category,
		tags: meta.tags
	};
	if (meta.surface === 'primitive') {
		entry.surface = 'primitive';
	}
	return entry;
}

export async function loadComponentMeta(
	roots: readonly string[] = DEFAULT_META_ROOTS
): Promise<{ metas: ComponentMeta[]; entries: Record<string, ComponentMetaEntry> }> {
	const files: string[] = [];
	for (const root of roots) {
		files.push(...(await walk(root)));
	}

	const metas: ComponentMeta[] = [];
	const entries: Record<string, ComponentMetaEntry> = {};

	for (const file of files) {
		const mod = (await import(pathToFileURL(file).href)) as { default?: unknown };
		if (!mod.default) {
			throw new Error(`load-component-meta: ${file} has no default export`);
		}
		const parsed = componentMetaSchema.safeParse(mod.default);
		if (!parsed.success) {
			throw new Error(
				`load-component-meta: ${file} failed schema validation\n${parsed.error.message}`
			);
		}
		const meta = parsed.data;
		metas.push(meta);
		entries[meta.name] = toEntry(meta);
	}

	return { metas, entries };
}
