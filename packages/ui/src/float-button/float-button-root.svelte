<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		open?: boolean;
		position?: 'bottom-right' | 'bottom-left';
		children: Snippet;
	}

	let {
		open = $bindable(false),
		children,
		class: className,
		position = 'bottom-right',
		id,
		...rest
	}: Props = $props();

	const generatedId = `dry-fab-${Math.random().toString(36).slice(2, 10)}`;
	const menuId = $derived(id ?? generatedId);

	let rootEl = $state<HTMLDivElement>();

	setFloatButtonCtx({
		get open() {
			return open;
		},
		get menuId() {
			return menuId;
		},
		toggle() {
			open = !open;
		},
		close() {
			open = false;
		}
	});

	function focusFirstAction() {
		rootEl
			?.querySelector<HTMLElement>('[data-float-button-action]:not([aria-hidden="true"])')
			?.focus();
	}

	function focusTrigger() {
		rootEl?.querySelector<HTMLElement>('[data-float-button-trigger]')?.focus();
	}

	$effect(() => {
		if (!open || !rootEl) return;
		const handle = requestAnimationFrame(focusFirstAction);
		const onKey = (e: KeyboardEvent) => {
			if (e.key !== 'Escape') return;
			e.preventDefault();
			open = false;
			requestAnimationFrame(focusTrigger);
		};
		window.addEventListener('keydown', onKey);
		return () => {
			cancelAnimationFrame(handle);
			window.removeEventListener('keydown', onKey);
		};
	});
</script>

<div
	bind:this={rootEl}
	id={menuId}
	data-float-button
	data-position={position}
	data-state={open ? 'open' : 'closed'}
	{...rest}
	class={className}
>
	{@render children()}
</div>

<style>
	[data-float-button] {
		position: var(--dry-fab-position, fixed);
		z-index: var(--dry-fab-z-index, var(--dry-layer-overlay));
		/* Grid stack with the trigger pinned visually last via `order` (set on
		   .trigger-slot) so it sits closest to the anchored corner; DOM order
		   keeps the trigger first for keyboard focus order. */
		display: grid;
		gap: var(--dry-fab-gap, var(--dry-space-3));
	}

	[data-float-button][data-position='bottom-right'] {
		bottom: var(--dry-fab-offset, var(--dry-space-6));
		right: var(--dry-fab-offset, var(--dry-space-6));
		justify-items: end;
	}

	[data-float-button][data-position='bottom-left'] {
		bottom: var(--dry-fab-offset, var(--dry-space-6));
		left: var(--dry-fab-offset, var(--dry-space-6));
		justify-items: start;
	}
</style>
