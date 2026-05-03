<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import VisuallyHidden from '../visually-hidden/visually-hidden.svelte';
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
		class: className,
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
	data-flip-card
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
	class={className}
	{...rest}
>
	{#if trigger === 'click'}
		<span data-flip-card-toggle-shell>
			<Button
				variant="bare"
				aria-pressed={flipped}
				aria-label={ariaLabel ?? toggleLabel}
				aria-labelledby={ariaLabelledBy}
				onclick={toggle}
			>
				<VisuallyHidden>{toggleLabel}</VisuallyHidden>
			</Button>
		</span>
	{/if}
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

	[data-flip-card-toggle-shell] {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: grid;
		border-radius: inherit;
		--dry-btn-bg: var(--dry-flip-card-toggle-overlay-bg, transparent);
		--dry-btn-border: var(--dry-flip-card-toggle-overlay-border, transparent);
		--dry-btn-color: inherit;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-min-height: 0;
		--dry-btn-radius: inherit;
		box-shadow: none;
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
