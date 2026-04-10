<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { SVGAttributes } from 'svelte/elements';

	interface Props extends SVGAttributes<SVGGElement> {
		x: number;
		y: number;
		clusterWidth: number;
		clusterHeight: number;
		label?: string;
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		children?: Snippet;
	}

	let {
		x,
		y,
		clusterWidth,
		clusterHeight,
		label,
		color = 'neutral',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<g data-part="cluster" data-color={color !== 'neutral' ? color : undefined} class={className} {...rest}>
	<rect
		{x}
		{y}
		width={clusterWidth}
		height={clusterHeight}
		rx="12"
		data-part="cluster-box"
	/>
	{#if label}
		<text x={x + 10} y={y + 16} data-part="cluster-label">
			{label}
		</text>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</g>

<style>
	[data-part='cluster-box'] {
		fill: var(--dry-graph-cluster-bg);
		stroke: var(--dry-graph-cluster-border);
		stroke-width: 1;
		stroke-dasharray: 4 2;
	}

	[data-part='cluster'][data-color='brand'] [data-part='cluster-box'] {
		fill: var(--dry-color-fill-brand-weak);
		stroke: var(--dry-color-stroke-brand);
	}

	[data-part='cluster'][data-color='success'] [data-part='cluster-box'] {
		fill: var(--dry-color-fill-success-weak);
		stroke: var(--dry-color-stroke-success);
	}

	[data-part='cluster'][data-color='info'] [data-part='cluster-box'] {
		fill: var(--dry-color-fill-info-weak);
		stroke: var(--dry-color-stroke-info);
	}

	[data-part='cluster'][data-color='warning'] [data-part='cluster-box'] {
		fill: var(--dry-color-fill-warning-weak);
		stroke: var(--dry-color-stroke-warning);
	}

	[data-part='cluster'][data-color='error'] [data-part='cluster-box'] {
		fill: var(--dry-color-fill-error-weak);
		stroke: var(--dry-color-stroke-error);
	}

	[data-part='cluster-label'] {
		font-size: 10px;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		fill: var(--dry-color-text-weak);
	}

	[data-part='cluster'][data-color='brand'] [data-part='cluster-label'] {
		fill: var(--dry-color-text-brand);
	}

	[data-part='cluster'][data-color='success'] [data-part='cluster-label'] {
		fill: var(--dry-color-text-success);
	}

	[data-part='cluster'][data-color='info'] [data-part='cluster-label'] {
		fill: var(--dry-color-text-info);
	}
</style>
