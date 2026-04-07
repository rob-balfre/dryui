<script lang="ts">
	import { SystemMap } from '@dryui/ui';
	import type { SystemMapGraph } from '@dryui/ui/system-map';

	const graph: SystemMapGraph = {
		schema: 'DolphinGraph',
		generatedAt: '2026-04-07T00:00:00.000Z',
		packageVersion: '0.1.3',
		summary: {
			componentNodes: 4,
			partNodes: 0,
			catalogNodes: 0,
			clusterNodes: 0,
			primitiveComponents: 2,
			uiComponents: 2,
			uiWrappers: 2,
			uiComposites: 0,
			rootBarrelComponents: 4,
			subpathOnlyComponents: 0,
			compoundComponents: 2,
			wrapEdges: 2,
			composeEdges: 0,
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
				description: 'Single-line text entry primitive.',
				visibility: 'root+subpath',
				tags: ['forms'],
				compound: false,
				parts: []
			},
			{
				id: 'primitives:Popover',
				name: 'Popover',
				label: 'Popover',
				kind: 'component',
				package: 'primitives',
				layer: 'primitive',
				category: 'Overlay',
				description: 'Anchored floating surface.',
				visibility: 'root+subpath',
				tags: ['overlay'],
				compound: false,
				parts: []
			},
			{
				id: 'ui:Combobox',
				name: 'Combobox',
				label: 'Combobox',
				kind: 'component',
				package: 'ui',
				layer: 'ui-wrapper',
				category: 'Forms',
				description: 'Searchable select with filtering.',
				visibility: 'root+subpath',
				tags: ['forms'],
				compound: true,
				parts: ['Combobox.Input', 'Combobox.Content']
			},
			{
				id: 'ui:DropdownMenu',
				name: 'DropdownMenu',
				label: 'DropdownMenu',
				kind: 'component',
				package: 'ui',
				layer: 'ui-wrapper',
				category: 'Navigation',
				description: 'Popover-based action menu.',
				visibility: 'root+subpath',
				tags: ['navigation'],
				compound: true,
				parts: ['DropdownMenu.Trigger', 'DropdownMenu.Content']
			}
		],
		edges: [
			{
				id: 'wraps:ui:Combobox:primitives:Input',
				type: 'wraps',
				from: 'ui:Combobox',
				to: 'primitives:Input'
			},
			{
				id: 'wraps:ui:DropdownMenu:primitives:Popover',
				type: 'wraps',
				from: 'ui:DropdownMenu',
				to: 'primitives:Popover'
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

<SystemMap {graph} showLegend={false} showThumbnails={false} />
