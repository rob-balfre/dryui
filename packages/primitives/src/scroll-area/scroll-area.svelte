<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'vertical' | 'horizontal' | 'both';
		children: Snippet;
	}

	let { orientation = 'vertical', children, ...rest }: Props = $props();

	function applyOverflow(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('overflow-y', orientation === 'horizontal' ? 'hidden' : 'auto');
			node.style.setProperty('overflow-x', orientation === 'vertical' ? 'hidden' : 'auto');
		});
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	role="region"
	aria-label="Scrollable content"
	data-orientation={orientation}
	tabindex={0}
	use:applyOverflow
	{...rest}
>
	{@render children()}
</div>
