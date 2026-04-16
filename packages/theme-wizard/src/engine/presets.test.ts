import { describe, expect, test } from 'bun:test';
import { generateTheme } from './derivation.js';
import { PRESETS, RECIPE_PRESETS } from './presets.js';

describe('theme wizard presets', () => {
	test('includes the wireframe brand preset', () => {
		expect(PRESETS).toContainEqual({
			name: 'Wireframe',
			brandInput: { h: 0, s: 0, b: 50 }
		});
	});

	test('includes the wireframe recipe preset', () => {
		expect(RECIPE_PRESETS).toContainEqual({
			name: 'Wireframe',
			description: 'Monochrome, outlined, low-noise UI',
			recipe: {
				brand: { h: 0, s: 0, b: 50 },
				personality: 'minimal',
				neutralMode: 'neutral',
				typography: { fontPreset: 'Mono', scale: 'compact' },
				shape: { radiusPreset: 'sharp', radiusScale: 1, density: 'compact' },
				shadows: { preset: 'flat', intensity: 1, tintBrand: false },
				adjust: { saturate: 0 }
			}
		});
	});

	test('wireframe recipe resolves to a grayscale-first theme', () => {
		const preset = RECIPE_PRESETS.find((candidate) => candidate.name === 'Wireframe');

		expect(preset).toBeDefined();

		const theme = generateTheme(preset!.recipe.brand, { neutralMode: preset!.recipe.neutralMode });

		expect(theme.light['--dry-color-bg-base']).toBe('#ffffff');
		expect(theme.dark['--dry-color-bg-base']).toBe('hsl(0, 0%, 10%)');
		expect(theme.light['--dry-color-fill-brand']).toMatch(/^hsl\(24, 0%, 50%\)$/);
		expect(theme.dark['--dry-color-fill-brand']).toMatch(/^hsl\(24, 0%, 78%\)$/);
	});
});
