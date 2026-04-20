<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';

	type ModalSide = 'center' | 'top' | 'right' | 'bottom' | 'left';
	type ModalVariant = 'dialog' | 'drawer' | 'alert-dialog';

	interface Props extends HTMLDialogAttributes {
		ctx: { readonly open: boolean; readonly headerId: string; close: () => void };
		/** Presentational variant; drives the scoped style block. */
		variant: ModalVariant;
		/**
		 * Positioning hint. `center` stacks the panel in the middle;
		 * `top`/`right`/`bottom`/`left` pin it to an edge (drawer-style).
		 */
		side?: ModalSide;
		/** When false, clicking the dialog backdrop does not dismiss. */
		dismissOnBackdropClick?: boolean;
		/** When false, pressing Escape does not dismiss. */
		dismissOnEscape?: boolean;
		children: Snippet;
	}

	let {
		ctx,
		variant,
		side = 'center',
		dismissOnBackdropClick = true,
		dismissOnEscape = true,
		class: className,
		children,
		...rest
	}: Props = $props();

	let dialogEl = $state<HTMLDialogElement>();

	$effect(() => {
		if (!dialogEl) return;

		if (side !== 'center') {
			// Native <dialog> applies a max-width that leaves a strip beside edge drawers.
			dialogEl.style.setProperty('max-width', 'none');
		}

		if (ctx.open && !dialogEl.open) {
			dialogEl.showModal();
		}
		if (!ctx.open && dialogEl.open) {
			dialogEl.close();
		}
	});
</script>

