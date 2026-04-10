<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getArchDiagramCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		position?: 'start' | 'end';
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		children: Snippet;
	}

	let {
		label,
		position = 'start',
		color = 'neutral',
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getArchDiagramCtx();
</script>

<div
	data-part="group"
	data-position={position}
	data-color={color !== 'neutral' ? color : undefined}
	data-layout={ctx.layout}
	class={className}
	{...rest}
>
	<span data-part="group-label">{label}</span>

	<!-- Direction arrow -->
	<div data-part="group-arrow" aria-hidden="true">
		<svg viewBox="0 0 16 24" data-part="group-arrow-svg">
			{#if (ctx.layout === 'vertical' && position === 'start') || (ctx.layout === 'horizontal' && position === 'start')}
				<line x1="8" y1="0" x2="8" y2="18" />
				<polyline points="3,14 8,20 13,14" />
			{:else}
				<line x1="8" y1="6" x2="8" y2="24" />
				<polyline points="3,10 8,4 13,10" />
			{/if}
		</svg>
	</div>

	<div data-part="group-items">
		{@render children()}
	</div>
</div>

<style>
	[data-part='group'] {
		display: grid;
		gap: var(--dry-space-3);
		padding: var(--dry-space-4);
		background: var(--dry-arch-group-bg);
		border: 1px solid var(--dry-arch-group-border);
		border-radius: var(--dry-arch-group-radius);
		position: relative;
	}

	[data-part='group'][data-position='end'] {
		order: 3;
	}

	[data-part='group'][data-position='start'] {
		order: 1;
	}

	/* ── Color variants ──────────────────────────────────── */
	[data-part='group'][data-color='brand'] {
		border-color: var(--dry-color-stroke-brand);
		background: var(--dry-color-fill-brand-weak);
	}

	[data-part='group'][data-color='success'] {
		border-color: var(--dry-color-stroke-success);
		background: var(--dry-color-fill-success-weak);
	}

	[data-part='group'][data-color='info'] {
		border-color: var(--dry-color-stroke-info);
		background: var(--dry-color-fill-info-weak);
	}

	[data-part='group'][data-color='warning'] {
		border-color: var(--dry-color-stroke-warning);
		background: var(--dry-color-fill-warning-weak);
	}

	[data-part='group'][data-color='error'] {
		border-color: var(--dry-color-stroke-error);
		background: var(--dry-color-fill-error-weak);
	}

	/* ── Label ────────────────────────────────────────────── */
	[data-part='group-label'] {
		font-size: var(--dry-type-ui-caption-size, 0.75rem);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--dry-color-text-weak);
		text-align: center;
	}

	[data-part='group'][data-color='brand'] [data-part='group-label'] {
		color: var(--dry-color-text-brand);
	}

	[data-part='group'][data-color='success'] [data-part='group-label'] {
		color: var(--dry-color-text-success);
	}

	[data-part='group'][data-color='info'] [data-part='group-label'] {
		color: var(--dry-color-text-info);
	}

	/* ── Arrow between group and center ──────────────────── */
	[data-part='group-arrow'] {
		display: grid;
		place-items: center;
	}

	[data-part='group-arrow-svg'] {
		height: var(--dry-space-6);
		display: block;
	}

	[data-part='group-arrow'] line {
		stroke: var(--dry-arch-arrow-color);
		stroke-width: 1.5;
	}

	[data-part='group-arrow'] polyline {
		stroke: var(--dry-arch-arrow-color);
		stroke-width: 1.5;
		fill: none;
	}

	[data-part='group'][data-layout='horizontal'] [data-part='group-arrow-svg'] {
		transform: rotate(-90deg);
	}

	/* ── Items container ──────────────────────────────────── */
	[data-part='group-items'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2);
		justify-content: center;
	}
</style>
