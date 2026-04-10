<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		label: string;
		description?: string;
		color?: 'neutral' | 'brand' | 'success' | 'warning' | 'error' | 'info';
		children?: Snippet;
	}

	let {
		label,
		description,
		color = 'neutral',
		class: className,
		children,
		...rest
	}: Props = $props();
</script>

<div
	data-part="layer"
	data-color={color !== 'neutral' ? color : undefined}
	class={className}
	{...rest}
>
	<span data-part="layer-label">{label}</span>
	{#if description}
		<span data-part="layer-description">{description}</span>
	{/if}
	{#if children}
		<div data-part="layer-content">
			{@render children()}
		</div>
	{/if}
</div>

<style>
	[data-part='layer'] {
		display: grid;
		gap: var(--dry-space-2);
		padding: var(--dry-layer-padding, var(--dry-space-6));
		border: 1px var(--dry-layer-border-style, solid) var(--dry-color-stroke-weak);
		border-radius: var(--dry-layer-radius, var(--dry-radius-2xl));
		background: var(--dry-color-fill);
		position: relative;
	}

	/* ── Color variants ──────────────────────────────────── */
	[data-part='layer'][data-color='brand'] {
		border-color: var(--dry-color-stroke-brand);
		background: var(--dry-color-fill-brand-weak);
	}

	[data-part='layer'][data-color='success'] {
		border-color: var(--dry-color-stroke-success);
		background: var(--dry-color-fill-success-weak);
	}

	[data-part='layer'][data-color='warning'] {
		border-color: var(--dry-color-stroke-warning);
		background: var(--dry-color-fill-warning-weak);
	}

	[data-part='layer'][data-color='error'] {
		border-color: var(--dry-color-stroke-error);
		background: var(--dry-color-fill-error-weak);
	}

	[data-part='layer'][data-color='info'] {
		border-color: var(--dry-color-stroke-info);
		background: var(--dry-color-fill-info-weak);
	}

	/* ── Label ────────────────────────────────────────────── */
	[data-part='layer-label'] {
		font-size: var(--dry-layer-label-size, var(--dry-type-ui-caption-size, 0.75rem));
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--dry-color-text-weak);
	}

	[data-part='layer'][data-color='brand'] [data-part='layer-label'] {
		color: var(--dry-color-text-brand);
	}

	[data-part='layer'][data-color='success'] [data-part='layer-label'] {
		color: var(--dry-color-text-success);
	}

	[data-part='layer'][data-color='warning'] [data-part='layer-label'] {
		color: var(--dry-color-text-warning);
	}

	[data-part='layer'][data-color='error'] [data-part='layer-label'] {
		color: var(--dry-color-text-error);
	}

	[data-part='layer'][data-color='info'] [data-part='layer-label'] {
		color: var(--dry-color-text-info);
	}

	/* ── Description ──────────────────────────────────────── */
	[data-part='layer-description'] {
		font-size: var(--dry-type-tiny-size, 0.875rem);
		color: var(--dry-color-text-weak);
		line-height: 1.4;
	}

	/* ── Content (nested layers) ──────────────────────────── */
	[data-part='layer-content'] {
		display: grid;
		gap: var(--dry-space-3);
	}
</style>
