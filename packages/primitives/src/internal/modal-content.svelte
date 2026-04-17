<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLDialogAttributes } from 'svelte/elements';

	type ModalSide = 'center' | 'top' | 'right' | 'bottom' | 'left';

	interface Props extends HTMLDialogAttributes {
		ctx: { readonly open: boolean; readonly headerId: string; close: () => void };
		/**
		 * Positioning variant. `center` is the default dialog placement;
		 * `top`/`right`/`bottom`/`left` produce a side-sheet (drawer) layout.
		 * Rendered as the `data-side` attribute for scoped styles to pick up.
		 */
		side?: ModalSide;
		/**
		 * When false, clicking the dialog backdrop (i.e. the dialog element
		 * itself, not its content) does NOT dismiss. AlertDialog sets this
		 * to false so users must explicitly pick Cancel or Action.
		 */
		dismissOnBackdropClick?: boolean;
		/**
		 * When false, pressing Escape does NOT dismiss. Defaults to true
		 * (matches the native <dialog> behavior). AlertDialog sets this
		 * to false.
		 */
		dismissOnEscape?: boolean;
		children: Snippet;
	}

	let {
		ctx,
		side = 'center',
		dismissOnBackdropClick = true,
		dismissOnEscape = true,
		children,
		...rest
	}: Props = $props();

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
	aria-labelledby={ctx.headerId || undefined}
	data-state={ctx.open ? 'open' : 'closed'}
	data-side={side}
	onclose={() => ctx.close()}
	oncancel={dismissOnEscape ? undefined : (e) => e.preventDefault()}
	onclick={dismissOnBackdropClick
		? (e) => {
				if (e.target === dialogEl) {
					ctx.close();
				}
			}
		: undefined}
	{...rest}
>
	{@render children()}
</dialog>
