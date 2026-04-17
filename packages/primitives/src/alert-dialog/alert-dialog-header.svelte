<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';
	import ModalHeader from '../internal/modal-header.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<ModalHeader {ctx} {...rest}>
	{@render children()}
</ModalHeader>
