<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, onclick, ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (!ctx.disabled) ctx.openFileDialog();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<button
	type="button"
	disabled={ctx.disabled}
	data-disabled={ctx.disabled || undefined}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</button>
