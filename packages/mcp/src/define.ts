/**
 * Single-source component registry (Plan Phase 2).
 *
 * Components live as `.svelte` files under `packages/ui/src/<name>/` and
 * `packages/primitives/src/<name>/`. The associated metadata (description,
 * category, tags, surface) used to live in one hand-authored
 * `component-catalog.ts`, which drifted easily as components were added or
 * renamed.
 *
 * With this module every component ships a sibling `<name>.meta.ts` file
 * that calls {@link defineComponent}. The build-time loader aggregates
 * every meta file into the same `Record<string, ComponentMetaEntry>` the
 * generator expects, and {@link createLibrary} exposes a thin wrapper so
 * downstream generators can query by category, tag, or surface without
 * reaching for the aggregate record directly.
 */
import { z } from 'zod';

export type ComponentSurface = 'primitive' | 'composed';

export const componentMetaSchema = z.object({
	name: z.string().min(1),
	description: z.string().min(1),
	category: z.string().min(1),
	tags: z.array(z.string().min(1)).default([]),
	surface: z.enum(['primitive', 'composed']).optional()
});

export type ComponentMetaInput = z.input<typeof componentMetaSchema>;
export type ComponentMeta = z.output<typeof componentMetaSchema>;

/**
 * Declare component metadata alongside the `.svelte` source. The config is
 * runtime-validated via Zod so drift (missing description, empty tags) fails
 * the build, not a downstream consumer.
 */
export function defineComponent(config: ComponentMetaInput): ComponentMeta {
	return componentMetaSchema.parse(config);
}

export interface ComponentLibrary {
	readonly byName: ReadonlyMap<string, ComponentMeta>;
	readonly all: readonly ComponentMeta[];
	readonly primitiveNames: readonly string[];
	readonly byCategory: ReadonlyMap<string, readonly ComponentMeta[]>;
	readonly byTag: ReadonlyMap<string, readonly ComponentMeta[]>;
}

/**
 * Build indexes over the aggregated component metadata. Pure function: same
 * input → same `ComponentLibrary` → deterministic spec / contract output.
 */
export function createLibrary(metas: readonly ComponentMeta[]): ComponentLibrary {
	const byName = new Map<string, ComponentMeta>();
	const primitiveNames: string[] = [];
	const byCategoryMut = new Map<string, ComponentMeta[]>();
	const byTagMut = new Map<string, ComponentMeta[]>();

	for (const meta of metas) {
		if (byName.has(meta.name)) {
			throw new Error(`createLibrary: duplicate component "${meta.name}"`);
		}
		byName.set(meta.name, meta);
		if (meta.surface === 'primitive') primitiveNames.push(meta.name);
		const catBucket = byCategoryMut.get(meta.category) ?? [];
		catBucket.push(meta);
		byCategoryMut.set(meta.category, catBucket);
		for (const tag of meta.tags) {
			const tagBucket = byTagMut.get(tag) ?? [];
			tagBucket.push(meta);
			byTagMut.set(tag, tagBucket);
		}
	}

	const byCategory = new Map<string, readonly ComponentMeta[]>();
	for (const [k, v] of byCategoryMut) byCategory.set(k, v);
	const byTag = new Map<string, readonly ComponentMeta[]>();
	for (const [k, v] of byTagMut) byTag.set(k, v);

	return {
		byName,
		all: metas,
		primitiveNames: primitiveNames.sort((a, b) => a.localeCompare(b)),
		byCategory,
		byTag
	};
}
