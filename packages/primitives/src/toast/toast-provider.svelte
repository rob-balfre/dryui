<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { tryShowPopover, tryHidePopover } from '../utils/popover-toggle.js';
	import { toastStore } from './toast-store.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		position?:
			| 'top-right'
			| 'top-left'
			| 'bottom-right'
			| 'bottom-left'
			| 'top-center'
			| 'bottom-center';
		children?: Snippet;
	}

	let { position = 'bottom-right', children, ...rest }: Props = $props();

	let popoverEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!popoverEl) return;
		if (toastStore.toasts.length > 0) tryShowPopover(popoverEl);
		else tryHidePopover(popoverEl);
	});
</script>

<div
	bind:this={popoverEl}
	popover="manual"
	role="region"
	aria-label="Notifications"
	data-position={position}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		{#each toastStore.toasts as toast (toast.id)}
			<div data-toast-id={toast.id} data-variant={toast.variant}>
				{#if toast.title}
					<p>{toast.title}</p>
				{/if}
				{#if toast.description}
					<p>{toast.description}</p>
				{/if}
			</div>
		{/each}
	{/if}
</div>
