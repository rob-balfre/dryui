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

<span data-part="toast-close">
	<CloseButtonBase
		aria-label="Close notification"
		{...rest}
		onclick={() => toastStore.remove(ctx.id)}
	>
		{@render children()}
	</CloseButtonBase>
</span>

<style>
	[data-part='toast-close'] {
		position: absolute;
		top: var(--dry-space-3);
		right: var(--dry-space-3);
		display: inline-grid;
		--dry-btn-font-size: var(--dry-type-heading-3-size, var(--dry-text-xl-size));
	}
</style>
