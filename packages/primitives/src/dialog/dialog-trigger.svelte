<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDialogCtx } from './context.svelte.js';
	import ModalTrigger from '../internal/modal-trigger.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDialogCtx();
</script>

<ModalTrigger {ctx} {...rest}>
	{@render children()}
</ModalTrigger>
