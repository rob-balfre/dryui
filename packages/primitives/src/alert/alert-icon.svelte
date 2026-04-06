<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<span aria-hidden="true" {...rest}>
	{@render children()}
</span>
