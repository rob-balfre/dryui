<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { createDismiss, createMenuNavigation } from '@dryui/primitives';
	import { getContextMenuCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { class: className, children, style, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();

	let el = $state<HTMLDivElement>();

	const menu = createMenuNavigation({
		container: () => el ?? null,
		orientation: 'vertical'
	});

	$effect(() => {
		if (ctx.open && el) {
			el.style.position = 'fixed';
			el.style.left = `${ctx.position.x}px`;
			el.style.top = `${ctx.position.y}px`;
			if (!el.matches(':popover-open')) {
				el.showPopover();
				menu.focusFirst();
			}
		} else if (!ctx.open && el?.matches(':popover-open')) {
			el.hidePopover();
		}
	});

	createDismiss({
		enabled: () => ctx.open,
		onDismiss: () => ctx.close(),
		contentEl: () => el ?? null,
		preventDefaultOnEscape: true
	});
</script>

<div
	bind:this={el}
	popover="manual"
	role="menu"
	tabindex="-1"
	id={ctx.contentId}
	aria-labelledby={ctx.triggerId}
	data-context-menu-content
	data-state={ctx.open ? 'open' : 'closed'}
	class={className}
	{style}
	onkeydown={(e) => menu.handleKeydown(e)}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-context-menu-content] {
		/* Reset UA popover defaults */
		inset: unset;
		margin: 0;

		--dry-menu-bg: var(--dry-color-bg-overlay);
		--dry-menu-border: var(--dry-color-stroke-weak);
		--dry-menu-radius: var(--dry-radius-lg);
		--dry-menu-shadow: var(--dry-shadow-lg);
		--dry-menu-padding: var(--dry-space-1);

		display: grid;
		grid-template-columns: minmax(12rem, max-content);
		background: var(--dry-menu-bg);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-menu-border);
		border-radius: var(--dry-menu-radius);
		box-shadow: var(--dry-menu-shadow);
		padding: var(--dry-menu-padding);

		transition:
			opacity var(--dry-duration-fast) var(--dry-ease-emphasized),
			transform var(--dry-duration-fast) var(--dry-ease-emphasized);
	}

	[data-context-menu-content]:not(:popover-open) {
		display: none;
	}

	[data-context-menu-content]:popover-open {
		display: grid;
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-context-menu-content]:popover-open {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter))
				translateY(calc(var(--dry-motion-distance-xs) * -1));
		}
	}
</style>
