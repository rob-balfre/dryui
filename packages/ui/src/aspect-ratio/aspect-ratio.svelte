<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ratio?: number;
		children: Snippet;
	}

	let { ratio = 16 / 9, class: className, children, ...rest }: Props = $props();

	function applyRatio(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('aspect-ratio', String(ratio));
		});
	}
</script>

<div {@attach applyRatio} class={className} {...rest}>
	{@render children()}
</div>

<style>
	div {
		overflow: hidden;
	}
</style>
