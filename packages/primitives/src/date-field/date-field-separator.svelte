<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateFieldCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		separator?: string;
	}

	let { separator, ...rest }: Props = $props();

	const ctx = getDateFieldCtx();

	const display = $derived(separator ?? ctx.separator);
</script>

<span aria-hidden="true" data-separator="" {...rest}>{display}</span>
