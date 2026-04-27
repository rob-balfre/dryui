<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { observeInViewport, observePageVisibility } from '@dryui/primitives';

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

	let el = $state<HTMLSpanElement>();

	$effect(() => {
		if (!el) return;
		el.style.setProperty('--dry-shimmer-color', color);
		el.style.setProperty('--dry-shimmer-duration', `${duration}s`);
	});

	$effect(() => {
		if (!el) return;
		const node = el;
		let onScreen = true;
		let tabVisible = true;

		const apply = () => {
			if (onScreen && tabVisible) node.dataset.active = '';
			else delete node.dataset.active;
		};

		const unsubscribeViewport = observeInViewport(
			node,
			(inView) => {
				onScreen = inView;
				apply();
			},
			{ rootMargin: '100px' }
		);
		const unsubscribeVisibility = observePageVisibility((visible) => {
			tabVisible = visible;
			apply();
		});
		return () => {
			unsubscribeViewport();
			unsubscribeVisibility();
		};
	});
</script>

<span bind:this={el} data-shimmer class={className} {...rest}>
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
		content-visibility: auto;
		contain-intrinsic-size: auto;
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
		animation: shimmer-sweep var(--dry-shimmer-duration, 3s) linear infinite;
		animation-play-state: paused;
	}

	[data-shimmer][data-active] [data-shimmer-streak] {
		animation-play-state: running;
		will-change: mask-position;
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
