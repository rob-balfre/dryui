<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDialogCtx();

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
	data-dialog-content
	aria-labelledby={ctx.headerId}
	data-state={ctx.open ? 'open' : 'closed'}
	onclose={() => ctx.close()}
	onclick={(e) => {
		if (e.target === dialogEl) {
			ctx.close();
		}
	}}
	class={className}
	{...rest}
>
	<div data-dialog-panel>
		{@render children()}
	</div>
</dialog>

<style>
	[data-dialog-content] {
		position: fixed;
		inset: 0;
		height: 100vh;
		height: 100dvh;
		max-height: none;
		border: none;
		background: transparent;
		color: var(--dry-color-text-strong);
		padding: 0;
		display: grid;
		grid-template-columns: min(90vw, var(--dry-dialog-max-width, 32rem));
		place-content: center;
		place-items: center;
		overflow: visible;
	}

	[data-dialog-content]:not([open]) {
		display: none;
	}

	[data-dialog-content]::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop));
		backdrop-filter: blur(var(--dry-overlay-blur, 12px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 12px));
	}

	[data-dialog-panel] {
		--dry-dialog-border: var(--dry-overlay-border, var(--dry-color-stroke-weak));
		--dry-dialog-padding: var(--dry-space-8);
		--dry-radius-nested: max(
			0px,
			calc(
				var(--dry-dialog-radius, var(--dry-overlay-radius, var(--dry-radius-2xl))) -
					var(--dry-dialog-padding)
			)
		);

		container-type: inline-size;
		justify-self: stretch;
		border: 1px solid var(--dry-dialog-border);
		border-radius: var(--dry-dialog-radius, var(--dry-overlay-radius, var(--dry-radius-2xl)));
		background: var(--dry-dialog-bg, var(--dry-overlay-bg, var(--dry-color-bg-overlay)));
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-dialog-shadow, var(--dry-overlay-shadow, var(--dry-shadow-overlay)));
		padding: 0;
		max-block-size: var(--dry-dialog-max-block-size, 85vh);
		display: grid;
		overflow: var(--dry-dialog-overflow, auto);

		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-normal) var(--dry-ease-spring-snappy);
	}

	[data-dialog-content][data-state='open'] [data-dialog-panel] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-dialog-content][open] [data-dialog-panel] {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter)) translateY(var(--dry-motion-distance-sm));
		}
	}
</style>
