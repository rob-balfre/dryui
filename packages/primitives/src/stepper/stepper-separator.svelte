<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		step: number;
	}

	let { step, ...rest }: Props = $props();

	const ctx = getStepperCtx();
	let isComplete = $derived(ctx.isStepComplete(step));
</script>

<div
	role="presentation"
	aria-hidden="true"
	data-state={isComplete ? 'complete' : 'inactive'}
	{...rest}
></div>
