import type { PageLoad } from './$types';
import { decodeRecipe, type WizardRecipe } from '@dryui/theme-wizard/engine';

export interface ThemeWizardData {
	recipeParam: string | null;
	recipe: WizardRecipe | null;
}

function readRecipeParam(url: URL): string | null {
	try {
		return url.searchParams.get('t');
	} catch {
		return null;
	}
}

export const load: PageLoad<ThemeWizardData> = ({ url }) => {
	const recipeParam = readRecipeParam(url);
	if (!recipeParam) {
		return { recipeParam: null, recipe: null };
	}

	try {
		return {
			recipeParam,
			recipe: decodeRecipe(recipeParam)
		};
	} catch {
		return {
			recipeParam,
			recipe: null
		};
	}
};
