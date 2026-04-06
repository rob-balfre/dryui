import type { CatalogEntry } from './types.js';

// Spec JSON shape (subset we use)
interface SpecComponent {
	import: string;
	description: string;
	category: string;
	tags: string[];
	compound: boolean;
	structure?: { tree: string[] };
}

interface Spec {
	components: Record<string, SpecComponent>;
}

interface CompositionEntry {
	component: string;
	alternatives: { rank: number; component: string; useWhen: string }[];
	antiPatterns: { pattern: string; reason: string; fix: string }[];
	combinesWith: string[];
}

let cachedCatalog: CatalogEntry[] | null = null;

export function getCatalog(): CatalogEntry[] {
	return cachedCatalog ?? [];
}

export async function loadCatalog(): Promise<CatalogEntry[]> {
	if (cachedCatalog) return cachedCatalog;
	const [specMod, compMod] = await Promise.all([
		import('@dryui/mcp/spec'),
		import('@dryui/mcp/composition-data')
	]);

	const spec = (specMod.default ?? specMod) as Spec;
	const compositions: CompositionEntry[] = compMod.componentCompositions;

	const compositionMap = new Map<string, CompositionEntry>(
		compositions.map((c) => [c.component, c])
	);

	const entries = Object.entries(spec.components).map(([name, meta]) => {
		const comp = compositionMap.get(name);
		return {
			name,
			category: meta.category,
			description: meta.description,
			tags: meta.tags,
			compound: meta.compound,
			importPath: meta.import,
			structure: meta.structure ? meta.structure.tree.join('\n') : null,
			alternatives:
				comp?.alternatives.map(({ rank, component, useWhen }) => ({ rank, component, useWhen })) ??
				[],
			antiPatterns: comp?.antiPatterns ?? [],
			combinesWith: comp?.combinesWith ?? []
		};
	});

	cachedCatalog = entries;
	return entries;
}

/**
 * Token-based keyword search over a loaded catalog. Returns entries sorted by
 * descending relevance score (matches against name, tags, description, category).
 */
export function searchCatalog(catalog: CatalogEntry[], query: string): CatalogEntry[] {
	const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
	if (tokens.length === 0) return catalog;

	const scored = catalog.map((entry) => {
		const name = entry.name.toLowerCase();
		const desc = entry.description.toLowerCase();
		const tags = entry.tags.map((t) => t.toLowerCase());
		const category = entry.category.toLowerCase();

		let score = 0;
		for (const token of tokens) {
			if (name === token) score += 10;
			else if (name.startsWith(token)) score += 6;
			else if (name.includes(token)) score += 4;
			if (tags.includes(token)) score += 5;
			else if (tags.some((t) => t.includes(token))) score += 2;
			if (category === token) score += 3;
			if (desc.includes(token)) score += 1;
		}
		return { entry, score };
	});

	return scored
		.filter(({ score }) => score > 0)
		.sort((a, b) => b.score - a.score)
		.map(({ entry }) => entry);
}

/**
 * Return alternatives for a given component name (empty array if unknown).
 */
export function getAlternatives(
	catalog: CatalogEntry[],
	name: string
): CatalogEntry['alternatives'] {
	return catalog.find((e) => e.name === name)?.alternatives ?? [];
}

/**
 * Return anti-patterns for a given component name (empty array if unknown).
 */
export function getAntiPatterns(
	catalog: CatalogEntry[],
	name: string
): CatalogEntry['antiPatterns'] {
	return catalog.find((e) => e.name === name)?.antiPatterns ?? [];
}
