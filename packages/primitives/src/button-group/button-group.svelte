<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let { orientation = 'horizontal', children, ...rest }: Props = $props();
</script>

<div role="group" data-orientation={orientation} {...rest}>
	{@render children()}
</div>
