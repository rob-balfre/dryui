<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();

	let dialogEl = $state<HTMLDialogElement>();

	$effect(() => {
		if (ctx.open && dialogEl && !dialogEl.open) {
			dialogEl.showModal();
		}
		if (!ctx.open && dialogEl?.open) {
			dialogEl.close();
		}
	});
</script>

<dialog
	bind:this={dialogEl}
	data-alert-dialog-content
	role="alertdialog"
	aria-labelledby={ctx.headerId}
	data-state={ctx.open ? 'open' : 'closed'}
	onclose={() => ctx.close()}
	oncancel={(e) => e.preventDefault()}
	class={className}
	{...rest}
>
	{@render children()}
</dialog>

<style>
	[data-alert-dialog-content] {
		--dry-dialog-bg: var(--dry-color-bg-overlay);
		--dry-dialog-border: var(--dry-color-stroke-weak);
		--dry-dialog-radius: var(--dry-radius-xl);
		--dry-dialog-shadow: var(--dry-shadow-overlay);
		--dry-dialog-padding: var(--dry-space-6);
		--dry-dialog-max-width: 32rem;

		border: 1px solid var(--dry-dialog-border);
		border-radius: var(--dry-dialog-radius);
		background: var(--dry-dialog-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-dialog-shadow);
		grid-template-columns: min(var(--dry-dialog-max-width), 90vw);
		margin: auto;
		padding: 0;
		max-height: 85vh;
		display: grid;

		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-normal) var(--dry-ease-spring-snappy);
	}

	[data-alert-dialog-content]:not([open]) {
		display: none;
	}

	[data-alert-dialog-content]::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop-strong));
		backdrop-filter: blur(var(--dry-overlay-blur, 4px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 4px));
	}

	[data-alert-dialog-content][data-state='open'] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-alert-dialog-content][open] {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter)) translateY(var(--dry-motion-distance-sm));
		}
	}
</style>
