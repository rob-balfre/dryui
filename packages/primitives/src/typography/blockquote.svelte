<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLQuoteElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<blockquote {...rest}>{@render children()}</blockquote>
