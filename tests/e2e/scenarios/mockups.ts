import { fileURLToPath } from 'node:url';
import type { ScenarioImageAsset } from '../../../scripts/e2e/scenario-harness.ts';

export type MockupName = 'dashboard' | 'shopping' | 'travel';

const ASSETS = {
	dashboard: [],
	shopping: [
		{
			file: 'merino-wool-sweater.png',
			label: 'Merino Wool Sweater product photo',
			purpose: 'Merino Wool Sweater product image'
		},
		{
			file: 'canvas-tote.png',
			label: 'Canvas Tote product photo',
			purpose: 'Canvas Tote product image'
		},
		{
			file: 'leather-loafer.png',
			label: 'Leather Loafer product photo',
			purpose: 'Leather Loafer product image'
		}
	],
	travel: [
		{
			file: 'hero-overlook.png',
			label: 'Wayfarer hero overlook',
			purpose: 'travel hero image'
		},
		{
			file: 'kyoto-japan.png',
			label: 'Kyoto Japan destination photo',
			purpose: 'Kyoto Japan destination image'
		},
		{
			file: 'santorini-greece.png',
			label: 'Santorini Greece destination photo',
			purpose: 'Santorini Greece destination image'
		},
		{
			file: 'patagonia-chile.png',
			label: 'Patagonia Chile destination photo',
			purpose: 'Patagonia Chile destination image'
		}
	]
} as const satisfies Record<
	MockupName,
	readonly { readonly file: string; readonly label: string; readonly purpose: string }[]
>;

export function mockupPath(name: MockupName): string {
	return fileURLToPath(new URL(`../mockups/${name}.png`, import.meta.url));
}

export function scenarioAssets(name: MockupName): readonly ScenarioImageAsset[] {
	return ASSETS[name].map((asset) => ({
		label: asset.label,
		sourcePath: fileURLToPath(new URL(`../assets/${name}/${asset.file}`, import.meta.url)),
		targetPath: `static/dryui-e2e-assets/${name}/${asset.file}`,
		purpose: asset.purpose
	}));
}
