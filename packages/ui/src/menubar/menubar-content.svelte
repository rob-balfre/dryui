<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createAnchoredPopover, createMenuNavigation } from '@dryui/primitives';
	import { getMenubarCtx, getMenubarMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: 'bottom' | 'bottom-start' | 'bottom-end';
		offset?: number;
		children: Snippet;
	}

	let {
		class: className,
		placement = 'bottom-start',
		offset = 4,
		children,
		style,
		...rest
	}: Props = $props();

	const ctx = getMenubarCtx();
	const menuCtx = getMenubarMenuCtx();

	let el = $state<HTMLDivElement>();
	let triggerEl = $state<HTMLElement | null>(null);

	$effect(() => {
		const root = ctx.rootElement;
		triggerEl =
			root?.querySelector<HTMLElement>(`[data-menubar-trigger="${menuCtx.menuId}"]`) ?? null;
	});

	const popover = createAnchoredPopover({
		triggerEl: () => triggerEl,
		contentEl: () => el ?? null,
		open: () => menuCtx.open,
		placement: () => placement,
		offset: () => offset,
		onAfterShow: (contentEl) => {
			requestAnimationFrame(() => {
				const focusable = contentEl.querySelector<HTMLElement>(
					'[role="menuitem"]:not([data-disabled])'
				);
				if (focusable) {
					focusable.focus();
				} else {
					contentEl.focus();
				}
			});
		}
	});

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});

	function handleKeydown(e: KeyboardEvent) {
		if (!el) return;
		switch (e.key) {
			case 'ArrowRight': {
				e.preventDefault();
				ctx.focusNextMenu(menuCtx.menuId);
				return;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				ctx.focusPrevMenu(menuCtx.menuId);
				return;
			}
			case 'Escape': {
				e.preventDefault();
				ctx.closeMenu();
				const trigger = ctx.rootElement?.querySelector<HTMLButtonElement>(
					`[data-menubar-trigger="${menuCtx.menuId}"]`
				);
				trigger?.focus();
				return;
			}
		}
		menu.handleKeydown(e);
	}
</script>

<div
	bind:this={el}
	popover="auto"
	role="menu"
	tabindex="-1"
	aria-labelledby={`menubar-trigger-${menuCtx.menuId}`}
	data-menubar-content
	data-state={menuCtx.open ? 'open' : 'closed'}
	class={className}
	use:popover.applyPosition={style}
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (!newState && menuCtx.open) {
			ctx.closeMenu();
		}
	}}
	onkeydown={handleKeydown}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-menubar-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		background: var(--dry-color-bg-overlay);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		box-shadow: var(--dry-shadow-overlay);
		padding: var(--dry-space-1);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-menubar-content]:popover-open {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-menubar-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
