<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children?: Snippet;
	}

	let { children, ...rest }: Props = $props();
</script>

<div data-part="indicator" {...rest}>{@render children?.()}</div>
