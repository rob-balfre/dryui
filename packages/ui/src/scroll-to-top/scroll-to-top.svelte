<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props {
		threshold?: number;
		target?: HTMLElement;
		behavior?: ScrollBehavior;
		position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
		class?: string;
	}

	let {
		threshold = 300,
		target,
		behavior = 'smooth',
		position = 'bottom-right',
		class: className
	}: Props = $props();

	let visible = $state(false);

	function scrollToTop() {
		if (target) {
			target.scrollTo({ top: 0, behavior });
		} else {
			window.scrollTo({ top: 0, behavior });
		}
	}

	$effect(() => {
		const el = target ?? window;

		function handleScroll() {
			if (target) {
				visible = target.scrollTop > threshold;
			} else {
				visible = window.scrollY > threshold;
			}
		}

		handleScroll();
		el.addEventListener('scroll', handleScroll, { passive: true });

		return () => {
			el.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<button
	type="button"
	data-scroll-to-top
	data-position={position}
	data-visible={visible || undefined}
	class={className}
	onclick={scrollToTop}
	aria-label="Scroll to top"
>
	<svg
		data-icon
		width="20"
		height="20"
		viewBox="0 0 20 20"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
	>
		<path
			d="M10 15V5M10 5L5 10M10 5L15 10"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
		/>
	</svg>
</button>

<style>
	[data-scroll-to-top] {
		--dry-scroll-to-top-size: 44px;
		--dry-scroll-to-top-bg: var(--dry-color-bg-overlay);
		--dry-scroll-to-top-color: var(--dry-color-text-strong);
		--dry-scroll-to-top-border: var(--dry-color-stroke-weak);
		--dry-scroll-to-top-shadow: var(--dry-shadow-md);
		--dry-scroll-to-top-radius: var(--dry-radius-full);
		--dry-scroll-to-top-offset: var(--dry-space-6);
		--dry-scroll-to-top-z-index: var(--dry-layer-overlay);

		position: fixed;
		z-index: var(--dry-scroll-to-top-z-index);
		display: grid;
		place-items: center;
		height: var(--dry-scroll-to-top-size);
		aspect-ratio: 1;
		padding: 0;
		background: var(--dry-scroll-to-top-bg);
		color: var(--dry-scroll-to-top-color);
		border: 1px solid var(--dry-scroll-to-top-border);
		border-radius: var(--dry-scroll-to-top-radius);
		box-shadow: var(--dry-scroll-to-top-shadow);
		cursor: pointer;
		opacity: 0;
		pointer-events: none;
		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-emphasized),
			transform var(--dry-duration-normal) var(--dry-ease-emphasized);
		transform: translateY(var(--dry-motion-distance-xs));

		&[data-visible] {
			opacity: 1;
			pointer-events: auto;
			transform: translateY(0);
		}

		&:hover {
			--dry-scroll-to-top-bg: color-mix(
				in srgb,
				var(--dry-color-fill-brand) 8%,
				var(--dry-color-bg-overlay)
			);
			--dry-scroll-to-top-color: var(--dry-color-fill-brand);
		}

		&:focus-visible {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: 2px;
		}

		&:active {
			transform: translateY(1px);
		}
	}

	[data-icon] {
		display: block;
	}

	[data-position='bottom-right'] {
		bottom: var(--dry-scroll-to-top-offset);
		right: var(--dry-scroll-to-top-offset);
	}

	[data-position='bottom-left'] {
		bottom: var(--dry-scroll-to-top-offset);
		left: var(--dry-scroll-to-top-offset);
	}

	[data-position='bottom-center'] {
		bottom: var(--dry-scroll-to-top-offset);
		left: 50%;
		transform: translateX(-50%) translateY(var(--dry-motion-distance-xs));

		&[data-visible] {
			transform: translateX(-50%) translateY(0);
		}

		&:active {
			transform: translateX(-50%) translateY(1px);
		}
	}
</style>
