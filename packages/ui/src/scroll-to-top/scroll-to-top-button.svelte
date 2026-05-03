<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { ScrollToTop } from '@dryui/primitives';
	import Button from '../button/button.svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		threshold?: number;
		target?: HTMLElement;
		behavior?: ScrollBehavior;
		position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
	}

	let {
		threshold = 300,
		target,
		behavior = 'smooth',
		position = 'bottom-right',
		class: className,
		...rest
	}: Props = $props();
</script>

<ScrollToTop {threshold} {target} {behavior}>
	{#snippet children({ visible, scrollToTop })}
		<span
			class={['scroll-to-top-slot', className]}
			data-position={position}
			data-visible={visible || undefined}
			{...rest}
		>
			<Button
				variant="nav"
				size="icon"
				type="button"
				aria-label="Scroll to top"
				onclick={scrollToTop}
			>
				<svg
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
			</Button>
		</span>
	{/snippet}
</ScrollToTop>

<style>
	.scroll-to-top-slot {
		position: fixed;
		z-index: var(--dry-layer-overlay);
		display: inline-grid;
		opacity: 0;
		pointer-events: none;
		transition: opacity var(--dry-duration-normal) var(--dry-ease-emphasized);
	}

	.scroll-to-top-slot[data-visible] {
		opacity: 1;
		pointer-events: auto;
	}

	.scroll-to-top-slot[data-position='bottom-right'] {
		bottom: var(--dry-space-6);
		right: var(--dry-space-6);
	}

	.scroll-to-top-slot[data-position='bottom-left'] {
		bottom: var(--dry-space-6);
		left: var(--dry-space-6);
	}

	.scroll-to-top-slot[data-position='bottom-center'] {
		bottom: var(--dry-space-6);
		left: 50%;
		transform: translateX(-50%);
	}
</style>
