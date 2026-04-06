<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getLinkPreviewCtx } from './context.svelte.js';
	import { useAnchorStyles } from '../utils/use-anchor-styles.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?:
			| 'top'
			| 'top-start'
			| 'top-end'
			| 'bottom'
			| 'bottom-start'
			| 'bottom-end'
			| 'left'
			| 'left-start'
			| 'left-end'
			| 'right'
			| 'right-start'
			| 'right-end';
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getLinkPreviewCtx();

	let contentEl = $state<HTMLDivElement>();

	const anchor = useAnchorStyles({
		triggerEl: () => ctx.triggerEl,
		contentEl: () => contentEl ?? null,
		placement: () => placement,
		offset: () => offset
	});

	$effect(() => {
		if (!contentEl) return;

		if (ctx.open) {
			try {
				if (!contentEl.matches(':popover-open')) {
					contentEl.showPopover();
				}
			} catch {
				// Already shown
			}
		} else {
			try {
				if (contentEl.matches(':popover-open')) {
					contentEl.hidePopover();
				}
			} catch {
				// Already hidden
			}
		}
	});
</script>

<div
	bind:this={contentEl}
	id={ctx.contentId}
	role="tooltip"
	popover="manual"
	data-state={ctx.open ? 'open' : 'closed'}
	use:anchor.applyPosition={style}
	onmouseenter={() => ctx.showImmediate()}
	onmouseleave={() => ctx.close()}
	{...rest}
>
	{@render children()}
</div>
