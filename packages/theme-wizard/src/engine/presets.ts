import type { BrandInput } from './derivation.js';
import type { WizardRecipe } from './url-codec.js';

export interface Preset {
	name: string;
	brandInput: BrandInput;
}

export const PRESETS: Preset[] = [
	{
		name: 'Default',
		brandInput: { h: 230, s: 65, b: 85 }
	},
	{
		name: 'Wireframe',
		brandInput: { h: 0, s: 0, b: 50 }
	},
	{
		name: 'Ocean',
		brandInput: { h: 200, s: 80, b: 70 }
	},
	{
		name: 'Forest',
		brandInput: { h: 145, s: 60, b: 55 }
	},
	{
		name: 'Sunset',
		brandInput: { h: 25, s: 80, b: 90 }
	},
	{
		name: 'Rose',
		brandInput: { h: 340, s: 65, b: 85 }
	},
	{
		name: 'Lavender',
		brandInput: { h: 270, s: 45, b: 80 }
	},
	{
		name: 'Midnight',
		brandInput: { h: 240, s: 80, b: 35 }
	},
	{
		name: 'Ember',
		brandInput: { h: 10, s: 85, b: 75 }
	}
];

export interface RecipePreset {
	name: string;
	description: string;
	recipe: WizardRecipe;
}

export const RECIPE_PRESETS: RecipePreset[] = [
	{
		name: 'Default',
		description: 'Balanced starting point',
		recipe: {
			brand: { h: 230, s: 65, b: 85 },
			personality: 'structured',
			typography: { fontPreset: 'System', scale: 'default' },
			shape: { radiusPreset: 'soft', radiusScale: 1, density: 'default' },
			shadows: { preset: 'elevated', intensity: 1, tintBrand: true }
		}
	},
	{
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
	},
	{
		name: 'Dashboard',
		description: 'Dense, data-first interface',
		recipe: {
			brand: { h: 200, s: 80, b: 70 },
			personality: 'structured',
			typography: { fontPreset: 'Geometric', scale: 'compact' },
			shape: { radiusPreset: 'sharp', radiusScale: 1, density: 'compact' },
			shadows: { preset: 'subtle', intensity: 1, tintBrand: false }
		}
	},
	{
		name: 'Editorial',
		description: 'Warm, readable, content-forward',
		recipe: {
			brand: { h: 340, s: 65, b: 85 },
			personality: 'clean',
			typography: { fontPreset: 'Serif', scale: 'spacious' },
			shape: { radiusPreset: 'soft', radiusScale: 1, density: 'spacious' },
			shadows: { preset: 'flat', intensity: 1, tintBrand: true }
		}
	},
	{
		name: 'Terminal',
		description: 'Precise, monospace, technical',
		recipe: {
			brand: { h: 145, s: 60, b: 55 },
			personality: 'minimal',
			typography: { fontPreset: 'Mono', scale: 'compact' },
			shape: { radiusPreset: 'sharp', radiusScale: 1, density: 'compact' },
			shadows: { preset: 'flat', intensity: 1, tintBrand: false }
		}
	},
	{
		name: 'Playful',
		description: 'Warm, rounded, approachable',
		recipe: {
			brand: { h: 25, s: 80, b: 90 },
			personality: 'rich',
			typography: { fontPreset: 'Humanist', scale: 'default' },
			shape: { radiusPreset: 'pill', radiusScale: 1, density: 'default' },
			shadows: { preset: 'deep', intensity: 1, tintBrand: true }
		}
	},
	{
		name: 'Corporate',
		description: 'Professional and measured',
		recipe: {
			brand: { h: 230, s: 65, b: 85 },
			personality: 'structured',
			typography: { fontPreset: 'Classical', scale: 'default' },
			shape: { radiusPreset: 'soft', radiusScale: 1, density: 'default' },
			shadows: { preset: 'elevated', intensity: 1, tintBrand: false }
		}
	},
	{
		name: 'Midnight',
		description: 'Dark, atmospheric, layered',
		recipe: {
			brand: { h: 270, s: 45, b: 80 },
			personality: 'rich',
			typography: { fontPreset: 'System', scale: 'default' },
			shape: { radiusPreset: 'rounded', radiusScale: 1, density: 'default' },
			shadows: { preset: 'deep', intensity: 1, tintBrand: true }
		}
	},
	{
		name: 'Ember',
		description: 'Bold, warm, high contrast',
		recipe: {
			brand: { h: 10, s: 85, b: 75 },
			personality: 'structured',
			typography: { fontPreset: 'Geometric', scale: 'default' },
			shape: { radiusPreset: 'rounded', radiusScale: 1, density: 'default' },
			shadows: { preset: 'elevated', intensity: 1, tintBrand: true }
		}
	}
];
