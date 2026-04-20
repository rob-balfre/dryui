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
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		...rest
	}: Props = $props();

	function toggle() {
		flipped = !flipped;
	}

	const toggleLabel = $derived(flipped ? 'Show front of card' : 'Show back of card');

	setFlipCardCtx({
		get flipped() {
			return flipped;
		},
		get direction() {
			return direction;
		}
	});
</script>

<div
	data-part="root"
	data-flipped={flipped ? '' : undefined}
	data-trigger={trigger}
	data-direction={direction}
	role={trigger === 'hover' ? 'group' : undefined}
	aria-roledescription={trigger === 'hover' ? 'flip card' : undefined}
	aria-label={trigger === 'hover' ? ariaLabel : undefined}
	aria-labelledby={trigger === 'hover' ? ariaLabelledBy : undefined}
	onmouseenter={trigger === 'hover' ? () => (flipped = true) : undefined}
	onmouseleave={trigger === 'hover' ? () => (flipped = false) : undefined}
	{...rest}
>
	{#if trigger === 'click'}
		<button
			type="button"
			data-part="toggle"
			aria-pressed={flipped}
			aria-label={ariaLabel ?? toggleLabel}
			aria-labelledby={ariaLabelledBy}
			onclick={toggle}
		></button>
	{/if}
	{@render children()}
</div>

<style>
	[data-part='root'] {
		position: relative;
	}

	[data-part='toggle'] {
		position: absolute;
		inset: 0;
		z-index: 1;
		border: 0;
		padding: 0;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
		appearance: none;
	}

	[data-part='toggle']:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}
</style>
