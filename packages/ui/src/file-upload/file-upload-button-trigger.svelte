<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFileUploadCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, onclick, size = 'md', ...rest }: Props = $props();

	const ctx = getFileUploadCtx();

	function handleClick(e: MouseEvent & { currentTarget: HTMLButtonElement }) {
		if (!ctx.disabled) ctx.openFileDialog();
		if (onclick) (onclick as (e: MouseEvent & { currentTarget: HTMLButtonElement }) => void)(e);
	}
</script>

<Button
	variant="solid"
	type="button"
	{size}
	disabled={ctx.disabled}
	onclick={handleClick}
	{...rest}
>
	{@render children()}
</Button>
