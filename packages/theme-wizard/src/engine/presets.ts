import type { BrandInput } from './derivation.js';

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
