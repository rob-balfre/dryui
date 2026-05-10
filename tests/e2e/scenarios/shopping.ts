import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';
import { mockupPath } from './mockups.ts';

const shoppingMockup = mockupPath('shopping');

export const shoppingScenario: ScenarioDefinition = {
	name: 'shopping',
	prompt: [
		'Use the dryui-build skill to build a simple shopping page. Brand: Atelier. Heading: "Shop the New Collection". Products: Merino Wool Sweater, Canvas Tote, Leather Loafer. Each product has an Add to Cart button.',
		`Open and use this local design mockup as a visual reference for layout, density, hierarchy, and tone: ${shoppingMockup}. Keep the textual requirements above authoritative if the mockup differs.`
	].join(' '),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Shop the New Collection' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Shop the New Collection' },
		{ kind: 'html-contains', needle: 'Atelier' },
		{ kind: 'html-contains', needle: 'Merino Wool' },
		{ kind: 'html-contains', needle: 'Canvas Tote' },
		{ kind: 'html-contains', needle: 'Leather Loafer' },
		{ kind: 'html-contains', needle: 'Add to Cart' }
	]
};
