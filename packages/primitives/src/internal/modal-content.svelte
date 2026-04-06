<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		ctx: { readonly open: boolean; readonly headerId: string; close: () => void };
		children: Snippet;
	}

	let { ctx, children, ...rest }: Props = $props();

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
	aria-labelledby={ctx.headerId}
	data-state={ctx.open ? 'open' : 'closed'}
	onclose={() => ctx.close()}
	onclick={(e) => {
		if (e.target === dialogEl) {
			ctx.close();
		}
	}}
	{...rest}
>
	{@render children()}
</dialog>
