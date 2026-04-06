<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLButtonElement> {
		children: Snippet;
		onclick?: () => void;
	}

	let { children, onclick, ...rest }: Props = $props();
</script>

<button type="button" data-part="action" {onclick} {...rest}>
	{@render children()}
</button>
