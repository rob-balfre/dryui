<script lang="ts">
	import { SvelteSet } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Text } from '../text/index.js';
	import type {
		DolphinPackage,
		SystemMapEdgeKind,
		SystemMapGraph,
		SystemMapLayer,
		SystemMapNode,
		SystemMapNodeKind,
		SystemMapVisibility
	} from './types.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		graph: SystemMapGraph;
		focusId?: string | null;
		layerFilter?: readonly SystemMapLayer[];
		kindFilter?: readonly SystemMapNodeKind[];
		edgeFilter?: readonly SystemMapEdgeKind[];
		packageFilter?: readonly DolphinPackage[];
		visibilityFilter?: readonly SystemMapVisibility[];
		categoryFilter?: readonly string[];
		showLegend?: boolean;
		showThumbnails?: boolean;
		showEdgeLabels?: boolean;
	}

	interface ViewNode {
		id: string;
		label: string;
		sublabel: string;
		helper: string;
		isFocused: boolean;
	}

	interface EdgeRow {
		id: string;
		source: ViewNode;
		target: ViewNode;
		label: string;
	}

	const layerOrder: SystemMapLayer[] = [
		'primitive',
		'ui-wrapper',
		'ui-composite',
		'part',
		'catalog',
		'cluster'
	];

	const packageLabels: Record<DolphinPackage, string> = {
		primitives: 'Primitives',
		ui: 'UI',
		docs: 'Docs',
		audit: 'Audit'
	};

	const edgeLabels: Record<SystemMapEdgeKind, string> = {
		wraps: 'wraps',
		composes: 'composes',
		compound_part: 'part of',
		related: 'related',
		docs: 'docs',
		duplication_cluster: 'duplicates'
	};

	let {
		graph,
		focusId = null,
		layerFilter,
		kindFilter,
		edgeFilter,
		packageFilter,
		visibilityFilter,
		categoryFilter,
		showLegend = true,
		showThumbnails = true,
		showEdgeLabels = false,
		class: className,
		...rest
	}: Props = $props();

	function compareStrings(left: string, right: string): number {
		return left.localeCompare(right, undefined, { sensitivity: 'base' });
	}

	function formatTokenLabel(value: string): string {
		return value
			.replace(/[-_]+/g, ' ')
			.replace(/\s+/g, ' ')
			.trim()
			.replace(/\b\w/g, (match) => match.toUpperCase());
	}

	function sublabelFor(node: SystemMapNode): string {
		const labels = [packageLabels[node.package], formatTokenLabel(node.kind)];
		if (node.visibility) labels.push(formatTokenLabel(node.visibility));
		return labels.join(' \u2022 ');
	}

	function helperFor(node: SystemMapNode): string {
		if (node.kind === 'part') return node.description || 'Public part export.';
		if (node.layer === 'cluster') return node.description || 'Audit cluster.';
		if (node.layer === 'catalog') return node.sourcePath || node.description || 'Catalog asset.';
		const metrics: string[] = [];
		if (node.parts.length > 0) metrics.push(`${node.parts.length} parts`);
		if (node.componentImportCount && node.componentImportCount > 0)
			metrics.push(`${node.componentImportCount} links`);
		if (metrics.length > 0) return metrics.join(' \u2022 ');
		return node.description || node.category || 'Public surface.';
	}

	function toViewNode(node: SystemMapNode): ViewNode {
		return {
			id: node.id,
			label: node.label,
			sublabel: sublabelFor(node),
			helper: helperFor(node),
			isFocused: focusId === node.id
		};
	}

	const normalizedNodes = $derived(
		[...graph.nodes].sort((left, right) => {
			const layerDelta = layerOrder.indexOf(left.layer) - layerOrder.indexOf(right.layer);
			if (layerDelta !== 0) return layerDelta;
			return compareStrings(left.label, right.label);
		})
	);

	const filteredNodes = $derived(
		(() => {
			const allowedLayers = layerFilter ? new Set(layerFilter) : null;
			const allowedKinds = kindFilter ? new Set(kindFilter) : null;
			const allowedPackages = packageFilter ? new Set(packageFilter) : null;
			const allowedVisibility = visibilityFilter ? new Set(visibilityFilter) : null;
			const allowedCategories = categoryFilter ? new Set(categoryFilter) : null;
			return normalizedNodes.filter((node) => {
				if (allowedLayers && !allowedLayers.has(node.layer)) return false;
				if (allowedKinds && !allowedKinds.has(node.kind)) return false;
				if (allowedPackages && !allowedPackages.has(node.package)) return false;
				if (allowedVisibility && (!node.visibility || !allowedVisibility.has(node.visibility)))
					return false;
				if (allowedCategories && !allowedCategories.has(node.category)) return false;
				return true;
			});
		})()
	);

	const filteredNodeIds = $derived(new SvelteSet(filteredNodes.map((n) => n.id)));

	const filteredEdges = $derived(
		(() => {
			const allowedEdges = edgeFilter ? new Set(edgeFilter) : null;
			return graph.edges
				.filter((e) => filteredNodeIds.has(e.from) && filteredNodeIds.has(e.to))
				.filter((e) => !allowedEdges || allowedEdges.has(e.type))
				.sort((a, b) => compareStrings(a.id, b.id));
		})()
	);

	const visibleNodeIds = $derived(
		(() => {
			if (!focusId || !filteredNodeIds.has(focusId)) return filteredNodeIds;
			const ids = new SvelteSet<string>([focusId]);
			for (const edge of filteredEdges) {
				if (edge.from === focusId || edge.to === focusId) {
					ids.add(edge.from);
					ids.add(edge.to);
				}
			}
			return ids;
		})()
	);

	const visibleNodes = $derived(filteredNodes.filter((n) => visibleNodeIds.has(n.id)));
	const visibleEdges = $derived(
		filteredEdges.filter((e) => visibleNodeIds.has(e.from) && visibleNodeIds.has(e.to))
	);

	const edgeRows = $derived(
		visibleEdges
			.map((edge) => {
				const source = visibleNodes.find((n) => n.id === edge.from);
				const target = visibleNodes.find((n) => n.id === edge.to);
				if (!source || !target) return null;
				return {
					id: edge.id,
					source: toViewNode(source),
					target: toViewNode(target),
					label: edgeLabels[edge.type]
				} satisfies EdgeRow;
			})
			.filter((row): row is EdgeRow => row !== null)
	);

	const connectedNodeIds = $derived(new Set(visibleEdges.flatMap((e) => [e.from, e.to])));

	const orphanNodes = $derived(
		visibleNodes.filter((n) => !connectedNodeIds.has(n.id)).map(toViewNode)
	);
