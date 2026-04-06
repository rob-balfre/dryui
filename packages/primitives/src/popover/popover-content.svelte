<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '../utils/anchor-position.svelte.js';
	import { getPopoverCtx } from './context.svelte.js';
	import { createPositionedPopover } from '../utils/positioned-popover.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getPopoverCtx();

	let contentEl = $state<HTMLDivElement>();

	const popover = createPositionedPopover({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (!contentEl) return;
		if (ctx.open) {
			popover.showPopover(contentEl);
		} else {
			popover.hidePopover(contentEl);
		}
	});

	$effect(() => {
		if (!ctx.open) return;

		function handlePointerDown(event: PointerEvent) {
			const target = event.target as Node;
			if (contentEl?.contains(target) || ctx.triggerEl?.contains(target)) {
				return;
			}

			ctx.close();
		}

		function handleKeydown(event: KeyboardEvent) {
			if (event.key !== 'Escape') {
				return;
			}

			event.preventDefault();
			ctx.close();
			ctx.triggerEl?.focus();
		}

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeydown, true);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeydown, true);
		};
	});
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	popover="manual"
	data-state={ctx.open ? 'open' : 'closed'}
	use:popover.applyPosition={style}
	{...rest}
>
	{@render children()}
</div>
