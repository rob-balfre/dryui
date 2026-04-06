<script lang="ts">
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		index: number;
		value?: string | undefined;
	}

	let { index, value = '', onclick, ...rest }: Props = $props();

	const ctx = getTagsInputCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (ctx.disabled) return;
		ctx.removeTag(index);
		if (onclick) {
			(onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
		}
	}
</script>

<button
	type="button"
	aria-label="Remove tag: {value}"
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	onclick={handleClick}
	{...rest}
></button>
