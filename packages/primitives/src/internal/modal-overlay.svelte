<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ctx: { readonly open: boolean };
	}

	let { ctx, ...rest }: Props = $props();
</script>

<div data-state={ctx.open ? 'open' : 'closed'} aria-hidden="true" {...rest}></div>
