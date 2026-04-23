import { describe, expect, it } from 'bun:test';
import { encodeRecipe } from '@dryui/theme-wizard/engine';
import { load } from '../../../apps/docs/src/routes/theme-wizard/+page';

function callLoad(href: string) {
	return Promise.resolve(load({ url: new URL(href) } as Parameters<typeof load>[0]));
}

describe('theme wizard route load', () => {
	it('decodes shared recipe URLs into initial page data', async () => {
		const recipeParam = encodeRecipe({
			brand: { h: 18, s: 70, b: 91 },
			personality: 'rich',
			typography: { fontPreset: 'Serif', scale: 'spacious' },
			shape: { radiusPreset: 'pill', radiusScale: 0.75, density: 'compact' },
			shadows: { preset: 'deep', intensity: 1.25, tintBrand: false },
			adjust: { brightness: 96, contrast: 104, saturate: 110, hueRotate: -8 }
		});

		const data = await callLoad(`https://dryui.test/theme-wizard?t=${recipeParam}`);

		expect(data.recipeParam).toBe(recipeParam);
		expect(data.recipe).toMatchObject({
			brand: { h: 18, s: 70, b: 91 },
			personality: 'rich',
			typography: { fontPreset: 'Serif', scale: 'spacious' },
			shape: { radiusPreset: 'pill', radiusScale: 0.75, density: 'compact' },
			shadows: { preset: 'deep', intensity: 1.25, tintBrand: false },
			adjust: { brightness: 96, contrast: 104, saturate: 110, hueRotate: -8 }
		});
	});

	it('keeps malformed recipe URLs inert', async () => {
		const data = await callLoad('https://dryui.test/theme-wizard?t=not-a-recipe');

		expect(data.recipeParam).toBe('not-a-recipe');
		expect(data.recipe).toBeNull();
	});
});
