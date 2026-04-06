<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLOListElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<ol role="list" {...rest}>
	{@render children()}
</ol>
