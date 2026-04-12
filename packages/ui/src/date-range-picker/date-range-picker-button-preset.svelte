<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getDateRangePickerCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		startDate: Date;
		endDate: Date;
		children: Snippet;
	}

	let { startDate, endDate, children, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();

	function handleClick() {
		ctx.selectDate(startDate);
		ctx.selectDate(endDate);
	}
</script>

<Button variant="pill" size="sm" type="button" {...rest} onclick={handleClick}>
	{@render children()}
</Button>
