<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		icon: Snippet | Component | unknown;
		size?: 'sm' | 'md' | 'lg';
		label?: string;
	}

	let { icon, size = 'md', label, class: className, ...rest }: Props = $props();
</script>

{#key icon}
	{@const IconComponent = icon as Component}
	{@const iconAsSnippet = icon as Snippet}
	<span class={['dry-icon-swap', className]} data-size={size} aria-label={label} {...rest}>
		{#if typeof icon === 'function' && (icon as Snippet).length === 0}
			{@render iconAsSnippet()}
		{:else}
			<IconComponent />
		{/if}
	</span>
{/key}

<style>
	.dry-icon-swap {
		display: inline-grid;
		place-items: center;
		line-height: 0;
		animation: icon-swap-in var(--dry-icon-swap-duration, 120ms)
			var(--dry-icon-swap-ease, cubic-bezier(0.16, 1, 0.3, 1)) both;
	}

	@keyframes icon-swap-in {
		from {
			opacity: 0;
			transform: scale(var(--dry-icon-swap-scale-out, 0.85));
			filter: blur(var(--dry-icon-swap-blur-out, 2px));
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.dry-icon-swap {
			animation: none;
		}
	}
</style>
