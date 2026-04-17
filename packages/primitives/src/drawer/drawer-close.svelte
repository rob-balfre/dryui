<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';
	import ModalClose from '../internal/modal-close.svelte';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<ModalClose {ctx} {...rest}>
	{@render children()}
</ModalClose>
