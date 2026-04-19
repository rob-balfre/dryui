<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';
	import { getHoverCardCtx } from './context.svelte.js';

	interface Props
		extends
			Omit<HTMLAnchorAttributes, 'children' | 'href'>,
			Omit<HTMLButtonAttributes, 'children'> {
		href?: string;
		children: Snippet;
	}

	let { href, children, ...rest }: Props = $props();

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
</script>

{#if href}
	<a
		bind:this={triggerEl}
		id={ctx.triggerId}
		{href}
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
	</a>
{:else}
	<button
		bind:this={triggerEl}
		id={ctx.triggerId}
		type="button"
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
	</button>
{/if}
