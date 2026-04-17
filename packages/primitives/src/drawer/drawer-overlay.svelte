<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';
	import ModalOverlay from '../internal/modal-overlay.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<ModalOverlay {ctx} {...rest} />
