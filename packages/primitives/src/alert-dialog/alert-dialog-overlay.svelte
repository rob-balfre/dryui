<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAlertDialogCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getAlertDialogCtx();
</script>

<div data-state={ctx.open ? 'open' : 'closed'} aria-hidden="true" {...rest}></div>
