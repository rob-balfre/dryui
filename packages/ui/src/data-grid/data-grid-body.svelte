<script lang="ts" generics="T = unknown">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDataGridCtx } from './context.svelte.js';

	interface Props extends Omit<HTMLAttributes<HTMLTableSectionElement>, 'children'> {
		children: Snippet<[{ items: T[]; page: number }]>;
	}

	let { class: className, children, ...rest }: Props = $props();

	const ctx = getDataGridCtx();
</script>

<tbody data-dg-body class={className} {...rest}>
	{@render children({ items: ctx.pagedItems as T[], page: ctx.page })}
</tbody>
