<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CloseButtonBase from '../internal/close-button-base.svelte';
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

<CloseButtonBase aria-label="Remove file" disabled={ctx.disabled} {...rest} onclick={handleClick}>
	{#if children}
		{@render children()}
	{:else}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg
		>
	{/if}
</CloseButtonBase>