</script>

<div data-system-map class={className} {...rest}>
	{#if edgeRows.length === 0 && orphanNodes.length === 0}
		<div data-empty>
			<Text as="p" color="muted">No nodes match the active filters.</Text>
		</div>
	{:else}
		{#each edgeRows as row (row.id)}
			<div data-edge-row>
				<div data-node data-focused={row.source.isFocused || undefined}>
					<Text as="p" data-node-name>{row.source.label}</Text>
					<Text as="p" size="xs" color="muted">{row.source.sublabel}</Text>
					<Text as="p" size="xs" color="muted" data-node-helper>{row.source.helper}</Text>
				</div>

				<div data-connector>
					<span data-connector-line></span>
					<Text as="span" size="xs" color="muted" data-connector-label>{row.label}</Text>
					<span data-connector-line></span>
				</div>

				<div data-node data-focused={row.target.isFocused || undefined}>
					<Text as="p" data-node-name>{row.target.label}</Text>
					<Text as="p" size="xs" color="muted">{row.target.sublabel}</Text>
					<Text as="p" size="xs" color="muted" data-node-helper>{row.target.helper}</Text>
				</div>
			</div>
		{/each}

		{#if orphanNodes.length > 0}
			<div data-orphans>
				{#each orphanNodes as node (node.id)}
					<div data-node data-focused={node.isFocused || undefined}>
						<Text as="p" data-node-name>{node.label}</Text>
						<Text as="p" size="xs" color="muted">{node.sublabel}</Text>
						<Text as="p" size="xs" color="muted" data-node-helper>{node.helper}</Text>
					</div>
				{/each}
			</div>
		{/if}
	{/if}
</div>

<style>
	[data-system-map] {
		display: grid;
		gap: var(--dry-space-3);
		color: var(--dry-color-text-strong);
	}

	[data-empty] {
		display: grid;
		place-items: center;
		padding: var(--dry-space-8);
	}

	[data-edge-row] {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--dry-space-3);
		align-items: center;
	}

	[data-node] {
		display: grid;
		gap: var(--dry-space-1);
		padding: var(--dry-space-3);
		border-radius: var(--dry-radius-lg);
		background: var(--dry-color-bg-raised);
		border: 1px solid var(--dry-color-stroke-weak);
	}

	[data-node][data-focused] {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-node-name] {
		font-weight: 600;
	}

	[data-node-helper] {
		opacity: 0.7;
	}

	[data-connector] {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: var(--dry-space-2);
		align-items: center;
	}

	[data-connector-line] {
		display: grid;
		height: 0;
		border-top: 1px solid var(--dry-color-stroke-weak);
	}

	[data-connector-label] {
		white-space: nowrap;
	}

	[data-orphans] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
		gap: var(--dry-space-3);
	}
</style>
