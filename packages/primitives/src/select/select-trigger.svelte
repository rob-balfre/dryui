<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';
	import { getTriggerElement, setOptionalAttribute } from '../utils/trigger-element.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getSelectCtx();

	let wrapperEl = $state<HTMLDivElement>();

	function setDisabledState(triggerEl: HTMLElement, disabled: boolean) {
		setOptionalAttribute(triggerEl, 'aria-disabled', disabled ? 'true' : undefined);

		if (
			triggerEl instanceof HTMLButtonElement ||
			triggerEl instanceof HTMLInputElement ||
			triggerEl instanceof HTMLSelectElement ||
			triggerEl instanceof HTMLTextAreaElement
		) {
			triggerEl.disabled = disabled;
		}

		if (disabled) {
			triggerEl.setAttribute('data-disabled', '');
		} else {
			triggerEl.removeAttribute('data-disabled');
		}
	}

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		ctx.triggerEl = triggerEl;
		triggerEl.id = ctx.triggerId;
		triggerEl.setAttribute('popovertarget', ctx.contentId);
		triggerEl.setAttribute('aria-haspopup', 'listbox');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		setOptionalAttribute(triggerEl, 'aria-controls', ctx.contentId);
		triggerEl.setAttribute('data-state', ctx.open ? 'open' : 'closed');
		setDisabledState(triggerEl, ctx.disabled);

		return () => {
			if (ctx.triggerEl === triggerEl) {
				ctx.triggerEl = null;
			}
		};
	});
</script>

<div bind:this={wrapperEl} class="trigger-wrap" {...rest}>
	{@render children()}
</div>

<style>
	.trigger-wrap {
		display: contents;
	}
</style>
