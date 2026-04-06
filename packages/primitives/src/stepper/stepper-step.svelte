<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLLIElement>, 'onclick'> {
		step: number;
		clickable?: boolean;
		error?: boolean;
		onclick?: (index: number) => void;
		children: Snippet;
	}

	let { step, clickable = false, error = false, onclick, children, ...rest }: Props = $props();

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

<li data-state={dataState} aria-current={isActive ? 'step' : undefined} {...rest}>
	{#if clickable}
		<button
			type="button"
			data-part="indicator-button"
			onclick={handleClick}
			aria-label="Go to step {step + 1}"
		>
			{@render children()}
		</button>
	{:else}
		{@render children()}
	{/if}
</li>
