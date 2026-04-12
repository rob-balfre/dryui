<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getFloatButtonCtx } from './context.svelte.js';

	interface Props extends HTMLButtonAttributes {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getFloatButtonCtx();
</script>

<Button
	variant="nav"
	size="icon-sm"
	type="button"
	data-float-button-action
	data-state={ctx.open ? 'open' : 'closed'}
	tabindex={ctx.open ? 0 : -1}
	{...rest}
>
	{@render children()}
</Button>
