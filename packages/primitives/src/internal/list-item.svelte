<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		children: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<li {...rest}>
	{@render children()}
</li>
