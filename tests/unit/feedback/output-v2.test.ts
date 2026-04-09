import { describe, test, expect, mock, beforeAll } from 'bun:test';
import type {
	DesignPlacement,
	ComponentAction,
	CanvasWidth,
	CatalogEntry
} from '../../../packages/feedback/src/layout-mode/types.js';

// Mock the catalog module so tests run without MCP spec dependency
const mockCatalog: CatalogEntry[] = [
	{
		name: 'Card',
		category: 'display',
		description: 'A surface for grouping related content',
		tags: ['container', 'display'],
		compound: true,
		importPath: '@dryui/ui',
		structure: 'Card.Root\n  Card.Header\n  Card.Body\n  Card.Footer',
		alternatives: [],
		antiPatterns: [],
		combinesWith: ['Container']
	},
	{
		name: 'Button',
		category: 'action',
		description: 'Interactive trigger element',
		tags: ['form', 'action'],
		compound: false,
		importPath: '@dryui/ui',
		structure: null,
		alternatives: [],
		antiPatterns: [],
		combinesWith: []
	},
	{
		name: 'Navbar',
		category: 'navigation',
		description: 'Top navigation bar',
		tags: ['nav', 'layout'],
		compound: true,
		importPath: '@dryui/ui',
		structure: 'Navbar.Root\n  Navbar.Brand\n  Navbar.Nav',
		alternatives: [],
		antiPatterns: [],
		combinesWith: []
	}
];

mock.module('../../../packages/feedback/src/layout-mode/catalog.js', () => ({
	getCatalog: () => mockCatalog,
	loadCatalog: async () => mockCatalog,
	searchCatalog: (catalog: CatalogEntry[], query: string) => catalog,
	getAlternatives: () => [],
	getAntiPatterns: () => []
}));

// Import after mocking
const { generateSketchBrief, generateEditBrief } =
	await import('../../../packages/feedback/src/layout-mode/output.js');

function makePlacement(
	overrides: Partial<DesignPlacement> & Pick<DesignPlacement, 'type'>
): DesignPlacement {
	return {
		id: 'p-' + Math.random().toString(36).slice(2),
		x: 0,
		y: 0,
		width: 1280,
		height: 64,
		scrollY: 0,
		timestamp: Date.now(),
		...overrides
	};
}

describe('generateSketchBrief', () => {
	test('contains route in header', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'navigation' })],
			route: '/dashboard',
			canvasWidth: 1280
		});
		expect(brief).toContain('## New page: /dashboard');
	});

	test('includes canvas width context', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'hero' })],
			route: '/home',
			canvasWidth: 375
		});
		expect(brief).toContain('375');
		expect(brief).toContain('Mobile');
	});

	test('includes desktop width label for 1280', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'hero' })],
			route: '/home',
			canvasWidth: 1280
		});
		expect(brief).toContain('1280');
		expect(brief).toContain('Desktop');
	});

	test('includes recipe name when provided', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'hero' })],
			route: '/landing',
			canvasWidth: 1280,
			recipeName: 'marketing-landing'
		});
		expect(brief).toContain('marketing-landing');
	});

	test('includes route file path hint', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'navigation' })],
			route: '/settings',
			canvasWidth: 1280
		});
		expect(brief).toContain('+page.svelte');
		expect(brief).toContain('/settings');
	});

	test('includes component names in layout sketch section', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'navigation', y: 0 }),
				makePlacement({ type: 'hero', y: 64 })
			],
			route: '/home',
			canvasWidth: 1280
		});
		expect(brief).toContain('navigation');
		expect(brief).toContain('hero');
	});

	test('describes full-width component in human terms', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'navigation', x: 0, y: 0, width: 1280, height: 56 })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('full width');
	});

	test('describes half-width component in human terms', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'card', x: 0, y: 0, width: 640, height: 200 })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('~half width');
	});

	test('describes third-width component in human terms', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'card', x: 0, y: 0, width: 426, height: 200 })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('~third width');
	});

	test('describes items in the same row as "in a row"', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'card', x: 0, y: 100, width: 300, height: 200 }),
				makePlacement({ type: 'card', x: 320, y: 110, width: 300, height: 200 }),
				makePlacement({ type: 'card', x: 640, y: 105, width: 300, height: 200 })
			],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('in a row');
	});

	test('includes import path from catalog when entry exists', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'card', x: 0, y: 0, width: 300, height: 240 })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('@dryui/ui');
	});

	test('includes component structure when catalog entry has one', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'card', x: 0, y: 0, width: 300, height: 240 })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('Card.Root');
	});

	test('composition hint: suggests scoped CSS grid for 3+ same components in a row', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'card', x: 0, y: 100, width: 300, height: 200 }),
				makePlacement({ type: 'card', x: 320, y: 110, width: 300, height: 200 }),
				makePlacement({ type: 'card', x: 640, y: 105, width: 300, height: 200 })
			],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('scoped CSS grid');
	});

	test('no composition hint for only 2 same components in a row', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'card', x: 0, y: 100, width: 300, height: 200 }),
				makePlacement({ type: 'card', x: 320, y: 105, width: 300, height: 200 })
			],
			route: '/page',
			canvasWidth: 1280
		});
		// Should NOT have a scoped CSS grid composition hint (only 2 cards, not 3+)
		const hintSection = brief.split('### Composition hints')[1] ?? '';
		expect(hintSection).not.toContain('scoped CSS grid');
	});

	test('includes DryUI layout baseline footer', async () => {
		const brief = await generateSketchBrief({
			placements: [makePlacement({ type: 'navigation' })],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('DryUI layout baseline');
		expect(brief).toContain('Container');
		expect(brief).toContain('@container');
	});

	test('groups items within 40px vertically as same row', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'button', x: 0, y: 100, width: 140, height: 40 }),
				makePlacement({ type: 'badge', x: 160, y: 130, width: 80, height: 28 })
			],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('in a row');
	});

	test('separates items more than 40px apart into different rows', async () => {
		const brief = await generateSketchBrief({
			placements: [
				makePlacement({ type: 'navigation', x: 0, y: 0, width: 1280, height: 56 }),
				makePlacement({ type: 'hero', x: 0, y: 100, width: 1280, height: 300 })
			],
			route: '/page',
			canvasWidth: 1280
		});
		// Both items are separate rows, should not be "in a row" together
		const lines = brief.split('\n');
		const rowLines = lines.filter((l) => l.includes('navigation') || l.includes('hero'));
		expect(rowLines.length).toBeGreaterThanOrEqual(2);
	});

	test('handles empty placements gracefully', async () => {
		const brief = await generateSketchBrief({
			placements: [],
			route: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('## New page: /page');
	});
});

