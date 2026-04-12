<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { toastStore } from '@dryui/primitives';
	import CloseButtonBase from '../internal/close-button-base.svelte';
	import { getToastCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getToastCtx();
</script>

<CloseButtonBase
	aria-label="Close notification"
	{...rest}
	onclick={() => toastStore.remove(ctx.id)}
>
	{@render children()}
</CloseButtonBase>
