<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		ctx: { close: () => void };
		children: Snippet;
	}

	let { ctx, children, ...rest }: Props = $props();
</script>

<button type="button" onclick={() => ctx.close()} {...rest}>
	{@render children()}
</button>
