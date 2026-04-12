<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFileSelectCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, size = 'md', ...rest }: Props = $props();
	const ctx = getFileSelectCtx();
</script>

<Button
	variant="outline"
	type="button"
	{size}
	onclick={ctx.request}
	disabled={ctx.disabled || ctx.loading || undefined}
	data-loading={ctx.loading || undefined}
	{...rest}
>
	{@render children()}
</Button>
