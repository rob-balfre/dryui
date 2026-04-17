<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';
	import ModalOverlay from '../internal/modal-overlay.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<ModalOverlay {ctx} {...rest} />
