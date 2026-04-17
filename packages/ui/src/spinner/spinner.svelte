<script lang="ts">
	import type { SVGAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';

	interface Props extends SVGAttributes<SVGSVGElement> {
		size?: 'sm' | 'md' | 'lg';
		color?: 'primary' | 'current';
		label?: string;
	}

	let {
		size = 'md',
		color = 'primary',
		label = 'Loading',
		class: className,
		...rest
	}: Props = $props();
</script>

<svg
	role="status"
	aria-label={label}
	viewBox="0 0 24 24"
	fill="none"
	xmlns="http://www.w3.org/2000/svg"
	{...variantAttrs({ size, color })}
	class={className}
	{...rest}
>
	<circle
		cx="12"
		cy="12"
		r="10"
		stroke="currentColor"
		stroke-width="3"
		stroke-linecap="round"
		stroke-dasharray="31.42 31.42"
	/>
</svg>

<style>
	svg {
		/* Component tokens (Tier 3) */
		--dry-spinner-size: var(--dry-space-6);
		--dry-spinner-color: var(--dry-color-fill-brand);
		--dry-spinner-width: 3px;

		aspect-ratio: 1;
		height: var(--dry-spinner-size);
		color: var(--dry-spinner-color);
		animation: spinner-rotate 0.75s linear infinite;
	}

	svg circle {
		stroke: var(--dry-spinner-color);
		stroke-width: var(--dry-spinner-width);
	}

	@keyframes spinner-rotate {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		svg {
			animation: spinner-pulse 2s ease-in-out infinite;
		}
	}

	@keyframes spinner-pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.4;
		}
	}

	/* ── Sizes ─────────────────────────────────────────────────────────────────── */

	svg[data-size='sm'] {
		--dry-spinner-size: var(--dry-space-4);
		--dry-spinner-width: 2px;
	}

	svg[data-size='md'] {
		--dry-spinner-size: var(--dry-space-6);
		--dry-spinner-width: 3px;
	}

	svg[data-size='lg'] {
		--dry-spinner-size: var(--dry-space-8);
		--dry-spinner-width: 3.5px;
	}

	/* ── Colors ────────────────────────────────────────────────────────────────── */

	svg[data-color='primary'] {
		--dry-spinner-color: var(--dry-color-fill-brand);
	}

	svg[data-color='current'] {
		--dry-spinner-color: currentColor;
	}
</style>
