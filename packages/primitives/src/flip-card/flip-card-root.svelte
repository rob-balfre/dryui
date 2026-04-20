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
	{...rest}
>
	{@render children()}
</div>
