<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'text' | 'circular' | 'rectangular';
		width?: string;
		height?: string;
	}

	let { variant = 'text', width, height, class: className, ...rest }: Props = $props();

	function setDimensions(node: HTMLElement) {
		$effect(() => {
			if (width) {
				node.style.setProperty('width', width);
			} else {
				node.style.removeProperty('width');
			}
			if (height) {
				node.style.setProperty('height', height);
			} else {
				node.style.removeProperty('height');
			}
		});
	}
</script>

<div
	aria-hidden="true"
	data-variant={variant}
	{@attach setDimensions}
	class={className}
	{...rest}
></div>

<style>
	div {
		/* Component tokens (Tier 3) — uses semantic color for dark mode support */
		--dry-skeleton-color: color-mix(
			in srgb,
			var(--dry-color-text-strong) 8%,
			var(--dry-color-bg-base)
		);
		--dry-skeleton-highlight: color-mix(
			in srgb,
			var(--dry-color-text-strong) 14%,
			var(--dry-color-bg-base)
		);
		--dry-skeleton-radius: var(--dry-radius-sm);

		display: block;
		background-color: var(--dry-skeleton-color);
		background-image: linear-gradient(
			90deg,
			var(--dry-skeleton-color) 0%,
			var(--dry-skeleton-highlight) 40%,
			var(--dry-skeleton-color) 80%
		);
		background-size: 200% 100%;
		animation: skeleton-shimmer 1.5s ease-in-out infinite;
		border-radius: var(--dry-skeleton-radius);
	}

	@keyframes skeleton-shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		div {
			animation: none;
			background-image: none;
		}
	}

	/* ── Variants ──────────────────────────────────────────────────────────────── */

	div[data-variant='text'] {
		--dry-skeleton-radius: var(--dry-radius-md);
		height: var(--dry-text-base-leading);
	}

	div[data-variant='circular'] {
		--dry-skeleton-radius: var(--dry-radius-full);
		aspect-ratio: 1;
		height: var(--dry-space-10);
	}

	div[data-variant='rectangular'] {
		--dry-skeleton-radius: var(--dry-radius-sm);
		height: var(--dry-space-16);
	}
</style>
