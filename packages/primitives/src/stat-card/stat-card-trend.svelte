<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getStatCardCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		direction?: 'up' | 'down' | 'flat';
		children: Snippet;
	}

	let { direction = 'flat', children, ...rest }: Props = $props();
	const ctx = getStatCardCtx();
</script>

<div
	data-part="trend"
	data-direction={direction}
	data-tone={ctx?.tone ?? 'neutral'}
	data-density={ctx?.density ?? 'comfortable'}
	{...rest}
>
	{@render children()}
</div>
