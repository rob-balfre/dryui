<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let { children, size = 'md', ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();

	const btnSize = $derived(size === 'sm' ? 'icon-sm' : size === 'lg' ? 'icon-lg' : 'icon');
</script>

<Button
	variant="solid"
	size={btnSize}
	type="button"
	aria-expanded={ctx.open}
	data-state={ctx.open ? 'open' : 'closed'}
	data-float-button-trigger
	onclick={() => ctx.toggle()}
	{...rest}
>
	{@render children()}
</Button>
