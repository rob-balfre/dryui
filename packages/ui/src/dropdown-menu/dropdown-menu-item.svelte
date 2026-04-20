<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDropdownMenuCtx } from './context.svelte.js';
	import MenuItem from '../internal/menu-item.svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		disabled?: boolean;
		children: Snippet;
	}

	let { class: className, disabled, children, onclick, onkeydown, ...rest }: Props = $props();

	const ctx = getDropdownMenuCtx();
</script>

<MenuItem
	data-dropdown-menu-item
	{className}
	close={ctx.close}
	{disabled}
	{onclick}
	{onkeydown}
	{...rest}
>
	{@render children()}
</MenuItem>
