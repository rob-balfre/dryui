<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLLIElement> {
		file: File;
		index: number;
		children: Snippet;
	}

	let { file, index, children, class: className, ...rest }: Props = $props();
</script>

<li class={className} data-index={index} {...rest}>
	{@render children()}
</li>
