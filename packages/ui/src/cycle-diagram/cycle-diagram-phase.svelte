<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';
	import { getCycleDiagramCtx } from './context.svelte.js';

	interface Props extends SVGAttributes<SVGGElement> {
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		children: Snippet;
	}

	let { color = 'neutral', class: className, children, ...rest }: Props = $props();

	const ctx = getCycleDiagramCtx();
	const index = ctx.registerPhase();

	const angle = $derived(
		(2 * Math.PI * index) / ctx.phaseCount - Math.PI / 2
	);
	const x = $derived(ctx.centerX + ctx.radius * Math.cos(angle));
	const y = $derived(ctx.centerY + ctx.radius * Math.sin(angle));

	const nodeWidth = 80;
	const nodeHeight = 32;
</script>

<g
	transform="translate({x},{y})"
	data-part="phase"
	data-color={color !== 'neutral' ? color : undefined}
	class={className}
	{...rest}
>
	<rect
		x={-nodeWidth / 2}
		y={-nodeHeight / 2}
		width={nodeWidth}
		height={nodeHeight}
		rx="8"
		data-part="phase-box"
	/>
	<foreignObject
		x={-nodeWidth / 2}
		y={-nodeHeight / 2}
		width={nodeWidth}
		height={nodeHeight}
	>
		<div data-part="phase-content">
			{@render children()}
		</div>
	</foreignObject>
</g>

<style>
	[data-part='phase-box'] {
		fill: var(--dry-cycle-node-bg);
		stroke: var(--dry-cycle-node-border);
		stroke-width: 1;
	}

	[data-part='phase'][data-color='brand'] [data-part='phase-box'] {
		fill: var(--dry-color-fill-brand-weak);
		stroke: var(--dry-color-stroke-brand);
	}

	[data-part='phase'][data-color='success'] [data-part='phase-box'] {
		fill: var(--dry-color-fill-success-weak);
		stroke: var(--dry-color-stroke-success);
	}

	[data-part='phase'][data-color='warning'] [data-part='phase-box'] {
		fill: var(--dry-color-fill-warning-weak);
		stroke: var(--dry-color-stroke-warning);
	}

	[data-part='phase'][data-color='error'] [data-part='phase-box'] {
		fill: var(--dry-color-fill-error-weak);
		stroke: var(--dry-color-stroke-error);
	}

	[data-part='phase'][data-color='info'] [data-part='phase-box'] {
		fill: var(--dry-color-fill-info-weak);
		stroke: var(--dry-color-stroke-info);
	}

	[data-part='phase-content'] {
		display: grid;
		place-items: center;
		height: 100%;
		font-size: 11px;
		font-weight: 600;
		color: var(--dry-cycle-node-color);
		text-align: center;
		line-height: 1.2;
		padding: 4px 6px;
	}

	[data-part='phase'][data-color='brand'] [data-part='phase-content'] {
		color: var(--dry-color-text-brand);
	}

	[data-part='phase'][data-color='success'] [data-part='phase-content'] {
		color: var(--dry-color-text-success);
	}

	[data-part='phase'][data-color='warning'] [data-part='phase-content'] {
		color: var(--dry-color-text-warning);
	}

	[data-part='phase'][data-color='error'] [data-part='phase-content'] {
		color: var(--dry-color-text-error);
	}

	[data-part='phase'][data-color='info'] [data-part='phase-content'] {
		color: var(--dry-color-text-info);
	}
</style>
