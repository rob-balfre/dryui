<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTriggerElement } from '../utils/trigger-element.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ctx: { readonly open: boolean; show: () => void };
		children: Snippet;
	}

	let { ctx, children, ...rest }: Props = $props();

	let wrapperEl = $state<HTMLDivElement>();

	$effect(() => {
		const triggerEl = getTriggerElement(wrapperEl);
		if (!triggerEl) return;

		const handleClick = () => ctx.show();
		triggerEl.setAttribute('aria-haspopup', 'dialog');
		triggerEl.setAttribute('aria-expanded', String(ctx.open));
		triggerEl.addEventListener('click', handleClick);

		return () => {
			triggerEl.removeEventListener('click', handleClick);
		};
	});
</script>

<div bind:this={wrapperEl} class="modal-trigger-wrapper" {...rest}>
	{@render children()}
</div>

<style>
	.modal-trigger-wrapper {
		display: contents;
	}
</style>
