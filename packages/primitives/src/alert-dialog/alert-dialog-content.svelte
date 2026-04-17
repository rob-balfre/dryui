<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';
	import ModalContent from '../internal/modal-content.svelte';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<ModalContent
	{ctx}
	side="center"
	role="alertdialog"
	dismissOnEscape={false}
	dismissOnBackdropClick={false}
	{...rest}
>
	{@render children()}
</ModalContent>
