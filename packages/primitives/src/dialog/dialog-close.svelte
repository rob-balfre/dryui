<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';
	import ModalClose from '../internal/modal-close.svelte';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDialogCtx();
</script>

<ModalClose {ctx} {...rest}>
	{@render children()}
</ModalClose>
