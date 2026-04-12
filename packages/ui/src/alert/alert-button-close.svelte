<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CloseButtonBase from '../internal/close-button-base.svelte';
	import { getAlertCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAlertCtx();
</script>

<span class="alert-close-slot">
	<CloseButtonBase aria-label="Dismiss alert" {...rest} onclick={() => ctx.dismiss()}>
		{#if children}{@render children()}{/if}
	</CloseButtonBase>
</span>

<style>
	.alert-close-slot {
		display: inline-grid;
		grid-column: -2 / -1;
		grid-row: 1 / 3;
		align-self: start;
	}
</style>
