<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ratio?: number;
		children: Snippet;
	}

	let { ratio = 16 / 9, class: className, children, ...rest }: Props = $props();

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.setProperty('--_ratio', String(ratio));
	});
</script>

<div bind:this={el} class={className} {...rest}>
	{@render children()}
</div>

<style>
	div {
		overflow: hidden;
		aspect-ratio: var(--_ratio, 16 / 9);
	}
</style>
