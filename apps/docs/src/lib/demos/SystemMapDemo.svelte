<script lang="ts">
	import { SystemMap } from '@dryui/ui';
	import type { SystemMapGraph } from '@dryui/ui/system-map';

	const graph: SystemMapGraph = {
		schema: 'DolphinGraph',
		generatedAt: '2026-04-04T00:00:00.000Z',
		packageVersion: '0.0.1',
		summary: {
			componentNodes: 3,
			partNodes: 0,
			catalogNodes: 0,
			clusterNodes: 0,
			primitiveComponents: 1,
			uiComponents: 2,
			uiWrappers: 1,
			uiComposites: 1,
			rootBarrelComponents: 3,
			subpathOnlyComponents: 0,
			compoundComponents: 1,
			wrapEdges: 1,
			composeEdges: 1,
			docsEdges: 0,
			relatedEdges: 0,
			mismatches: 0,
			primitivePartComponents: 0,
			thinWrappers: 0
		},
		nodes: [
			{
				id: 'primitives:Input',
				name: 'Input',
				label: 'Input',
				kind: 'component',
				package: 'primitives',
				layer: 'primitive',
				category: 'Forms',
				description: 'Primitive text input control.',
				tags: ['forms'],
				compound: false,
				parts: []
			},
			{
				id: 'ui:InputGroup',
				name: 'InputGroup',
				label: 'InputGroup',
				kind: 'component',
				package: 'ui',
				layer: 'ui-wrapper',
				category: 'Forms',
				description: 'Affixed input shell for pricing and search.',
				tags: ['forms', 'compound'],
				compound: true,
				parts: ['InputGroup.Input', 'InputGroup.Action']
			},
			{
				id: 'ui:CommerceHeader',
				name: 'CommerceHeader',
				label: 'CommerceHeader',
				kind: 'component',
				package: 'ui',
				layer: 'ui-composite',
				category: 'Navigation',
				description: 'Storefront header with search and utility actions.',
				tags: ['navigation', 'commerce'],
				compound: true,
				parts: ['CommerceHeader.Brand', 'CommerceHeader.Search', 'CommerceHeader.Actions']
			}
		],
		edges: [
			{
				id: 'wraps:ui:InputGroup:primitives:Input',
				type: 'wraps',
				from: 'ui:InputGroup',
				to: 'primitives:Input'
			},
			{
				id: 'composes:ui:CommerceHeader:ui:InputGroup',
				type: 'composes',
				from: 'ui:CommerceHeader',
				to: 'ui:InputGroup'
			}
		],
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
		mermaid: {
			packageOverview: 'graph LR',
			clusterOverview: 'graph LR'
		}
	};
</script>

<SystemMap {graph} focusId="ui:CommerceHeader" showThumbnails={false} />
