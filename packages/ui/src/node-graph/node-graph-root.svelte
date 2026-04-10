<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { setNodeGraphCtx, type GraphNodeDef } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGSVGElement> {
		viewWidth?: number;
		viewHeight?: number;
		children: Snippet;
	}

	let {
		viewWidth = 600,
		viewHeight = 400,
		class: className,
		children,
		...rest
	}: Props = $props();

	let containerEl: HTMLDivElement | undefined = $state();
	let observedWidth = $state(600);
	let observedHeight = $state(400);

	$effect(() => {
		if (!containerEl) return;

		const ro = new ResizeObserver((entries) => {
			for (const entry of entries) {
				const cr = entry.contentRect;
				observedWidth = Math.round(cr.width) || 600;
				observedHeight = Math.round(cr.height) || 400;
			}
		});

		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	const nodes = new Map<string, GraphNodeDef>();

	setNodeGraphCtx({
		get width() {
			return viewWidth;
		},
		get height() {
			return viewHeight;
		},
		registerNode(node: GraphNodeDef) {
			nodes.set(node.id, node);
		},
		getNode(id: string) {
			return nodes.get(id);
		}
	});
</script>

<div bind:this={containerEl} data-graph-container>
	<svg
		viewBox="0 0 {viewWidth} {viewHeight}"
		role="img"
		aria-label="Node graph"
		data-node-graph
		class={className}
		{...rest}
	>
		<!-- Arrowhead marker definition -->
		<defs>
			<marker
				id="dry-graph-arrow"
				viewBox="0 0 10 10"
				refX="10"
				refY="5"
				markerWidth="8"
				markerHeight="8"
				orient="auto-start-reverse"
			>
				<path d="M 0 0 L 10 5 L 0 10 z" data-part="marker-arrow" />
			</marker>
		</defs>

		{@render children()}
	</svg>
</div>

<style>
	[data-graph-container] {
		display: grid;
		min-height: 200px;
	}

	[data-node-graph] {
		--dry-graph-bg: transparent;
		--dry-graph-node-bg: var(--dry-color-bg-raised);
		--dry-graph-node-border: var(--dry-color-stroke-weak);
		--dry-graph-node-color: var(--dry-color-text-strong);
		--dry-graph-node-radius: 8;
		--dry-graph-edge-color: var(--dry-color-stroke-strong);
		--dry-graph-cluster-bg: var(--dry-color-fill);
		--dry-graph-cluster-border: var(--dry-color-stroke-weak);
		--dry-graph-cluster-radius: 12;

		display: block;
		overflow: visible;
		background: var(--dry-graph-bg);
	}

	[data-part='marker-arrow'] {
		fill: var(--dry-graph-edge-color);
	}
</style>
