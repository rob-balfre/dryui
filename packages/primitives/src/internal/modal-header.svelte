<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ctx: { readonly headerId: string };
		children: Snippet;
	}

	let { ctx, children, ...rest }: Props = $props();
</script>

<div id={ctx.headerId} {...rest}>
	{@render children()}
</div>
