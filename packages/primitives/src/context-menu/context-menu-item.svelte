<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getContextMenuCtx } from './context.svelte.js';
	import MenuItem from '../internal/menu-item.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		disabled?: boolean;
		children: Snippet;
	}

	let { disabled = false, children, onclick, onkeydown, ...rest }: Props = $props();

	const ctx = getContextMenuCtx();
</script>

<MenuItem {disabled} onSelect={() => ctx.close()} {onclick} {onkeydown} {...rest}>
	{@render children()}
</MenuItem>
