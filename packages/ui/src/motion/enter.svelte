<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		index?: number;
		duration?: string;
		as?: string;
		children?: Snippet;
	}

	let { index = 0, duration, as = 'div', class: className, children, ...rest }: Props = $props();

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

<svelte:element this={as} bind:this={el} class={['dry-enter', className]} {...rest}>
	{@render children?.()}
</svelte:element>
