<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTableRowElement> {
		rowId?: string;
		children: Snippet;
	}

	let { rowId, children, ...rest }: Props = $props();
</script>

<tr data-row-id={rowId ?? undefined} {...rest}>
	{@render children()}
</tr>
