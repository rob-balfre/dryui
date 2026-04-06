<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableCellElement> {
		scope?: 'col' | 'row';
		children: Snippet;
	}

	let { scope = 'col', children, ...rest }: Props = $props();
</script>

<th {scope} {...rest}>
	{@render children()}
</th>
