<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<span data-part="meta" {...rest}>{@render children?.()}</span>
