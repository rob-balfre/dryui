<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFlipCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		trigger?: 'hover' | 'click';
		direction?: 'horizontal' | 'vertical';
		flipped?: boolean;
		children: Snippet;
	}

	let {
		trigger = 'hover',
		direction = 'horizontal',
		flipped = $bindable(false),
		class: className,
		children,
		...rest
	}: Props = $props();

	function toggle() {
		flipped = !flipped;
	}

	setFlipCardCtx({
		get flipped() {
			return flipped;
		},
		get direction() {
			return direction;
		}
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	data-flip-card
	data-flipped={flipped ? '' : undefined}
	data-trigger={trigger}
	data-direction={direction}
	role={trigger === 'click' ? 'button' : 'group'}
	aria-roledescription="flip card"
	tabindex={trigger === 'click' ? 0 : undefined}
	onmouseenter={trigger === 'hover' ? () => (flipped = true) : undefined}
	onmouseleave={trigger === 'hover' ? () => (flipped = false) : undefined}
	onclick={trigger === 'click' ? toggle : undefined}
	onkeydown={trigger === 'click'
		? (e) => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					toggle();
				}
			}
		: undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-flip-card] {
		--dry-flip-card-duration: 0.6s;
		--dry-flip-card-perspective: 1000px;
		--dry-flip-card-front-transform: rotateY(0deg);
		--dry-flip-card-back-transform: rotateY(180deg);

		display: grid;
		perspective: var(--dry-flip-card-perspective);
		position: relative;
		transform-style: preserve-3d;
	}

	[data-flip-card][data-direction='horizontal'][data-flipped] {
		--dry-flip-card-front-transform: rotateY(180deg);
		--dry-flip-card-back-transform: rotateY(360deg);
	}

	[data-flip-card][data-direction='vertical'] {
		--dry-flip-card-front-transform: rotateX(0deg);
		--dry-flip-card-back-transform: rotateX(180deg);
	}

	[data-flip-card][data-direction='vertical'][data-flipped] {
		--dry-flip-card-front-transform: rotateX(180deg);
		--dry-flip-card-back-transform: rotateX(360deg);
	}
</style>
