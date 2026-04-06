<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		children: Snippet;
	}

	let { class: className, children, ...rest }: Props = $props();
</script>

<span class={className} {...rest}>
	{@render children()}
</span>

<style>
	span {
		position: absolute;
		height: 1px;
		aspect-ratio: 1;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>
