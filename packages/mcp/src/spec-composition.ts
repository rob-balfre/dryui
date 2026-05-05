import {
	componentCompositions,
	compositionRecipes,
	type ComponentComposition,
	type CompositionRecipe
} from './composition-data.js';

export type CompositionSpecShape = {
	components: Record<string, ComponentComposition>;
	recipes: Record<string, CompositionRecipe>;
};

export type CompositionSource = {
	componentCompositions: readonly ComponentComposition[];
	compositionRecipes: readonly CompositionRecipe[];
};

const DEFAULT_COMPOSITION_SOURCE: CompositionSource = {
	componentCompositions,
	compositionRecipes
};

export function buildCompositionSpec(
	source: CompositionSource = DEFAULT_COMPOSITION_SOURCE
): CompositionSpecShape {
	assertUniqueKeys(
		source.componentCompositions.map((composition) => composition.component.toLowerCase()),
		'composition component'
	);
	assertUniqueKeys(
		source.compositionRecipes.map((recipe) => recipe.name),
		'composition recipe'
	);

	return {
		components: Object.fromEntries(
			source.componentCompositions.map((composition) => [
				composition.component.toLowerCase(),
				composition
			])
		),
		recipes: Object.fromEntries(source.compositionRecipes.map((recipe) => [recipe.name, recipe]))
	};
}

function assertUniqueKeys(keys: readonly string[], label: string): void {
	const seen = new Set<string>();
	const duplicates = new Set<string>();

	for (const key of keys) {
		if (seen.has(key)) {
			duplicates.add(key);
			continue;
		}
		seen.add(key);
	}

	if (duplicates.size > 0) {
		throw new Error(`${label} names must be unique: ${[...duplicates].sort().join(', ')}`);
	}
}
