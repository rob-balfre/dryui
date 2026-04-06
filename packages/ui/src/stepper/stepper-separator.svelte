<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStepperCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		step: number;
	}

	let { step, class: className, ...rest }: Props = $props();

	const ctx = getStepperCtx();
	let isComplete = $derived(ctx.isStepComplete(step));
</script>

<div
	role="presentation"
	aria-hidden="true"
	data-part="separator"
	data-state={isComplete ? 'complete' : 'inactive'}
	data-orientation={ctx.orientation}
	class={className}
	{...rest}
></div>

<style>
	[data-part='separator'] {
		display: grid;
		grid-template-columns: minmax(var(--dry-space-6), 1fr);
		height: var(--dry-stepper-connector-width, 1px);
		background: var(--dry-color-stroke-weak);
		margin: 0 var(--dry-space-2);
		transition: background var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-part='separator'][data-state='complete'] {
		background: var(--dry-color-stroke-selected);
	}

	[data-orientation='vertical'] {
		grid-template-columns: var(--dry-stepper-connector-width, 1px);
		height: var(--dry-space-6);
		margin: 0;
		margin-left: calc(var(--dry-stepper-indicator-size, 1.25rem) / 2);
	}
</style>
