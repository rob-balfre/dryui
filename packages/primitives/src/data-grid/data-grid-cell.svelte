<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<td role="gridcell" {...rest}>
	{@render children()}
</td>
