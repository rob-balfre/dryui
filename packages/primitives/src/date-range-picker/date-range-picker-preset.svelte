<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		startDate: Date;
		endDate: Date;
		children: Snippet;
	}

	let { startDate, endDate, children, class: className, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	function handleClick() {
		// Directly set the range and close — bypass the two-click flow
		ctx.selectDate(startDate);
		ctx.selectDate(endDate);
	}
</script>

<button type="button" class={className} onclick={handleClick} {...rest}>
	{@render children()}
</button>