<dialog
	bind:this={dialogEl}
	data-modal-content
	data-variant={variant}
	data-side={side}
	data-dialog-content={variant === 'dialog' ? '' : undefined}
	data-drawer-content={variant === 'drawer' ? '' : undefined}
	data-alert-dialog-content={variant === 'alert-dialog' ? '' : undefined}
	aria-labelledby={ctx.headerId || undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	onclose={() => ctx.close()}
	oncancel={dismissOnEscape ? undefined : (e) => e.preventDefault()}
	onclick={dismissOnBackdropClick
		? (e) => {
				if (e.target === dialogEl) {
					ctx.close();
				}
			}
		: undefined}
	class={className}
	{...rest}
>
	<div
		data-modal-panel
		data-variant={variant}
		data-side={side}
		data-dialog-panel={variant === 'dialog' ? '' : undefined}
		data-drawer-panel={variant === 'drawer' ? '' : undefined}
		data-alert-dialog-panel={variant === 'alert-dialog' ? '' : undefined}
	>
		{@render children()}
	</div>
</dialog>

<style>
	[data-modal-content] {
		position: fixed;
		inset: 0;
		height: 100vh;
		height: 100dvh;
		max-height: none;
		border: none;
		background: transparent;
		color: var(--dry-color-text-strong);
		padding: 0;
	}

	[data-modal-content][data-variant]:not([open]) {
		display: none;
	}

	/* ---------- Dialog (center) ---------- */

	[data-modal-content][data-variant='dialog'] {
		/* dryui-allow width */
		width: 100vw;
		/* dryui-allow width */
		max-width: none;
		display: grid;
		grid-template-columns: min(90vw, var(--dry-dialog-max-width, 32rem));
		place-content: center;
		place-items: center;
		overflow: visible;
	}

	[data-modal-content][data-variant='dialog']::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop));
		backdrop-filter: blur(var(--dry-overlay-blur, 12px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 12px));
	}

	[data-modal-panel][data-variant='dialog'] {
		--dry-dialog-border: var(--dry-overlay-border, var(--dry-color-stroke-weak));
		--dry-dialog-padding: var(--dry-space-8);
		--dry-radius-nested: max(
			0px,
			calc(
				var(--dry-dialog-radius, var(--dry-overlay-radius, var(--dry-radius-2xl))) -
					var(--dry-dialog-padding)
			)
		);
		--dry-btn-radius: var(--dry-radius-nested);

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

	[data-modal-content][data-variant='dialog'][data-state='closed'] [data-modal-panel] {
		transition-duration: var(--dry-duration-fast);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-modal-content][data-variant='dialog'][data-state='open'] [data-modal-panel] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-modal-content][data-variant='dialog'][open] [data-modal-panel] {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter)) translateY(var(--dry-motion-distance-sm));
		}
	}

	/* ---------- AlertDialog (center) ---------- */

	[data-modal-content][data-variant='alert-dialog'] {
		/* dryui-allow width */
		width: 100vw;
		/* dryui-allow width */
		max-width: none;
		display: grid;
		grid-template-columns: min(90vw, var(--dry-dialog-max-width, 32rem));
		place-content: center;
		place-items: center;
		overflow: visible;
	}

	[data-modal-content][data-variant='alert-dialog']::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop-strong));
		backdrop-filter: blur(var(--dry-overlay-blur, 4px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 4px));
	}

	[data-modal-panel][data-variant='alert-dialog'] {
		--dry-dialog-bg: var(--dry-color-bg-overlay);
		--dry-dialog-border: var(--dry-color-stroke-weak);
		--dry-dialog-radius: var(--dry-radius-xl);
		--dry-dialog-shadow: var(--dry-shadow-overlay);
		--dry-dialog-padding: var(--dry-space-6);
		--dry-dialog-max-width: 32rem;
		--dry-radius-nested: max(0px, calc(var(--dry-dialog-radius) - var(--dry-dialog-padding)));
		--dry-btn-radius: var(--dry-radius-nested);

		container-type: inline-size;
		justify-self: stretch;
		border: 1px solid var(--dry-dialog-border);
		border-radius: var(--dry-dialog-radius);
		background: var(--dry-dialog-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-dialog-shadow);
		padding: 0;
		max-block-size: 85vh;
		display: grid;
		grid-template-rows: max-content minmax(0, 1fr) max-content;
		overflow: hidden;

		transition:
			opacity var(--dry-duration-normal) var(--dry-ease-spring-snappy),
			transform var(--dry-duration-normal) var(--dry-ease-spring-snappy);
	}

	[data-modal-content][data-variant='alert-dialog'][data-state='closed'] [data-modal-panel] {
		transition-duration: var(--dry-duration-fast);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-modal-content][data-variant='alert-dialog'][data-state='open'] [data-modal-panel] {
		opacity: 1;
		transform: scale(1) translateY(0);
	}

	@starting-style {
		[data-modal-content][data-variant='alert-dialog'][open] [data-modal-panel] {
			opacity: 0;
			transform: scale(var(--dry-motion-scale-enter)) translateY(var(--dry-motion-distance-sm));
		}
	}

	/* ---------- Drawer (edge-pinned) ---------- */

	[data-modal-content][data-variant='drawer'] {
		margin: 0;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: minmax(0, 1fr);
	}

	[data-modal-content][data-variant='drawer']::backdrop {
		background: var(--dry-overlay-bg, var(--dry-color-overlay-backdrop-strong));
		backdrop-filter: blur(var(--dry-overlay-blur, 8px));
		-webkit-backdrop-filter: blur(var(--dry-overlay-blur, 8px));
	}

	[data-modal-content][data-variant='drawer'][data-side='right'] {
		grid-template-columns:
			minmax(0, calc(100dvw - var(--dry-drawer-size, 25rem)))
			var(--dry-drawer-size, 25rem);
	}

	[data-modal-content][data-variant='drawer'][data-side='left'] {
		grid-template-columns:
			var(--dry-drawer-size, 25rem)
			minmax(0, calc(100dvw - var(--dry-drawer-size, 25rem)));
	}

	[data-modal-content][data-variant='drawer'][data-side='top'] {
		grid-template-rows:
			var(--dry-drawer-size, 25rem)
			minmax(0, calc(100dvh - var(--dry-drawer-size, 25rem)));
	}

	[data-modal-content][data-variant='drawer'][data-side='bottom'] {
		grid-template-rows:
			minmax(0, calc(100dvh - var(--dry-drawer-size, 25rem)))
			var(--dry-drawer-size, 25rem);
	}

	[data-modal-panel][data-variant='drawer'] {
		--dry-drawer-bg: var(--dry-color-bg-overlay);
		--dry-drawer-border: var(--dry-color-stroke-weak);
		--dry-drawer-size: 25rem;
		--_drawer-rest-transform: translateX(0);
		--_drawer-enter-transform: translateX(100%);

		background: var(--dry-drawer-bg);
		color: var(--dry-color-text-strong);
		box-shadow: var(--dry-drawer-shadow, var(--dry-shadow-overlay));
		padding: 0;
		display: grid;
		grid-template-rows: max-content minmax(0, 1fr) max-content;
		overflow: hidden;
		opacity: 1;
		transform: var(--_drawer-rest-transform);
		will-change: transform, opacity;

		transition:
			transform var(--dry-duration-slow) var(--dry-ease-spring-snappy),
			opacity var(--dry-duration-normal) var(--dry-ease-out);
	}

	[data-modal-content][data-variant='drawer'][data-state='closed'] [data-modal-panel] {
		transition-duration: var(--dry-duration-fast);
		transition-timing-function: var(--dry-ease-out);
	}

	[data-modal-content][data-variant='drawer'][data-side='right'] [data-modal-panel] {
		grid-column: 2;
		height: 100%;
		border-left: 1px solid var(--dry-drawer-border);
	}

	[data-modal-content][data-variant='drawer'][data-side='left'] [data-modal-panel] {
		--_drawer-enter-transform: translateX(-100%);
		grid-column: 1;
		height: 100%;
		border-right: 1px solid var(--dry-drawer-border);
	}

	[data-modal-content][data-variant='drawer'][data-side='top'] [data-modal-panel] {
		--_drawer-rest-transform: translateY(0);
		--_drawer-enter-transform: translateY(-100%);
		grid-row: 1;
		height: var(--dry-drawer-size);
		border-bottom: 1px solid var(--dry-drawer-border);
	}

	[data-modal-content][data-variant='drawer'][data-side='bottom'] [data-modal-panel] {
		--_drawer-rest-transform: translateY(0);
		--_drawer-enter-transform: translateY(100%);
		grid-row: 2;
		height: var(--dry-drawer-size);
		border-top: 1px solid var(--dry-drawer-border);
	}

	@starting-style {
		[data-modal-content][data-variant='drawer'][open] [data-modal-panel] {
			opacity: 0;
			transform: var(--_drawer-enter-transform);
		}
	}

	[data-modal-content][data-variant='drawer'][data-state='open'] [data-modal-panel] {
		opacity: 1;
		transform: var(--_drawer-rest-transform);
	}

	@media (prefers-reduced-motion: reduce) {
		[data-modal-panel] {
			transition: none;
		}
	}
</style>
