<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		background?: string;
		children: Snippet;
	}

	let { background, children, class: className, style, ...rest }: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			if (background) node.style.setProperty('--dry-surface-bg', background);
		});
	}
</script>

<div class={['surface', className]} use:applyStyles {...rest}>
	{@render children()}
</div>

<style>
	.surface {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}
</style>