describe('generateEditBrief', () => {
	test('contains route in header', async () => {
		const actions: ComponentAction[] = [
			{ kind: 'refine', targetSelector: '.btn', component: 'Button', comment: 'Make it larger' }
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/settings/profile',
			canvasWidth: 1280
		});
		expect(brief).toContain('## Feedback: Page modifications at /settings/profile');
	});

	test('includes viewport context', async () => {
		const brief = await generateEditBrief({
			actions: [],
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 768
		});
		expect(brief).toContain('768');
		expect(brief).toContain('Tablet');
	});

	test('swap action: includes fromComponent and toComponent', async () => {
		const actions: ComponentAction[] = [
			{
				kind: 'swap',
				targetSelector: '#nav',
				fromComponent: 'Navbar',
				toComponent: 'PageHeader',
				reason: 'Better mobile support'
			}
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('swap');
		expect(brief).toContain('Navbar');
		expect(brief).toContain('PageHeader');
		expect(brief).toContain('Better mobile support');
		expect(brief).toContain('#nav');
	});

	test('delete action: includes component and selector', async () => {
		const actions: ComponentAction[] = [
			{ kind: 'delete', targetSelector: '.sidebar', component: 'Sidebar' }
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('delete');
		expect(brief).toContain('Sidebar');
		expect(brief).toContain('.sidebar');
	});

	test('refine action: includes component and comment', async () => {
		const actions: ComponentAction[] = [
			{
				kind: 'refine',
				targetSelector: '.card',
				component: 'Card',
				comment: 'Add a drop shadow'
			}
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('refine');
		expect(brief).toContain('Card');
		expect(brief).toContain('Add a drop shadow');
		expect(brief).toContain('.card');
	});

	test('includes import path for swap toComponent when catalog entry exists', async () => {
		const actions: ComponentAction[] = [
			{
				kind: 'swap',
				targetSelector: '#nav',
				fromComponent: 'Navbar',
				toComponent: 'Card',
				reason: 'test'
			}
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('@dryui/ui');
	});

	test('annotations section appears when annotations are present', async () => {
		const brief = await generateEditBrief({
			actions: [],
			annotations: [{ selector: '.hero', note: 'Needs more contrast' }],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('Annotations');
		expect(brief).toContain('Needs more contrast');
		expect(brief).toContain('.hero');
	});

	test('no annotations section when annotations array is empty', async () => {
		const brief = await generateEditBrief({
			actions: [],
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).not.toContain('### Annotations');
	});

	test('multiple actions all appear in output', async () => {
		const actions: ComponentAction[] = [
			{
				kind: 'swap',
				targetSelector: '#header',
				fromComponent: 'Navbar',
				toComponent: 'PageHeader',
				reason: 'Accessibility'
			},
			{ kind: 'delete', targetSelector: '.ad-banner', component: 'Banner' },
			{
				kind: 'refine',
				targetSelector: '.btn-cta',
				component: 'Button',
				comment: 'Increase padding'
			}
		];
		const brief = await generateEditBrief({
			actions,
			annotations: [],
			currentUrl: '/page',
			canvasWidth: 1280
		});
		expect(brief).toContain('PageHeader');
		expect(brief).toContain('Banner');
		expect(brief).toContain('Increase padding');
	});

	test('handles empty actions and annotations gracefully', async () => {
		const brief = await generateEditBrief({
			actions: [],
			annotations: [],
			currentUrl: '/empty',
			canvasWidth: 1280
		});
		expect(brief).toContain('## Feedback: Page modifications at /empty');
	});
});
