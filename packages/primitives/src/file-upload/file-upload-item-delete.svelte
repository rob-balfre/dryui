<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		index: number;
		children?: Snippet | undefined;
	}

	let { index, children, onclick, ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		e.stopPropagation();
		ctx.removeFile(index);
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	type="button"
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	aria-label="Remove file"
	onclick={handleClick}
	{...rest}
>
	{#if children}
		{@render children()}
	{/if}
</button>
