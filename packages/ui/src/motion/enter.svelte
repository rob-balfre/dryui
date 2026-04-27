<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		index?: number;
		duration?: string;
		as?: string;
		children?: Snippet;
	}

	let { index = 0, duration, as = 'div', children }: Props = $props();

	let el = $state<HTMLElement>();

	$effect(() => {
		if (!el) return;
		el.style.setProperty('--dry-enter-index', String(index));
		if (duration) {
			el.style.setProperty('--dry-enter-duration', duration);
		} else {
			el.style.removeProperty('--dry-enter-duration');
		}
	});
</script>

<!-- dryui-allow svelte-element -->
<svelte:element this={as} bind:this={el} class="dry-enter">
	{@render children?.()}
</svelte:element>
