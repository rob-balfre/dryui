<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDrawerCtx();

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
	data-drawer-content
	data-side={ctx.side}
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
	<div data-drawer-panel>
		{@render children()}
	</div>
</dialog>

<style>
	[data-drawer-content] {
		all: unset;
		position: fixed;
		inset: 0;
		height: 100vh;
		height: 100dvh;
		max-height: none;
		border: none;
		background: transparent;
		color: var(--dry-color-text-strong);
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}

	[data-drawer-content]:not([open]) {
		display: none;
	}

	[data-drawer-content]::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop-strong));
		backdrop-filter: blur(var(--dry-overlay-blur, 8px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 8px));
	}

	/* Side positioning via grid alignment */
	[data-drawer-content][data-side='right'] {
		grid-template-columns:
			minmax(0, calc(100dvw - var(--dry-drawer-size, 25rem)))
			var(--dry-drawer-size, 25rem);
	}

	[data-drawer-content][data-side='left'] {
		grid-template-columns:
			var(--dry-drawer-size, 25rem)
			minmax(0, calc(100dvw - var(--dry-drawer-size, 25rem)));
	}

	[data-drawer-content][data-side='top'] {
		grid-template-rows:
			var(--dry-drawer-size, 25rem)
			minmax(0, calc(100dvh - var(--dry-drawer-size, 25rem)));
	}

	[data-drawer-content][data-side='bottom'] {
		grid-template-rows:
			minmax(0, calc(100dvh - var(--dry-drawer-size, 25rem)))
			var(--dry-drawer-size, 25rem);
	}

	/* Panel */
	[data-drawer-panel] {
		--dry-drawer-bg: var(--dry-color-bg-overlay);
		--dry-drawer-border: var(--dry-color-stroke-weak);
		--dry-drawer-size: 25rem;

		background: var(--dry-drawer-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-drawer-shadow, var(--dry-shadow-overlay));
		padding: 0;
		display: grid;
		grid-template-rows: max-content minmax(0, 1fr) max-content;
		overflow: hidden;

		transition:
			transform var(--dry-duration-slow) var(--dry-ease-spring-snappy),
			opacity var(--dry-duration-normal) var(--dry-ease-out);
	}

	[data-drawer-content][data-side='right'] [data-drawer-panel] {
		grid-column: 2;
		height: 100%;
		border-left: 1px solid var(--dry-drawer-border);
	}

	[data-drawer-content][data-side='left'] [data-drawer-panel] {
		grid-column: 1;
		height: 100%;
		border-right: 1px solid var(--dry-drawer-border);
	}

	[data-drawer-content][data-side='top'] [data-drawer-panel] {
		grid-row: 1;
		height: var(--dry-drawer-size);
		border-bottom: 1px solid var(--dry-drawer-border);
	}

	[data-drawer-content][data-side='bottom'] [data-drawer-panel] {
		grid-row: 2;
		height: var(--dry-drawer-size);
		border-top: 1px solid var(--dry-drawer-border);
	}

	@starting-style {
		[data-drawer-content][data-side='right'][open] [data-drawer-panel] {
			opacity: 0;
			transform: translateX(100%);
		}
		[data-drawer-content][data-side='left'][open] [data-drawer-panel] {
			opacity: 0;
			transform: translateX(-100%);
		}
		[data-drawer-content][data-side='top'][open] [data-drawer-panel] {
			opacity: 0;
			transform: translateY(-100%);
		}
		[data-drawer-content][data-side='bottom'][open] [data-drawer-panel] {
			opacity: 0;
			transform: translateY(100%);
		}
	}

	[data-drawer-content][data-state='open'] [data-drawer-panel] {
		opacity: 1;
		transform: translate(0);
	}
</style>
