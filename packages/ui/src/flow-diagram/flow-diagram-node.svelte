<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getFlowDiagramCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		variant?: 'default' | 'outlined' | 'filled';
		children: Snippet;
	}

	let {
		color = 'neutral',
		variant = 'default',
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getFlowDiagramCtx();
</script>

<div
	data-part="node"
	data-color={color !== 'neutral' ? color : undefined}
	data-variant={variant !== 'default' ? variant : undefined}
	data-direction={ctx.direction}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<div data-part="connector" data-direction={ctx.direction} aria-hidden="true">
	<svg
		viewBox={ctx.direction === 'horizontal' ? '0 0 24 16' : '0 0 16 24'}
		data-part="connector-svg"
	>
		{#if ctx.direction === 'horizontal'}
			<line x1="0" y1="8" x2="18" y2="8" />
			<polyline points="14,3 20,8 14,13" />
		{:else}
			<line x1="8" y1="0" x2="8" y2="18" />
			<polyline points="3,14 8,20 13,14" />
		{/if}
	</svg>
</div>

<style>
	[data-part='node'] {
		padding: var(--dry-space-3) var(--dry-space-5);
		background: var(--dry-flow-node-bg);
		border: 1px solid var(--dry-flow-node-border);
		border-radius: var(--dry-flow-node-radius);
		color: var(--dry-flow-node-color);
		font-size: var(--dry-type-ui-control-size, 0.875rem);
		font-weight: 500;
		text-align: center;
		line-height: 1.25;
		letter-spacing: -0.01em;
	}

	/* ── Color variants ──────────────────────────────────── */
	[data-part='node'][data-color='brand'] {
		--dry-flow-node-bg: var(--dry-color-fill-brand-weak);
		--dry-flow-node-border: var(--dry-color-stroke-brand);
		--dry-flow-node-color: var(--dry-color-text-brand);
	}

	[data-part='node'][data-color='success'] {
		--dry-flow-node-bg: var(--dry-color-fill-success-weak);
		--dry-flow-node-border: var(--dry-color-stroke-success);
		--dry-flow-node-color: var(--dry-color-text-success);
	}

	[data-part='node'][data-color='warning'] {
		--dry-flow-node-bg: var(--dry-color-fill-warning-weak);
		--dry-flow-node-border: var(--dry-color-stroke-warning);
		--dry-flow-node-color: var(--dry-color-text-warning);
	}

	[data-part='node'][data-color='error'] {
		--dry-flow-node-bg: var(--dry-color-fill-error-weak);
		--dry-flow-node-border: var(--dry-color-stroke-error);
		--dry-flow-node-color: var(--dry-color-text-error);
	}

	[data-part='node'][data-color='info'] {
		--dry-flow-node-bg: var(--dry-color-fill-info-weak);
		--dry-flow-node-border: var(--dry-color-stroke-info);
		--dry-flow-node-color: var(--dry-color-text-info);
	}

	/* ── Style variants ──────────────────────────────────── */
	[data-part='node'][data-variant='outlined'] {
		background: transparent;
		border-style: dashed;
	}

	[data-part='node'][data-variant='filled'] {
		background: var(--dry-color-fill-brand);
		border-color: var(--dry-color-fill-brand);
		color: var(--dry-color-on-brand);
	}

	[data-part='node'][data-variant='filled'][data-color='success'] {
		background: var(--dry-color-fill-success);
		border-color: var(--dry-color-fill-success);
		color: var(--dry-color-on-success, #fff);
	}

	[data-part='node'][data-variant='filled'][data-color='error'] {
		background: var(--dry-color-fill-error);
		border-color: var(--dry-color-fill-error);
		color: var(--dry-color-on-error, #fff);
	}

	[data-part='node'][data-variant='filled'][data-color='warning'] {
		background: var(--dry-color-fill-warning);
		border-color: var(--dry-color-fill-warning);
		color: var(--dry-color-on-warning, #fff);
	}

	[data-part='node'][data-variant='filled'][data-color='info'] {
		background: var(--dry-color-fill-info);
		border-color: var(--dry-color-fill-info);
		color: var(--dry-color-on-info, #fff);
	}

	/* ── Connector arrow ─────────────────────────────────── */
	[data-part='connector'] {
		display: grid;
		place-items: center;
	}

	[data-part='connector']:last-child {
		display: none;
	}

	[data-part='connector-svg'] {
		display: block;
		overflow: visible;
	}

	[data-part='connector'][data-direction='horizontal'] [data-part='connector-svg'] {
		height: 1rem;
	}

	[data-part='connector'][data-direction='vertical'] [data-part='connector-svg'] {
		height: var(--dry-flow-connector-size);
	}

	[data-part='connector'] line {
		stroke: var(--dry-flow-arrow-color);
		stroke-width: 1.5;
	}

	[data-part='connector'] polyline {
		stroke: var(--dry-flow-arrow-color);
		stroke-width: 1.5;
		fill: none;
	}
</style>
