import type { ScenarioDefinition } from '../../../scripts/e2e/scenario-harness.ts';
import { mockupPath, scenarioAssets } from './mockups.ts';

const travelMockup = mockupPath('travel');

export const travelScenario: ScenarioDefinition = {
	name: 'travel',
	assets: scenarioAssets('travel'),
	prompt: [
		'Use the dryui-build skill to build a simple travel page. Brand: Wayfarer. Heading: "Plan Your Next Adventure". Destinations: Kyoto Japan, Santorini Greece, Patagonia Chile. Each destination has an Explore button.',
		`Open and use this local design mockup as a visual reference for layout, density, hierarchy, and tone: ${travelMockup}. Keep the textual requirements above authoritative if the mockup differs.`
	].join(' '),
	codexTimeoutMs: 10 * 60 * 1_000,
	assertions: [
		{ kind: 'file-exists', path: 'src/routes/+page.svelte' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: 'Plan Your Next Adventure' },
		{ kind: 'file-contains', path: 'src/routes/+page.svelte', needle: '@dryui/ui' },
		{ kind: 'html-contains', needle: 'Plan Your Next Adventure' },
		{ kind: 'html-contains', needle: 'Wayfarer' },
		{ kind: 'html-contains', needle: 'Kyoto' },
		{ kind: 'html-contains', needle: 'Santorini' },
		{ kind: 'html-contains', needle: 'Patagonia' },
		{ kind: 'html-contains', needle: 'Explore' }
	]
};
