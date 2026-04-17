<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';
	import ModalContent from '../internal/modal-content.svelte';

	interface Props extends HTMLAttributes<HTMLDialogElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<ModalContent {ctx} side={ctx.side} {...rest}>
	{@render children()}
</ModalContent>
