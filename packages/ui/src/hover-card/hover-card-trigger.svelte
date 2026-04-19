<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { Button } from '../button/index.js';
	import { getHoverCardCtx } from './context.svelte.js';

	interface Props
		extends
			Omit<HTMLAnchorAttributes, 'children' | 'href'>,
			Omit<HTMLButtonAttributes, 'children'> {
		href?: string;
		children: Snippet;
	}

	let { href, class: className, children, ...rest }: Props = $props();

	const ctx = getHoverCardCtx();

	let triggerEl = $state<HTMLAnchorElement | HTMLButtonElement>();

	$effect(() => {
		if (triggerEl) {
			ctx.triggerEl = triggerEl;

			return () => {
				if (ctx.triggerEl === triggerEl) {
					ctx.triggerEl = null;
				}
			};
		}
	});

	function handlePointerEnter() {
		ctx.triggerHovered = true;
		ctx.show();
	}

	function handlePointerLeave() {
		ctx.triggerHovered = false;
		ctx.close();
	}

	function handleFocusIn() {
		ctx.triggerFocused = true;

		if (ctx.ignoreNextTriggerFocusOpen) {
			ctx.ignoreNextTriggerFocusOpen = false;
			return;
		}

		ctx.showImmediate();
	}

	function handleFocusOut() {
		ctx.triggerFocused = false;
		ctx.close();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape' && ctx.open) {
			event.preventDefault();
			ctx.forceClose();
			triggerEl?.focus();
		}
	}

	function handleRef(el: HTMLButtonElement | HTMLAnchorElement | null) {
		triggerEl = el ?? undefined;
	}
</script>

<span class={className} data-hover-card-trigger-shell>
	<Button
		ref={handleRef}
		variant="link"
		size="sm"
		color="primary"
		id={ctx.triggerId}
		{href}
		data-hover-card-trigger
		aria-haspopup="dialog"
		aria-controls={ctx.contentId}
		aria-expanded={ctx.open}
		data-state={ctx.open ? 'open' : 'closed'}
		onpointerenter={handlePointerEnter}
		onpointerleave={handlePointerLeave}
		onfocusin={handleFocusIn}
		onfocusout={handleFocusOut}
		onkeydown={handleKeydown}
		{...rest}
	>
		{@render children()}
	</Button>
</span>

<style>
	[data-hover-card-trigger-shell] {
		--dry-btn-min-height: auto;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-font-size: inherit;
		--dry-btn-radius: var(--dry-radius-sm);
		display: inline-grid;
		cursor: help;
	}

	[data-hover-card-trigger-shell]:focus-within {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: 3px;
		border-radius: var(--dry-radius-sm);
	}
</style>
