<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';
	import ModalContent from '../internal/modal-content.svelte';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDialogCtx();
</script>

<ModalContent {ctx} variant="dialog" side="center" {...rest}>
	{@render children()}
</ModalContent>
