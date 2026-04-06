<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getAlertCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		children?: Snippet | undefined;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAlertCtx();
</script>

<button type="button" aria-label="Dismiss alert" onclick={() => ctx.dismiss()} {...rest}>
	{#if children}
		{@render children()}
	{:else}
		<span aria-hidden="true">&times;</span>
	{/if}
</button>
