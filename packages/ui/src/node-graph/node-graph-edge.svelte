<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { getNodeGraphCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGLineElement> {
		from: string;
		to: string;
		label?: string;
		dashed?: boolean;
	}

	let { from, to, label, dashed = false, class: className, ...rest }: Props = $props();

	const ctx = getNodeGraphCtx();

	const fromNode = $derived(ctx.getNode(from));
	const toNode = $derived(ctx.getNode(to));

	const x1 = $derived(fromNode?.x ?? 0);
	const y1 = $derived(fromNode?.y ?? 0);
	const x2 = $derived(toNode?.x ?? 0);
	const y2 = $derived(toNode?.y ?? 0);

	const midX = $derived((x1 + x2) / 2);
	const midY = $derived((y1 + y2) / 2);
</script>

{#if fromNode && toNode}
	<g data-part="edge" class={className}>
		<line
			{x1}
			{y1}
			{x2}
			{y2}
			data-part="edge-line"
			data-dashed={dashed ? '' : undefined}
			marker-end="url(#dry-graph-arrow)"
			{...rest}
		/>
		{#if label}
			<text x={midX} y={midY - 6} text-anchor="middle" data-part="edge-label">
				{label}
			</text>
		{/if}
	</g>
{/if}

<style>
	[data-part='edge-line'] {
		stroke: var(--dry-graph-edge-color);
		stroke-width: 1.5;
	}

	[data-part='edge-line'][data-dashed] {
		stroke-dasharray: 6 3;
	}

	[data-part='edge-label'] {
		font-size: 9px;
		font-weight: 500;
		fill: var(--dry-color-text-weak);
	}
</style>
