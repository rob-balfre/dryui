<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import type { DiagramConfig } from './types.js';
	import { computeLayout } from './layout.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		config: DiagramConfig;
		width?: number;
		height?: number;
	}

	let { config, width, height, class: className, ...rest }: Props = $props();

	const layout = $derived(computeLayout(config));
	const vbW = $derived(width ?? layout.viewBox.width);
	const vbH = $derived(height ?? layout.viewBox.height);

	const uid = Math.random().toString(36).slice(2, 8);
</script>

<div data-diagram-container>
	<svg
		viewBox="0 0 {vbW} {vbH}"
		preserveAspectRatio="xMidYMin meet"
		role="img"
		aria-label={config.ariaLabel ?? 'Diagram'}
		data-diagram
		class={className}
		{...rest}
	>
		<defs>
			<!-- Dot pattern for filled nodes -->
			<pattern id="dry-diagram-{uid}-dots" width="4" height="4" patternUnits="userSpaceOnUse">
				<circle cx="1" cy="1" r="0.6" data-part="dot-fill" />
			</pattern>

			<!-- Arrow markers per color -->
			{#each ['neutral', 'brand', 'success', 'warning', 'error', 'info'] as color (color)}
				<marker
					id="dry-diagram-{uid}-arrow-{color}"
					viewBox="0 0 12 10"
					refX="10"
					refY="5"
					markerWidth="11"
					markerHeight="10"
					markerUnits="userSpaceOnUse"
					orient="auto-start-reverse"
					overflow="visible"
				>
					<path d="M 6.75 1.75 L 10 5 L 6.75 8.25" data-part="marker-arrow" data-color={color} />
				</marker>
			{/each}
		</defs>

		<!-- Layer 1: Clusters -->
		{#if layout.clusters.length > 0}
			<g data-part="clusters">
				{#each layout.clusters as cluster (cluster.id)}
					<g data-part="cluster" data-color={cluster.color}>
						<rect
							data-part="cluster-box"
							x={cluster.x}
							y={cluster.y}
							width={cluster.width}
							height={cluster.height}
							rx="12"
							data-dashed={cluster.dashed || undefined}
						/>
						{#if cluster.label}
							<text data-part="cluster-label" x={cluster.x + 20} y={cluster.y + 22}
								>{cluster.label}</text
							>
						{/if}
					</g>
				{/each}
			</g>
		{/if}

		<!-- Layer 1b: Regions -->
		{#if layout.regions.length > 0}
			<g data-part="regions">
				{#each layout.regions as region (region.id)}
					<g data-part="region" data-color={region.color}>
						<rect
							data-part="region-box"
							x={region.x}
							y={region.y}
							width={region.width}
							height={region.height}
							rx="4"
							data-dashed={region.dashed || undefined}
						/>
						<text data-part="region-label" x={region.x + 10} y={region.y + 14}>{region.label}</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Layer 1c: Swimlanes -->
		{#if layout.swimlanes.length > 0}
			<g data-part="swimlanes">
				{#each layout.swimlanes as lane (lane.id)}
					<line
						data-part="swimlane-line"
						data-color={lane.color}
						x1={lane.lineX}
						y1={lane.lineY1}
						x2={lane.lineX}
						y2={lane.lineY2}
					/>
					<text
						data-part="swimlane-header"
						data-color={lane.color}
						x={lane.lineX}
						y={lane.headerY + 20}>{lane.label}</text
					>
					<text data-part="swimlane-footer" data-color={lane.color} x={lane.lineX} y={lane.footerY}
						>{lane.label}</text
					>
				{/each}
			</g>
		{/if}

		<!-- Layer: Lifelines -->
		{#if layout.lifelines.length > 0}
			<g data-part="lifelines">
				{#each layout.lifelines as lifeline (lifeline.id)}
					<g data-part="lifeline" data-color={lifeline.color}>
						<rect
							data-part="lifeline-box"
							x={lifeline.x - 60}
							y={lifeline.topY}
							width={120}
							height={36}
							rx="4"
						/>
						<text data-part="lifeline-label" x={lifeline.x} y={lifeline.topY + 22}
							>{lifeline.label}</text
						>
						<path
							data-part="lifeline-line"
							d="M {lifeline.x} {lifeline.topY + 36} L {lifeline.x} {lifeline.bottomY - 36}"
						/>
						<rect
							data-part="lifeline-box"
							x={lifeline.x - 60}
							y={lifeline.bottomY - 36}
							width={120}
							height={36}
							rx="4"
						/>
						<text data-part="lifeline-label" x={lifeline.x} y={lifeline.bottomY - 14}
							>{lifeline.label}</text
						>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Layer: Fragments -->
		{#if layout.positionedFragments.length > 0}
			<g data-part="fragments">
				{#each layout.positionedFragments as frag (frag.id)}
					<g data-part="fragment" data-color={frag.color}>
						<rect
							data-part="fragment-box"
							x={frag.x}
							y={frag.y}
							width={frag.width}
							height={frag.height}
							rx="4"
							data-dashed={frag.dashed || undefined}
						/>
						<rect data-part="fragment-tag" x={frag.x} y={frag.y} width={80} height={20} rx="4" />
						<text data-part="fragment-label" x={frag.x + 8} y={frag.y + 14}
							>{frag.label}{frag.condition ? ` [${frag.condition}]` : ''}</text
						>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Layer: Messages -->
		{#if layout.messages.length > 0}
			<g data-part="messages">
				{#each layout.messages as msg, index (`msg-${index}`)}
					{@const markerEnd =
						msg.arrow === 'end' || msg.arrow === 'both'
							? `url(#dry-diagram-${uid}-arrow-${msg.color})`
							: undefined}
					<g data-part="message" data-color={msg.color}>
						{#if msg.isSelf}
							<path
								data-part="message-line"
								d="M {msg.x1} {msg.y} L {msg.x1 + 30} {msg.y} L {msg.x1 + 30} {msg.y +
									24} L {msg.x1} {msg.y + 24}"
								marker-end={markerEnd}
								data-dashed={msg.dashed || undefined}
							/>
						{:else}
							<path
								data-part="message-line"
								d="M {msg.x1} {msg.y} L {msg.x2} {msg.y}"
								marker-end={markerEnd}
								data-dashed={msg.dashed || undefined}
							/>
						{/if}
						<text data-part="message-label" x={msg.labelX} y={msg.labelY}>{msg.label}</text>
					</g>
				{/each}
			</g>
		{/if}

		<!-- Layer 2: Edges -->
		<g data-part="edges">
			{#each layout.edges as edge, index (`${edge.from}:${edge.to}:${index}`)}
				{@const markerEnd =
					edge.arrow === 'end' || edge.arrow === 'both'
						? `url(#dry-diagram-${uid}-arrow-${edge.color})`
						: undefined}
				{@const markerStart =
					edge.arrow === 'start' || edge.arrow === 'both'
						? `url(#dry-diagram-${uid}-arrow-${edge.color})`
						: undefined}
				{@const isSelfLoop = edge.from === edge.to}
				<g data-part="edge" data-color={edge.color}>
					<path
						data-part="edge-path"
						d={edge.path}
						marker-end={markerEnd}
						marker-start={markerStart}
						data-dashed={edge.dashed || undefined}
					/>
					{#if edge.label}
						<text
							data-part="edge-label"
							data-self-loop={isSelfLoop || undefined}
							x={isSelfLoop ? edge.labelX + 24 : edge.labelX}
							y={edge.labelY + 3}>{edge.label}</text
						>
					{/if}
				</g>
			{/each}
		</g>

		<!-- Layer 3: Nodes -->
		<g data-part="nodes">
			{#each layout.nodes as node (node.id)}
				<g
					data-part="node"
					data-variant={node.variant}
					data-color={node.color}
					data-state={node.state}
					transform="translate({node.x},{node.y})"
				>
					<rect
						data-part="node-box"
						width={node.width}
						height={node.height}
						rx={node.variant === 'pill' ? node.height / 2 : 16}
					/>
					<!-- Dot texture overlay for filled variant -->
					{#if node.variant === 'filled'}
						<rect
							data-part="node-texture"
							width={node.width}
							height={node.height}
							rx={16}
							fill="url(#dry-diagram-{uid}-dots)"
						/>
					{/if}
					<foreignObject x="0" y="0" width={node.width} height={node.height}>
						<div data-part="node-content" data-has-description={node.description ? '' : undefined}>
							{#if node.icon}
								<span data-part="node-icon">{node.icon}</span>
							{/if}
							<span data-part="node-label">{node.label}</span>
							{#if node.description}
								<span data-part="node-description">{node.description}</span>
							{/if}
						</div>
					</foreignObject>
				</g>
			{/each}
		</g>

		<!-- Layer 4: Annotations -->
		{#if layout.annotations.length > 0}
			<g data-part="annotations">
				{#each layout.annotations as ann, index (`${ann.text}:${index}`)}
					<text data-part="annotation" data-color={ann.color} x={ann.x} y={ann.y}>{ann.text}</text>
				{/each}
			</g>
		{/if}
	</svg>
</div>

<style>
	/* ── Container ──────────────────────────────────── */
	[data-diagram-container] {
		display: grid;
		min-height: 120px;
		max-block-size: var(--dry-diagram-max-height, none);
		overflow: auto;
	}

	/* ── SVG root ───────────────────────────────────── */
	[data-diagram] {
		--_node-bg: var(--dry-diagram-node-bg, var(--dry-color-bg-base));
		--_node-border: var(--dry-diagram-node-border, var(--dry-color-stroke-weak));
		--_node-color: var(--dry-diagram-node-color, var(--dry-color-text-strong));
		--_edge-color: var(
			--dry-diagram-edge-color,
			color-mix(in srgb, var(--dry-color-text-strong) 24%, var(--dry-color-bg-base))
		);
		--_cluster-bg: var(
			--dry-diagram-cluster-bg,
			color-mix(in srgb, var(--dry-color-fill) 30%, transparent)
		);
		--_cluster-border: var(--dry-diagram-cluster-border, var(--dry-color-stroke-weak));
		--_text-muted: var(--dry-diagram-text-muted, var(--dry-color-text-weak));

		display: block;
		overflow: visible;
		background: var(--dry-diagram-bg, transparent);
	}

	/* ── Dot pattern fill ──────────────────────────── */
	[data-part='dot-fill'] {
		fill: var(--dry-color-text-weak);
		opacity: 0.15;
	}

	/* ── Markers ────────────────────────────────────── */
	[data-part='marker-arrow'] {
		fill: none;
		stroke: var(--_edge-color);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}

	/* Color-specific markers */
	[data-part='marker-arrow'][data-color='brand'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='marker-arrow'][data-color='success'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='marker-arrow'][data-color='warning'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='marker-arrow'][data-color='error'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='marker-arrow'][data-color='info'] {
		stroke: var(--dry-color-stroke-info);
	}

	/* ── Nodes ──────────────────────────────────────── */
	[data-part='node-box'] {
		fill: var(--_node-bg);
		stroke: var(--_node-border);
		stroke-width: 2;
	}

	[data-part='node-texture'] {
		pointer-events: none;
	}

	[data-part='node-content'] {
		display: grid;
		place-items: center;
		gap: 2px;
		padding: 8px 20px;
		height: 100%;
		box-sizing: border-box;
	}

	[data-part='node-label'] {
		font-family: var(--dry-font-mono);
		font-size: 14px;
		font-weight: 500;
		color: var(--_node-color);
		text-align: center;
		line-height: 1.3;
		letter-spacing: 0.02em;
		white-space: nowrap;
	}

	[data-part='node-icon'] {
		font-size: 16px;
		line-height: 1;
		text-align: center;
	}

	[data-part='node-description'] {
		font-family: var(--dry-font-mono);
		font-size: 11px;
		font-weight: 400;
		color: var(--_text-muted);
		text-align: center;
		line-height: 1.3;
	}

	[data-part='node-content'][data-has-description] {
		padding: 10px 24px;
		text-align: left;
		place-items: start;
	}

	/* ── Node variant: outlined ──────────────────── */
	[data-part='node'][data-variant='outlined'] [data-part='node-box'] {
		fill: transparent;
		stroke: var(--_node-border);
	}

	/* ── Node variant: filled (dark solid with texture) */
	[data-part='node'][data-variant='filled'] [data-part='node-box'] {
		fill: var(--dry-color-bg-base);
		stroke: var(--_node-border);
	}

	/* ── Node colors via custom property indirection ─ */
	[data-part='node'][data-color='brand'] {
		--_node-border: var(--dry-color-stroke-brand);
		--_node-color: var(--dry-color-text-brand);
	}
	[data-part='node'][data-color='success'] {
		--_node-border: var(--dry-color-stroke-success);
		--_node-color: var(--dry-color-text-success);
	}
	[data-part='node'][data-color='warning'] {
		--_node-border: var(--dry-color-stroke-warning);
		--_node-color: var(--dry-color-text-warning);
	}
	[data-part='node'][data-color='error'] {
		--_node-border: var(--dry-color-stroke-error);
		--_node-color: var(--dry-color-text-error);
	}
	[data-part='node'][data-color='info'] {
		--_node-border: var(--dry-color-stroke-info);
		--_node-color: var(--dry-color-text-info);
	}

	/* ── Node states ────────────────────────────────── */
	[data-part='node'][data-state='active'] [data-part='node-box'] {
		stroke-width: 2;
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='node'][data-state='complete'] {
		--_node-border: var(--dry-color-stroke-success);
	}
	[data-part='node'][data-state='blocked'] [data-part='node-box'] {
		stroke-dasharray: 4 2;
		opacity: 0.5;
	}

	/* ── Edges ──────────────────────────────────────── */
	[data-part='edge-path'] {
		fill: none;
		stroke: var(--_edge-color);
		stroke-width: 1.5;
		stroke-linecap: round;
		stroke-linejoin: round;
	}
	[data-part='edge-path'][data-dashed] {
		stroke-dasharray: 6 3;
	}

	[data-part='edge'][data-color='brand'] [data-part='edge-path'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='edge'][data-color='success'] [data-part='edge-path'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='edge'][data-color='warning'] [data-part='edge-path'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='edge'][data-color='error'] [data-part='edge-path'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='edge'][data-color='info'] [data-part='edge-path'] {
		stroke: var(--dry-color-stroke-info);
	}

	[data-part='edge-label'] {
		font-family: var(--dry-font-mono);
		font-size: 9px;
		font-weight: 400;
		fill: var(--_text-muted);
		text-anchor: middle;
	}

	[data-part='edge-label'][data-self-loop] {
		text-anchor: start;
	}

	/* ── Clusters ───────────────────────────────────── */
	[data-part='cluster-box'] {
		fill: var(--_cluster-bg);
		stroke: var(--_cluster-border);
		stroke-width: 1.5;
	}
	[data-part='cluster-box'][data-dashed] {
		stroke-dasharray: 2 4;
	}

	[data-part='cluster'][data-color='brand'] [data-part='cluster-box'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='cluster'][data-color='success'] [data-part='cluster-box'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='cluster'][data-color='warning'] [data-part='cluster-box'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='cluster'][data-color='error'] [data-part='cluster-box'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='cluster'][data-color='info'] [data-part='cluster-box'] {
		stroke: var(--dry-color-stroke-info);
	}

	[data-part='cluster-label'] {
		font-family: var(--dry-font-mono);
		font-size: 11px;
		font-weight: 500;
		fill: var(--_text-muted);
	}

	/* ── Regions ────────────────────────────────────── */
	[data-part='region-box'] {
		fill: var(--_cluster-bg);
		stroke: var(--_cluster-border);
		stroke-width: 1;
	}
	[data-part='region-box'][data-dashed] {
		stroke-dasharray: 4 2;
	}

	[data-part='region-label'] {
		font-family: var(--dry-font-mono);
		font-size: 9px;
		font-weight: 600;
		fill: var(--_text-muted);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	/* ── Swimlanes ──────────────────────────────────── */
	[data-part='swimlane-line'] {
		stroke: var(--_edge-color);
		stroke-width: 1;
		stroke-dasharray: 4 3;
	}

	[data-part='swimlane-header'] {
		font-family: var(--dry-font-mono);
		font-size: 10px;
		font-weight: 700;
		fill: var(--_text-muted);
		text-anchor: middle;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	[data-part='swimlane-footer'] {
		font-family: var(--dry-font-mono);
		font-size: 10px;
		font-weight: 700;
		fill: var(--_text-muted);
		text-anchor: middle;
		text-transform: uppercase;
		letter-spacing: 0.1em;
	}

	/* ── Annotations ────────────────────────────────── */
	[data-part='annotation'] {
		font-family: var(--dry-font-mono);
		font-size: 10px;
		font-weight: 400;
		fill: var(--_text-muted);
	}
	[data-part='annotation'][data-color='brand'] {
		fill: var(--dry-color-text-brand);
	}
	[data-part='annotation'][data-color='success'] {
		fill: var(--dry-color-text-success);
	}
	[data-part='annotation'][data-color='warning'] {
		fill: var(--dry-color-text-warning);
	}
	[data-part='annotation'][data-color='error'] {
		fill: var(--dry-color-text-error);
	}
	[data-part='annotation'][data-color='info'] {
		fill: var(--dry-color-text-info);
	}

	/* ── Lifelines ──────────────────────────────────── */
	[data-part='lifeline-box'] {
		fill: var(--_node-bg);
		stroke: var(--_node-border);
		stroke-width: 2;
	}

	[data-part='lifeline-label'] {
		font-family: var(--dry-font-mono);
		font-size: 11px;
		font-weight: 700;
		fill: var(--_node-color);
		text-anchor: middle;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	[data-part='lifeline-line'] {
		fill: none;
		stroke: var(--_edge-color);
		stroke-width: 1;
		stroke-dasharray: 4 3;
	}

	[data-part='lifeline'][data-color='brand'] {
		--_node-border: var(--dry-color-stroke-brand);
		--_node-color: var(--dry-color-text-brand);
	}
	[data-part='lifeline'][data-color='success'] {
		--_node-border: var(--dry-color-stroke-success);
		--_node-color: var(--dry-color-text-success);
	}
	[data-part='lifeline'][data-color='warning'] {
		--_node-border: var(--dry-color-stroke-warning);
		--_node-color: var(--dry-color-text-warning);
	}
	[data-part='lifeline'][data-color='error'] {
		--_node-border: var(--dry-color-stroke-error);
		--_node-color: var(--dry-color-text-error);
	}
	[data-part='lifeline'][data-color='info'] {
		--_node-border: var(--dry-color-stroke-info);
		--_node-color: var(--dry-color-text-info);
	}

	/* ── Messages ───────────────────────────────────── */
	[data-part='message-line'] {
		fill: none;
		stroke: var(--_edge-color);
		stroke-width: 1.5;
		stroke-linecap: round;
	}
	[data-part='message-line'][data-dashed] {
		stroke-dasharray: 6 3;
	}

	[data-part='message-label'] {
		font-family: var(--dry-font-mono);
		font-size: 11px;
		font-weight: 400;
		fill: var(--_node-color);
		text-anchor: middle;
	}

	[data-part='message'][data-color='brand'] [data-part='message-line'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='message'][data-color='success'] [data-part='message-line'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='message'][data-color='warning'] [data-part='message-line'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='message'][data-color='error'] [data-part='message-line'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='message'][data-color='info'] [data-part='message-line'] {
		stroke: var(--dry-color-stroke-info);
	}

	[data-part='message'][data-color='brand'] [data-part='message-label'] {
		fill: var(--dry-color-text-brand);
	}
	[data-part='message'][data-color='success'] [data-part='message-label'] {
		fill: var(--dry-color-text-success);
	}
	[data-part='message'][data-color='warning'] [data-part='message-label'] {
		fill: var(--dry-color-text-warning);
	}
	[data-part='message'][data-color='error'] [data-part='message-label'] {
		fill: var(--dry-color-text-error);
	}
	[data-part='message'][data-color='info'] [data-part='message-label'] {
		fill: var(--dry-color-text-info);
	}

	/* ── Fragments ──────────────────────────────────── */
	[data-part='fragment-box'] {
		fill: transparent;
		stroke: var(--_cluster-border);
		stroke-width: 1.5;
	}
	[data-part='fragment-box'][data-dashed] {
		stroke-dasharray: 4 2;
	}

	[data-part='fragment-tag'] {
		fill: var(--_cluster-bg);
		stroke: var(--_cluster-border);
		stroke-width: 1;
	}

	[data-part='fragment-label'] {
		font-family: var(--dry-font-mono);
		font-size: 10px;
		font-weight: 700;
		fill: var(--_text-muted);
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}

	[data-part='fragment'][data-color='brand'] [data-part='fragment-box'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='fragment'][data-color='brand'] [data-part='fragment-tag'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='fragment'][data-color='success'] [data-part='fragment-box'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='fragment'][data-color='success'] [data-part='fragment-tag'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='fragment'][data-color='warning'] [data-part='fragment-box'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='fragment'][data-color='warning'] [data-part='fragment-tag'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='fragment'][data-color='error'] [data-part='fragment-box'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='fragment'][data-color='error'] [data-part='fragment-tag'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='fragment'][data-color='info'] [data-part='fragment-box'] {
		stroke: var(--dry-color-stroke-info);
	}
	[data-part='fragment'][data-color='info'] [data-part='fragment-tag'] {
		stroke: var(--dry-color-stroke-info);
	}

	/* ── Lifeline color overrides for lifeline-line ── */
	[data-part='lifeline'][data-color='brand'] [data-part='lifeline-line'] {
		stroke: var(--dry-color-stroke-brand);
	}
	[data-part='lifeline'][data-color='success'] [data-part='lifeline-line'] {
		stroke: var(--dry-color-stroke-success);
	}
	[data-part='lifeline'][data-color='warning'] [data-part='lifeline-line'] {
		stroke: var(--dry-color-stroke-warning);
	}
	[data-part='lifeline'][data-color='error'] [data-part='lifeline-line'] {
		stroke: var(--dry-color-stroke-error);
	}
	[data-part='lifeline'][data-color='info'] [data-part='lifeline-line'] {
		stroke: var(--dry-color-stroke-info);
	}
</style>
