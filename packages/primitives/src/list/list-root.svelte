<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setListCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLUListElement> {
		dense?: boolean;
		disablePadding?: boolean;
		children: Snippet;
	}

	let { dense = false, disablePadding = false, children, ...rest }: Props = $props();

	setListCtx({
		get dense() {
			return dense;
		},
		get disablePadding() {
			return disablePadding;
		}
	});
</script>

<ul
	role="list"
	data-dense={dense || undefined}
	data-disable-padding={disablePadding || undefined}
	{...rest}
>
	{@render children()}
</ul>
