import { describe, expect, it } from 'bun:test';
import { groupFamilies } from '../../apps/docs/src/lib/server/architecture-families';
import type { DolphinGraph } from '@dryui/mcp/architecture';

function makeGraph(overrides: Partial<DolphinGraph> = {}): DolphinGraph {
	return {
		schema: 'DolphinGraph',
		generatedAt: '2026-01-01T00:00:00Z',
		packageVersion: '0.0.1',
		summary: {} as DolphinGraph['summary'],
		nodes: [],
		edges: [],
		clusters: [],
		mismatches: [],
		signals: {
			primitivePartComponents: [],
			thinWrapperComponents: [],
			subpathOnlyUi: [],
			subpathOnlyPrimitives: [],
			specMissingUi: [],
			specMissingPrimitives: [],
			docsNavMissing: [],
			docsNavOrphan: []
		},
		mermaid: { packageOverview: '', clusterOverview: '' },
		...overrides
	};
}

function makeNode(name: string, pkg: 'primitives' | 'ui', overrides: Record<string, unknown> = {}) {
	return {
		id: `${pkg}:${name}`,
		name,
		label: name,
		kind: 'component' as const,
		package: pkg,
		layer: pkg === 'primitives' ? ('primitive' as const) : ('ui-wrapper' as const),
		category: 'action',
		description: '',
		tags: [],
		compound: false,
		parts: [],
		...overrides
	};
}

describe('groupFamilies', () => {
	it('groups a primitive and UI wrapper into one family', () => {
		const graph = makeGraph({
			nodes: [makeNode('Button', 'primitives'), makeNode('Button', 'ui')],
			edges: [
				{
					id: 'wraps:ui:Button:primitives:Button:',
					type: 'wraps',
					from: 'ui:Button',
					to: 'primitives:Button'
				}
			]
		});

		const families = groupFamilies(graph);

		expect(families).toHaveLength(1);
		expect(families[0].name).toBe('Button');
		expect(families[0].layers).toHaveLength(2);
		expect(families[0].layers[0].package).toBe('primitives');
		expect(families[0].layers[1].package).toBe('ui');
		expect(families[0].type).toBe('thin');
	});

	it('marks compound families with parts', () => {
		const graph = makeGraph({
			nodes: [
				makeNode('Accordion', 'primitives', {
					compound: true,
					parts: ['Root', 'Item', 'Trigger', 'Content']
				}),
				makeNode('Accordion', 'ui', {
					compound: true,
					parts: ['Root', 'Item', 'Trigger', 'Content']
				})
			],
			edges: [
				{
					id: 'wraps:ui:Accordion:primitives:Accordion:',
					type: 'wraps',
					from: 'ui:Accordion',
					to: 'primitives:Accordion'
				}
			]
		});

		const families = groupFamilies(graph);

		expect(families[0].type).toBe('compound');
		expect(families[0].layers[0].parts).toEqual(['Root', 'Item', 'Trigger', 'Content']);
		expect(families[0].layers[0].compound).toBe(true);
	});

	it('marks composite families that have composes edges', () => {
		const graph = makeGraph({
			nodes: [makeNode('ChatThread', 'ui', { layer: 'ui-composite' })],
			edges: [
				{
					id: 'composes:ui:ChatThread:ui:Avatar:',
					type: 'composes',
					from: 'ui:ChatThread',
					to: 'ui:Avatar'
				}
			]
		});

		const families = groupFamilies(graph);

		expect(families[0].type).toBe('composite');
		expect(families[0].composesNames).toEqual(['Avatar']);
	});

	it('attaches audit clusters to flagged families', () => {
		const graph = makeGraph({
			nodes: [
				makeNode('Chip', 'primitives'),
				makeNode('Chip', 'ui'),
				makeNode('Badge', 'primitives'),
				makeNode('Badge', 'ui')
			],
			edges: [
				{
					id: 'wraps:ui:Chip:primitives:Chip:',
					type: 'wraps',
					from: 'ui:Chip',
					to: 'primitives:Chip'
				},
				{
					id: 'wraps:ui:Badge:primitives:Badge:',
					type: 'wraps',
					from: 'ui:Badge',
					to: 'primitives:Badge'
				}
			],
			clusters: [
				{
					id: 'status-chip-family',
					title: 'Status and chip family overlap',
					priority: 'canonicalize-now',
					summary: 'Badge, Tag, Chip overlap',
					components: ['Chip', 'Badge'],
					recommendations: ['Consolidate']
				}
			]
		});

		const families = groupFamilies(graph);
		const chip = families.find((f) => f.name === 'Chip')!;
		const badge = families.find((f) => f.name === 'Badge')!;

		expect(chip.clusters).toHaveLength(1);
		expect(chip.clusters[0].title).toBe('Status and chip family overlap');
		expect(badge.clusters).toHaveLength(1);
	});

	it('sorts flagged families first, then alphabetically', () => {
		const graph = makeGraph({
			nodes: [
				makeNode('Accordion', 'primitives'),
				makeNode('Accordion', 'ui'),
				makeNode('Chip', 'primitives'),
				makeNode('Chip', 'ui'),
				makeNode('Button', 'primitives'),
				makeNode('Button', 'ui')
			],
			edges: [
				{ id: 'w1', type: 'wraps', from: 'ui:Accordion', to: 'primitives:Accordion' },
				{ id: 'w2', type: 'wraps', from: 'ui:Chip', to: 'primitives:Chip' },
				{ id: 'w3', type: 'wraps', from: 'ui:Button', to: 'primitives:Button' }
			],
			clusters: [
				{
					id: 'chip-cluster',
					title: 'Chip overlap',
					priority: 'canonicalize-now',
					summary: 'overlap',
					components: ['Chip'],
					recommendations: []
				}
			]
		});

		const families = groupFamilies(graph);
		const names = families.map((f) => f.name);

		expect(names).toEqual(['Chip', 'Accordion', 'Button']);
	});

	it('handles UI-only composites with no primitive', () => {
		const graph = makeGraph({
			nodes: [makeNode('ChatThread', 'ui', { layer: 'ui-composite' })],
			edges: []
		});

		const families = groupFamilies(graph);

		expect(families).toHaveLength(1);
		expect(families[0].name).toBe('ChatThread');
		expect(families[0].layers).toHaveLength(1);
		expect(families[0].layers[0].package).toBe('ui');
	});
});
