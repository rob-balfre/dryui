<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		index?: number;
		duration?: string;
		as?: string;
		children?: Snippet;
	}

	let { index = 0, duration, as = 'div', children }: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-enter-index', String(index));
			if (duration) {
				node.style.setProperty('--dry-enter-duration', duration);
			} else {
				node.style.removeProperty('--dry-enter-duration');
			}
		});
	}
</script>

<!-- dryui-allow svelte-element -->
<svelte:element this={as} class="dry-enter" {@attach applyStyles}>
	{@render children?.()}
</svelte:element>
