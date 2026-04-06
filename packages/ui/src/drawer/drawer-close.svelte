<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import CloseButtonBase from '../internal/close-button-base.svelte';
	import { getDrawerCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<CloseButtonBase onclick={() => ctx.close()} class={className} {...rest}>
	{@render children()}
</CloseButtonBase>
