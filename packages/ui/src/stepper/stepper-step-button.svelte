<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'onclick'> {
		step: number;
		clickable?: boolean;
		error?: boolean;
		onclick?: (index: number) => void;
		children: Snippet;
	}

	let {
		step,
		clickable = false,
		error = false,
		onclick,
		class: className,
		children,
		...rest
	}: Props = $props();

	const ctx = getStepperCtx();
	let isComplete = $derived(ctx.isStepComplete(step));
	let isActive = $derived(ctx.isStepActive(step));
	let dataState = $derived(
		error ? 'error' : isComplete ? 'complete' : isActive ? 'active' : 'inactive'
	);

	function handleClick() {
		if (onclick) {
			onclick(step);
		}
	}
</script>

<li
	data-part="step"
	data-state={dataState}
	data-orientation={ctx.orientation}
	aria-current={isActive ? 'step' : undefined}
	class={className}
	{...rest}
>
	{#if clickable}
		<Button variant="bare" type="button" aria-label="Go to step {step + 1}" onclick={handleClick}>
			{@render children()}
		</Button>
	{:else}
		{@render children()}
	{/if}
</li>

<style>
	[data-part='step'] {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-stepper-gap, var(--dry-space-2));
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		font-family: var(--dry-font-sans);
		color: var(--dry-color-text-weak);
	}

	[data-part='step']::before {
		content: '';
		display: block;
		aspect-ratio: 1;
		height: var(--dry-stepper-indicator-size, 1.25rem);
		border-radius: 50%;
		border: var(--dry-stepper-connector-width, 1px) solid var(--dry-color-stroke-weak);
		background: var(--dry-color-fill-base, transparent);
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='step'][data-state='active'] {
		color: var(--dry-color-text-brand);
		font-weight: 500;
	}

	[data-part='step'][data-state='active']::before {
		border-color: var(--dry-color-stroke-selected);
		background: var(--dry-color-fill-selected);
	}

	[data-part='step'][data-state='complete'] {
		color: var(--dry-color-text-strong);
	}

	[data-part='step'][data-state='complete']::before {
		border-color: var(--dry-color-text-strong);
		background: var(--dry-color-text-strong);
	}

	[data-part='step'][data-state='error'] {
		color: var(--dry-color-text-error);
	}

	[data-part='step'][data-state='error']::before {
		border-color: var(--dry-color-fill-error);
		background: var(--dry-color-fill-base, transparent);
	}

	[data-orientation='vertical'] {
		padding: var(--dry-space-1) 0;
	}
</style>
