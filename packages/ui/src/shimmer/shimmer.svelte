<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'> {
		color?: string;
		duration?: number;
		children: Snippet;
	}

	let {
		color = 'var(--dry-color-fill-brand)',
		duration = 3,
		class: className,
		children,
		...rest
	}: Props = $props();

	function applyStyles(node: HTMLSpanElement) {
		$effect(() => {
			node.style.setProperty('--dry-shimmer-color', color);
			node.style.setProperty('--dry-shimmer-duration', `${duration}s`);
		});
	}
</script>

<span data-shimmer class={className} {...rest} {@attach applyStyles}>
	<span data-shimmer-base>
		{@render children()}
	</span>
	<span data-shimmer-streak aria-hidden="true">
		{@render children()}
	</span>
</span>

<style>
	[data-shimmer] {
		display: grid;
		grid-template-columns: var(--dry-shimmer-outer-columns, max-content);
		grid-column: var(--dry-shimmer-column, auto);
		justify-self: var(--dry-shimmer-justify-self, auto);
		isolation: isolate;
	}

	[data-shimmer-base],
	[data-shimmer-streak] {
		grid-area: 1 / 1;
		display: grid;
		grid-template-columns: var(--dry-shimmer-content-columns, none);
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-shimmer-gap, var(--dry-space-2));
	}

	[data-shimmer-streak] {
		color: var(--dry-shimmer-color, var(--dry-color-fill-brand));
		pointer-events: none;
		-webkit-mask-image: linear-gradient(100deg, transparent 40%, #000 50%, transparent 60%);
		mask-image: linear-gradient(100deg, transparent 40%, #000 50%, transparent 60%);
		-webkit-mask-size: 200% 100%;
		mask-size: 200% 100%;
		-webkit-mask-repeat: no-repeat;
		mask-repeat: no-repeat;
		will-change: mask-position;
		animation: shimmer-sweep var(--dry-shimmer-duration, 3s) linear infinite;
	}

	@keyframes shimmer-sweep {
		from {
			-webkit-mask-position: 150% 0;
			mask-position: 150% 0;
		}
		to {
			-webkit-mask-position: -50% 0;
			mask-position: -50% 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-shimmer-streak] {
			animation: none;
			-webkit-mask-position: 50% 0;
			mask-position: 50% 0;
		}
	}
</style>
