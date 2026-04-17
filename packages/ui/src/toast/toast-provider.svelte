<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { toastStore } from '@dryui/primitives';
	import ToastRoot from './toast-root.svelte';
	import ToastTitle from './toast-title.svelte';
	import ToastDescription from './toast-description.svelte';
	import ToastClose from './toast-close-button.svelte';

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

	let { class: className, position = 'bottom-right', children, ...rest }: Props = $props();
	const visible = $derived(Boolean(children) || toastStore.toasts.length > 0);

	let panelEl = $state<HTMLDivElement>();

	$effect(() => {
		if (!panelEl) return;
		if (visible) {
			try {
				if (!panelEl.matches(':popover-open')) panelEl.showPopover();
			} catch {
				// already open
			}
		} else {
			try {
				if (panelEl.matches(':popover-open')) panelEl.hidePopover();
			} catch {
				// already closed
			}
		}
	});
</script>

<div
	bind:this={panelEl}
	popover="manual"
	role="region"
	aria-label="Notifications"
	data-part="provider"
	data-position={position}
	class={className}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		{#each toastStore.toasts as toast (toast.id)}
			<ToastRoot id={toast.id} variant={toast.variant} persistent={toast.persistent}>
				<div data-part="content">
					{#if toast.title}
						<ToastTitle>{toast.title}</ToastTitle>
					{/if}
					{#if toast.description}
						<ToastDescription>{toast.description}</ToastDescription>
					{/if}
				</div>
				<ToastClose>
					<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
						<path
							d="M12 4L4 12M4 4l8 8"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</ToastClose>
			</ToastRoot>
		{/each}
	{/if}
</div>

<style>
	[data-part='provider'] {
		position: fixed;
		z-index: var(--dry-layer-overlay);
		display: grid;
		grid-template-columns: minmax(0, min(420px, calc(100vw - var(--dry-space-8))));
		gap: var(--dry-space-3);
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		color: inherit;
		overflow: visible;
		container-type: inline-size;

		&[data-position='top-right'] {
			inset: var(--dry-space-4) var(--dry-space-4) auto auto;
		}

		&[data-position='top-left'] {
			inset: var(--dry-space-4) auto auto var(--dry-space-4);
		}

		&[data-position='bottom-right'] {
			inset: auto var(--dry-space-4) var(--dry-space-4) auto;
		}

		&[data-position='bottom-left'] {
			inset: auto auto var(--dry-space-4) var(--dry-space-4);
		}

		&[data-position='top-center'] {
			inset: var(--dry-space-4) auto auto 50%;
			transform: translateX(-50%);
		}

		&[data-position='bottom-center'] {
			inset: auto auto var(--dry-space-4) 50%;
			transform: translateX(-50%);
		}
	}

	[data-part='content'] {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--dry-space-1);
	}
</style>
