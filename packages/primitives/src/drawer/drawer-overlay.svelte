<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDrawerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {}

	let { ...rest }: Props = $props();

	const ctx = getDrawerCtx();
</script>

<div data-state={ctx.open ? 'open' : 'closed'} aria-hidden="true" {...rest}></div>
