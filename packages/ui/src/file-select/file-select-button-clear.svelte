<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CloseButtonBase from '../internal/close-button-base.svelte';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet | undefined;
	}

	let { children, ...rest }: Props = $props();
	const ctx = getFileSelectCtx();

	const hidden = $derived(!ctx.value || ctx.disabled);
</script>

{#if !hidden}
	<CloseButtonBase
		aria-label="Clear selection"
		disabled={ctx.disabled}
		onclick={ctx.clear}
		{...rest}
	>
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
{/if}
