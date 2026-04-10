<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { getNodeGraphCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		id: string;
		x: number;
		y: number;
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		state?: 'default' | 'active' | 'complete' | 'blocked';
		children: Snippet;
	}

	let {
		id,
		x,
		y,
		color = 'neutral',
		state = 'default',
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getNodeGraphCtx();

	$effect(() => {
		ctx.registerNode({ id, x, y });
	});

	const nodeWidth = 100;
	const nodeHeight = 36;
</script>

<g
	transform="translate({x},{y})"
	data-part="graph-node"
	data-color={color !== 'neutral' ? color : undefined}
	data-state={state !== 'default' ? state : undefined}
	class={className}
	{...rest}
>
	<rect
		x={-nodeWidth / 2}
		y={-nodeHeight / 2}
		width={nodeWidth}
		height={nodeHeight}
		rx="8"
		data-part="graph-node-box"
	/>
	<foreignObject
		x={-nodeWidth / 2}
		y={-nodeHeight / 2}
		width={nodeWidth}
		height={nodeHeight}
	>
		<div data-part="graph-node-content">
			{@render children()}
		</div>
	</foreignObject>
</g>

<style>
	[data-part='graph-node-box'] {
		fill: var(--dry-graph-node-bg);
		stroke: var(--dry-graph-node-border);
		stroke-width: 1;
		transition: fill 0.15s, stroke 0.15s;
	}

	/* ── Color variants ──────────────────────────────────── */
	[data-part='graph-node'][data-color='brand'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-brand-weak);
		stroke: var(--dry-color-stroke-brand);
	}

	[data-part='graph-node'][data-color='success'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-success-weak);
		stroke: var(--dry-color-stroke-success);
	}

	[data-part='graph-node'][data-color='warning'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-warning-weak);
		stroke: var(--dry-color-stroke-warning);
	}

	[data-part='graph-node'][data-color='error'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-error-weak);
		stroke: var(--dry-color-stroke-error);
	}

	[data-part='graph-node'][data-color='info'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-info-weak);
		stroke: var(--dry-color-stroke-info);
	}

	/* ── State variants ──────────────────────────────────── */
	[data-part='graph-node'][data-state='active'] [data-part='graph-node-box'] {
		stroke: var(--dry-color-fill-brand);
		stroke-width: 2;
	}

	[data-part='graph-node'][data-state='complete'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill-success-weak);
		stroke: var(--dry-color-stroke-success);
	}

	[data-part='graph-node'][data-state='blocked'] [data-part='graph-node-box'] {
		fill: var(--dry-color-fill);
		stroke: var(--dry-color-stroke-weak);
		stroke-dasharray: 4 2;
		opacity: 0.6;
	}

	/* ── Content ─────────────────────────────────────────── */
	[data-part='graph-node-content'] {
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 11px;
		font-weight: 600;
		color: var(--dry-graph-node-color);
		text-align: center;
		line-height: 1.2;
		padding: 4px 8px;
	}

	[data-part='graph-node'][data-state='blocked'] [data-part='graph-node-content'] {
		opacity: 0.6;
	}

	[data-part='graph-node'][data-color='brand'] [data-part='graph-node-content'] {
		color: var(--dry-color-text-brand);
	}

	[data-part='graph-node'][data-color='success'] [data-part='graph-node-content'] {
		color: var(--dry-color-text-success);
	}

	[data-part='graph-node'][data-color='error'] [data-part='graph-node-content'] {
		color: var(--dry-color-text-error);
	}

	[data-part='graph-node'][data-color='warning'] [data-part='graph-node-content'] {
		color: var(--dry-color-text-warning);
	}

	[data-part='graph-node'][data-color='info'] [data-part='graph-node-content'] {
		color: var(--dry-color-text-info);
	}
</style>
