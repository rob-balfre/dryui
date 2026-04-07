<script lang="ts">
	import { SvelteMap, SvelteSet } from 'svelte/reactivity';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Badge } from '../badge/index.js';
	import { Svg } from '../svg/index.js';
	import { Text } from '../text/index.js';
	import { Thumbnail } from '../thumbnail/index.js';
	import type {
		DolphinPackage,
		SystemMapEdge,
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

	interface PositionedNode extends SystemMapNode {
		x: number;
		y: number;
		width: number;
		height: number;
		accent: string;
		isFocused: boolean;
		groupLabel: string;
		sublabel: string;
		helper: string;
		thumbnailName: string | null;
	}

	interface PositionedGroup {
		id: string;
		label: string;
		x: number;
		y: number;
		nodes: PositionedNode[];
	}

	interface PositionedLayer {
		id: SystemMapLayer;
		label: string;
		x: number;
		y: number;
		width: number;
		height: number;
		accent: string;
		groups: PositionedGroup[];
		nodeCount: number;
	}

	interface PositionedEdge extends SystemMapEdge {
		path: string;
		labelX: number;
		labelY: number;
		color: string;
		dashed: boolean;
	}

	interface LegendItem {
		id: string;
		label: string;
		color: string;
		dashed?: boolean;
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

	const layerLabels: Record<SystemMapLayer, string> = {
		primitive: 'Primitives',
		'ui-wrapper': 'UI wrappers',
		'ui-composite': 'UI composites',
		part: 'Compound parts',
		catalog: 'Catalog',
		cluster: 'Audit clusters'
	};

	const layerColors: Record<SystemMapLayer, string> = {
		primitive: 'var(--dry-color-fill-warning)',
		'ui-wrapper': 'var(--dry-color-fill-brand)',
		'ui-composite': 'var(--dry-color-fill-success)',
		part: 'var(--dry-color-fill-info)',
		catalog: 'var(--dry-color-fill-info)',
		cluster: 'var(--dry-color-fill-error)'
	};

	const edgeStyles: Record<SystemMapEdgeKind, { color: string; dashed: boolean }> = {
		wraps: { color: 'var(--dry-color-fill-brand)', dashed: false },
		composes: { color: 'var(--dry-color-fill-success)', dashed: false },
		compound_part: { color: 'var(--dry-color-fill-warning)', dashed: false },
		related: { color: 'var(--dry-color-text-strong)', dashed: true },
		docs: { color: 'var(--dry-color-fill-info)', dashed: true },
		duplication_cluster: { color: 'var(--dry-color-fill-error)', dashed: true }
	};

	const kindOrder = new Map<SystemMapNodeKind, number>([
		['component', 0],
		['catalog', 1],
		['cluster', 2],
		['part', 3]
	]);

	const layoutConfig = {
		paddingX: 28,
		paddingTop: 70,
		paddingBottom: 24,
		laneWidth: 268,
		laneGap: 32,
		groupHeaderHeight: 26,
		groupGap: 18,
		nodeWidth: 232,
		nodeHeight: 86,
		nodeGap: 12,
		nodeInsetX: 18,
		thumbnailSize: 28
	} as const;

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

	function trimText(value: string, maxLength = 76): string {
		return value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}\u2026`;
	}

	function groupLabelFor(node: SystemMapNode): string {
		if (node.kind === 'part') {
			return node.name.split('.')[0] ?? 'Parts';
		}
		if (node.layer === 'catalog') {
			return formatTokenLabel(node.category || 'Catalog');
		}
		if (node.layer === 'cluster') {
			return formatTokenLabel(node.category || 'Audit');
		}
		return formatTokenLabel(node.category || packageLabels[node.package]);
	}

	function sublabelFor(node: SystemMapNode): string {
		const labels = [packageLabels[node.package], formatTokenLabel(node.kind)];
		if (node.visibility) {
			labels.push(formatTokenLabel(node.visibility));
		}
		return labels.join(' \u2022 ');
	}

	function helperFor(node: SystemMapNode): string {
		if (node.kind === 'part') {
			return trimText(node.description || 'Public part export.');
		}
		if (node.layer === 'cluster') {
			return trimText(node.description || 'Audit cluster.');
		}
		if (node.layer === 'catalog') {
			return trimText(node.sourcePath || node.description || 'Catalog asset.');
		}
		const metrics: string[] = [];
		if (node.parts.length > 0) metrics.push(`${node.parts.length} parts`);
		if (node.componentImportCount && node.componentImportCount > 0)
			metrics.push(`${node.componentImportCount} links`);
		if (metrics.length > 0) {
			return metrics.join(' \u2022 ');
		}
		return trimText(node.description || node.category || 'Public surface.');
	}

	function thumbnailNameFor(node: SystemMapNode): string | null {
		if (!showThumbnails) return null;
		if (node.kind !== 'component') return null;
		if (node.package === 'docs' || node.package === 'audit') return null;
		if (node.name.includes('.')) return null;
		return node.name;
	}

	function edgeLabel(kind: SystemMapEdgeKind): string {
		return formatTokenLabel(kind);
	}

	function edgeStyle(kind: SystemMapEdgeKind): { color: string; dashed: boolean } {
		return edgeStyles[kind];
	}

	const normalizedNodes = $derived(
		(() => {
			return [...graph.nodes].sort((left, right) => {
				const layerDelta = layerOrder.indexOf(left.layer) - layerOrder.indexOf(right.layer);
				if (layerDelta !== 0) return layerDelta;
				const groupDelta = compareStrings(groupLabelFor(left), groupLabelFor(right));
				if (groupDelta !== 0) return groupDelta;
				const kindDelta = (kindOrder.get(left.kind) ?? 99) - (kindOrder.get(right.kind) ?? 99);
				if (kindDelta !== 0) return kindDelta;
				return compareStrings(left.label, right.label);
			});
		})()
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

	const filteredNodeIds = $derived(new SvelteSet(filteredNodes.map((node) => node.id)));

	const filteredEdges = $derived(
		(() => {
			const allowedEdges = edgeFilter ? new Set(edgeFilter) : null;
			return graph.edges
				.filter((edge) => filteredNodeIds.has(edge.from) && filteredNodeIds.has(edge.to))
				.filter((edge) => !allowedEdges || allowedEdges.has(edge.type))
				.sort((left, right) => compareStrings(left.id, right.id));
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

	const visibleNodes = $derived(filteredNodes.filter((node) => visibleNodeIds.has(node.id)));
	const visibleEdges = $derived(
		filteredEdges.filter((edge) => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to))
	);
	const visibleLayers = $derived(
		layerOrder.filter((layer) => visibleNodes.some((node) => node.layer === layer))
	);

	const layout = $derived(
		(() => {
			const nodeLookup = new SvelteMap<string, PositionedNode>();
			const layers: PositionedLayer[] = [];
			let maxContentBottom = layoutConfig.paddingTop + 80;

			visibleLayers.forEach((layer, layerIndex) => {
				const laneNodes = visibleNodes.filter((node) => node.layer === layer);
				const groups = new SvelteMap<string, SystemMapNode[]>();
				for (const node of laneNodes) {
					const label = groupLabelFor(node);
					groups.set(label, [...(groups.get(label) ?? []), node]);
				}
				let cursorY = layoutConfig.paddingTop;
				const positionedGroups: PositionedGroup[] = [];
				for (const [groupLabel, groupNodes] of [...groups.entries()].sort(([left], [right]) =>
					compareStrings(left, right)
				)) {
					const groupY = cursorY;
					cursorY += layoutConfig.groupHeaderHeight;
					const positionedNodes = groupNodes.map((node, nodeIndex) => {
						const positionedNode: PositionedNode = {
							...node,
							x:
								layoutConfig.paddingX +
								layerIndex * (layoutConfig.laneWidth + layoutConfig.laneGap) +
								layoutConfig.nodeInsetX,
							y: cursorY + nodeIndex * (layoutConfig.nodeHeight + layoutConfig.nodeGap),
							width: layoutConfig.nodeWidth,
							height: layoutConfig.nodeHeight,
							accent: layerColors[node.layer],
							isFocused: focusId === node.id,
							groupLabel,
							sublabel: sublabelFor(node),
							helper: helperFor(node),
							thumbnailName: thumbnailNameFor(node)
						};
						nodeLookup.set(node.id, positionedNode);
						return positionedNode;
					});
					positionedGroups.push({
						id: `${layer}:${groupLabel}`,
						label: groupLabel,
						x:
							layoutConfig.paddingX +
							layerIndex * (layoutConfig.laneWidth + layoutConfig.laneGap) +
							layoutConfig.nodeInsetX,
						y: groupY,
						nodes: positionedNodes
					});
					cursorY += positionedNodes.length * layoutConfig.nodeHeight;
					cursorY += Math.max(positionedNodes.length - 1, 0) * layoutConfig.nodeGap;
					cursorY += layoutConfig.groupGap;
				}
				const layerHeight = Math.max(
					cursorY - layoutConfig.groupGap + layoutConfig.paddingBottom,
					layoutConfig.paddingTop + 80
				);
				maxContentBottom = Math.max(maxContentBottom, layerHeight);
				layers.push({
					id: layer,
					label: layerLabels[layer],
					x: layoutConfig.paddingX + layerIndex * (layoutConfig.laneWidth + layoutConfig.laneGap),
					y: 18,
					width: layoutConfig.laneWidth,
					height: layerHeight - 18,
					accent: layerColors[layer],
					groups: positionedGroups,
					nodeCount: laneNodes.length
				});
			});

			const edges: PositionedEdge[] = visibleEdges.flatMap((edge) => {
				const fromNode = nodeLookup.get(edge.from);
				const toNode = nodeLookup.get(edge.to);
				if (!fromNode || !toNode) return [];
				const fromCenterY = fromNode.y + fromNode.height / 2;
				const toCenterY = toNode.y + toNode.height / 2;
				const flowingForward = fromNode.x <= toNode.x;
				const startX = flowingForward ? fromNode.x + fromNode.width : fromNode.x;
				const endX = flowingForward ? toNode.x : toNode.x + toNode.width;
				const bend = Math.max(40, Math.abs(endX - startX) * 0.45);
				const style = edgeStyle(edge.type);
				return [
					{
						...edge,
						path: `M ${startX} ${fromCenterY} C ${startX + (flowingForward ? bend : -bend)} ${fromCenterY}, ${endX - (flowingForward ? bend : -bend)} ${toCenterY}, ${endX} ${toCenterY}`,
						labelX: startX + (endX - startX) / 2,
						labelY: fromCenterY + (toCenterY - fromCenterY) / 2 - 10,
						color: style.color,
						dashed: style.dashed
					}
				];
			});

			return {
				width:
					layers.length > 0
						? layoutConfig.paddingX * 2 +
							layers.length * layoutConfig.laneWidth +
							(layers.length - 1) * layoutConfig.laneGap
						: 720,
				height: Math.max(maxContentBottom, 160),
				layers,
				edges
			};
		})()
	);

	const focusedNode = $derived(
		focusId ? (visibleNodes.find((node) => node.id === focusId) ?? null) : null
	);

	const layerLegend = $derived(
		visibleLayers.map(
			(layer) =>
				({
					id: layer,
					label: layerLabels[layer],
					color: layerColors[layer]
				}) satisfies LegendItem
		)
	);

	const edgeLegend = $derived(
		(() => {
			return [...new Set(visibleEdges.map((edge) => edge.type))]
				.map((type) => {
					const style = edgeStyle(type);
					return {
						id: type,
						label: edgeLabel(type),
						color: style.color,
						dashed: style.dashed
					} satisfies LegendItem;
				})
				.sort((left, right) => compareStrings(left.label, right.label));
		})()
	);

	const summaryText = $derived(
		(() => {
			const bits = [
				`${visibleNodes.length} visible nodes`,
				`${visibleEdges.length} relationships`,
				`${graph.summary.mismatches} audit mismatches`
			];
			if (focusedNode) {
				bits.push(`focus: ${focusedNode.label}`);
			}
			return bits.join(' \u2022 ');
		})()
	);
</script>

<div data-system-map class={className} {...rest}>
	<div data-header>
		<div data-header-text>
			<Text as="p" size="sm" color="muted" data-eyebrow>DolphinGraph</Text>
			<Text as="p" data-map-title>System Map</Text>
			<Text as="p" size="sm" color="muted" data-summary>{summaryText}</Text>
		</div>
		<div data-header-badges>
			<Badge variant="soft" color="gray">{graph.summary.componentNodes} components</Badge>
			<Badge variant="soft" color="gray">{graph.summary.wrapEdges} wraps</Badge>
			<Badge variant="soft" color="gray">{graph.summary.composeEdges} composes</Badge>
			<Badge variant="soft" color="gray">{graph.summary.clusterNodes} clusters</Badge>
		</div>
	</div>

	<div data-canvas-shell>
		<Svg
			data-svg
			viewBox="0 0 {layout.width} {layout.height}"
			aria-label="DryUI system map"
			role="img"
		>
			<defs>
				<marker
					id="dry-system-map-arrow"
					markerWidth="8"
					markerHeight="8"
					refX="7"
					refY="4"
					orient="auto-start-reverse"
					markerUnits="strokeWidth"
				>
					<path
						d="M 1 1 L 7 4 L 1 7"
						fill="none"
						stroke="context-stroke"
						stroke-width="1.2"
						stroke-linejoin="round"
						stroke-linecap="round"
					/>
				</marker>
			</defs>

			{#if layout.layers.length === 0}
				<rect
					x="22"
					y="22"
					width={layout.width - 44}
					height={layout.height - 44}
					rx="24"
					fill="color-mix(in srgb, var(--dry-color-bg-overlay) 76%, transparent)"
					stroke="var(--dry-color-stroke-weak)"
					stroke-dasharray="8 8"
				/>
				<text data-empty-label x={layout.width / 2} y={layout.height / 2 - 8} text-anchor="middle">
					Nothing matches the active focus or filters
				</text>
				<text data-empty-hint x={layout.width / 2} y={layout.height / 2 + 18} text-anchor="middle">
					Relax the filters or clear the focus to restore the full map.
				</text>
			{:else}
				{#each layout.edges as edge (edge.id)}
					<g>
						<path
							d={edge.path}
							fill="none"
							stroke={edge.color}
							stroke-width="1.5"
							stroke-dasharray={edge.dashed ? '6 4' : undefined}
							opacity="0.7"
							stroke-linecap="round"
							stroke-linejoin="round"
							marker-end="url(#dry-system-map-arrow)"
						/>
						{#if showEdgeLabels}
							<rect
								x={edge.labelX - 42}
								y={edge.labelY - 14}
								width="84"
								height="20"
								rx="999"
								fill="color-mix(in srgb, var(--dry-color-bg-base) 94%, white)"
								stroke="color-mix(in srgb, var(--dry-color-stroke-weak) 88%, transparent)"
							/>
							<text data-edge-label x={edge.labelX} y={edge.labelY} text-anchor="middle">
								{edgeLabel(edge.type)}
							</text>
						{/if}
					</g>
				{/each}

				{#each layout.layers as layer (layer.id)}
					<g>
						<rect
							x={layer.x}
							y={layer.y}
							width={layer.width}
							height={layer.height}
							rx="18"
							fill="color-mix(in srgb, {layer.accent} 5%, var(--dry-color-bg-overlay))"
							stroke="color-mix(in srgb, {layer.accent} 16%, var(--dry-color-stroke-weak))"
							stroke-width="0.75"
						/>
						<rect
							x={layer.x + 18}
							y={layer.y + 16}
							width="32"
							height="3"
							rx="1.5"
							fill={layer.accent}
							opacity="0.7"
						/>
						<text data-lane-title x={layer.x + 18} y={layer.y + 36}>{layer.label}</text>
						<text data-lane-meta x={layer.x + 18} y={layer.y + 52}>
							{layer.nodeCount} node{layer.nodeCount === 1 ? '' : 's'}
						</text>

						{#each layer.groups as group (group.id)}
							<g>
								<text data-group-label x={group.x} y={group.y + 16}>{group.label}</text>
								{#each group.nodes as node (node.id)}
									<g>
										<rect
											x={node.x}
											y={node.y}
											width={node.width}
											height={node.height}
											rx="14"
											fill="color-mix(in srgb, var(--dry-color-bg-base) 94%, white)"
											stroke={node.isFocused
												? `color-mix(in srgb, ${node.accent} 70%, var(--dry-color-stroke-weak))`
												: 'color-mix(in srgb, var(--dry-color-stroke-weak) 60%, transparent)'}
											stroke-width={node.isFocused ? 1.5 : 0.75}
										/>
										<rect
											x={node.x + 12}
											y={node.y + 14}
											width="3"
											height={node.height - 28}
											rx="1.5"
											fill={node.accent}
											opacity="0.8"
										/>
										{#if node.thumbnailName}
											<foreignObject
												x={node.x + node.width - layoutConfig.thumbnailSize - 14}
												y={node.y + 12}
												width={layoutConfig.thumbnailSize}
												height={layoutConfig.thumbnailSize}
											>
												<div xmlns="http://www.w3.org/1999/xhtml" data-thumbnail-object>
													<Thumbnail.Root
														name={node.thumbnailName}
														size={layoutConfig.thumbnailSize}
													/>
												</div>
											</foreignObject>
										{/if}
										<text data-node-label x={node.x + 28} y={node.y + 28}>
											{node.label}
										</text>
										<text data-node-description x={node.x + 28} y={node.y + 47}>
											{trimText(node.sublabel, 34)}
										</text>
										<text data-node-meta x={node.x + 28} y={node.y + 66}>
											{trimText(node.helper, 44)}
										</text>
									</g>
								{/each}
							</g>
						{/each}
					</g>
				{/each}
			{/if}
		</Svg>
	</div>

	{#if showLegend && (layerLegend.length > 0 || edgeLegend.length > 0)}
		<div data-legend>
			{#if layerLegend.length > 0}
				<div data-legend-section>
					<Badge variant="soft" color="gray">Layers</Badge>
					<div data-legend-items>
						{#each layerLegend as item (item.id)}
							<div data-legend-item>
								<span
									{@attach (node) => {
										node.style.setProperty('--swatch-color', item.color);
									}}
									data-swatch
								></span>
								<Text as="span" size="sm">{item.label}</Text>
							</div>
						{/each}
					</div>
				</div>
			{/if}
			{#if edgeLegend.length > 0}
				<div data-legend-section>
					<Badge variant="soft" color="gray">Relationships</Badge>
					<div data-legend-items>
						{#each edgeLegend as item (item.id)}
							<div data-legend-item>
								<span
									data-line-swatch
									data-dashed={item.dashed ? 'true' : undefined}
									{@attach (node) => {
										node.style.setProperty('--swatch-color', item.color);
									}}
								></span>
								<Text as="span" size="sm">{item.label}</Text>
							</div>
						{/each}
					</div>
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	[data-system-map] {
		--dry-system-map-bg: var(--dry-color-bg-raised);
		--dry-system-map-surface: var(--dry-color-bg-base);
		--dry-system-map-border: var(--dry-color-stroke-weak);
		--dry-system-map-text: var(--dry-color-text-strong);
		--dry-system-map-text-muted: var(--dry-color-text-weak);
		--dry-system-map-shadow: 0 8px 32px
			color-mix(in srgb, var(--dry-color-text-strong) 8%, transparent);

		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-3);
		padding: 0.875rem;
		border: 1px solid var(--dry-system-map-border);
		border-radius: var(--dry-radius-xl);
		background:
			radial-gradient(
				circle at top left,
				color-mix(in srgb, var(--dry-color-fill-brand) 6%, transparent),
				transparent 40%
			),
			var(--dry-system-map-bg);
		color: var(--dry-system-map-text);
		box-shadow: var(--dry-system-map-shadow);
		overflow: hidden;
	}

	[data-header] {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: var(--dry-space-4);
		align-items: start;
	}

	[data-header-text] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-header-badges] {
		display: grid;
		grid-auto-flow: column;
		gap: var(--dry-space-2);
		align-items: center;
	}

	[data-eyebrow] {
		margin: 0;
		font-size: var(--dry-text-xs-size, 0.75rem);
		font-weight: 700;
		line-height: 1.2;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dry-system-map-text-muted);
	}

	[data-map-title] {
		margin: 0;
		font-size: var(--dry-text-lg-size, 1.125rem);
		font-weight: 700;
		line-height: 1.2;
	}

	[data-summary] {
		margin: 0;
	}

	[data-canvas-shell] {
		display: grid;
		grid-template-columns: minmax(40rem, 1fr);
		overflow-x: auto;
		overflow-y: hidden;
		padding-bottom: 0.125rem;
		border-radius: calc(var(--dry-radius-xl) - 0.25rem);
		background: color-mix(in srgb, var(--dry-color-bg-overlay) 45%, transparent);
		border: 1px solid color-mix(in srgb, var(--dry-system-map-border) 85%, transparent);
	}

	[data-svg] {
		display: grid;
		height: auto;
	}

	[data-lane-title] {
		font-size: 0.8125rem;
		font-weight: 600;
		letter-spacing: 0.01em;
		fill: var(--dry-system-map-text);
	}
	[data-lane-meta] {
		font-size: 0.6875rem;
		fill: var(--dry-system-map-text-muted);
	}
	[data-group-label] {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		fill: var(--dry-system-map-text-muted);
	}
	[data-node-label] {
		font-size: 0.8125rem;
		font-weight: 600;
		fill: var(--dry-system-map-text);
	}
	[data-node-description] {
		font-size: 0.6875rem;
		fill: var(--dry-system-map-text-muted);
	}
	[data-node-meta] {
		font-size: 0.6875rem;
		fill: color-mix(in srgb, var(--dry-system-map-text-muted) 70%, transparent);
	}
	[data-edge-label] {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.02em;
		fill: var(--dry-system-map-text);
	}
	[data-empty-label] {
		font-size: 0.875rem;
		font-weight: 600;
		fill: var(--dry-system-map-text);
	}
	[data-empty-hint] {
		font-size: 0.75rem;
		fill: var(--dry-system-map-text-muted);
	}

	[data-thumbnail-object] {
		display: grid;
		place-items: center;
		height: 100%;
	}

	[data-legend] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(18rem, 1fr);
		gap: var(--dry-space-6);
		align-items: start;
		padding: 0.875rem;
		border-radius: calc(var(--dry-radius-xl) - 0.375rem);
		background: color-mix(in srgb, var(--dry-system-map-surface) 82%, transparent);
		border: 1px solid color-mix(in srgb, var(--dry-system-map-border) 78%, transparent);
	}

	[data-legend-section] {
		display: grid;
		gap: var(--dry-space-2);
	}

	[data-legend-items] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(12rem, 1fr));
		gap: var(--dry-space-4);
		row-gap: 0.5rem;
		align-items: start;
	}

	[data-legend-item] {
		display: grid;
		grid-template-columns: auto 1fr;
		gap: var(--dry-space-2);
		align-items: center;
		padding: 0.125rem 0;
	}

	[data-swatch] {
		display: grid;
		grid-template-columns: 0.875rem;
		aspect-ratio: 1;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--dry-system-map-border) 80%, transparent);
		background: var(--swatch-color, var(--dry-color-fill-brand));
	}

	[data-line-swatch] {
		display: grid;
		grid-template-columns: 1.5rem;
		height: 0;
		border-top: 2px solid var(--swatch-color, var(--dry-color-fill-brand));
	}

	[data-line-swatch][data-dashed='true'] {
		border-top-style: dashed;
	}
</style>
