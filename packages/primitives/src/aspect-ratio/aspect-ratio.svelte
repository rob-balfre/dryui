<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		ratio?: number;
		children: Snippet;
	}

	let { ratio = 16 / 9, children, ...rest }: Props = $props();

	function applyRatio(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('aspect-ratio', String(ratio));
		});
	}
</script>

<div use:applyRatio {...rest}>
	{@render children()}
</div>
