<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getSelectCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		placeholder?: string;
	}

	let { placeholder = '', ...rest }: Props = $props();

	const ctx = getSelectCtx();
</script>

<span data-placeholder={!ctx.displayText || undefined} {...rest}>
	{ctx.displayText || placeholder}
</span>
