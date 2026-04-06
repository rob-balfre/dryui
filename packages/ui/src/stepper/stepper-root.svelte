<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setStepperCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		activeStep?: number;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		activeStep = $bindable(0),
		orientation = 'horizontal',
		class: className,
		children,
		...rest
	}: Props = $props();

	setStepperCtx({
		get activeStep() {
			return activeStep;
		},
		get orientation() {
			return orientation;
		},
		isStepComplete(index: number) {
			return index < activeStep;
		},
		isStepActive(index: number) {
			return index === activeStep;
		}
	});
</script>

<div
	role="group"
	aria-label="Progress"
	data-part="root"
	data-orientation={orientation}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		--dry-stepper-connector-width: 1px;
	}
</style>
