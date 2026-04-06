<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStatCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
	const ctx = getStatCardCtx();
</script>

<div
	data-part="label"
	data-tone={ctx?.tone ?? 'neutral'}
	data-density={ctx?.density ?? 'comfortable'}
	{...rest}
>
	{@render children()}
</div>
