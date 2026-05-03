<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLElement> {
		step?: 'section' | 'word' | 'letter' | number;
		as?: string;
		children?: Snippet;
	}

	let { step = 'section', as = 'div', class: className, children, ...rest }: Props = $props();

	const stepValue = $derived.by(() => {
		if (typeof step === 'number') return `${step}ms`;
		if (step === 'letter') return 'var(--dry-enter-stagger-letter)';
		if (step === 'word') return 'var(--dry-enter-stagger-word)';
		return 'var(--dry-enter-stagger-section)';
	});

	let el = $state<HTMLElement>();

	$effect(() => {
		if (!el) return;
		el.style.setProperty('--dry-stagger-step', stepValue);
	});
</script>

<svelte:element this={as} bind:this={el} data-dry-stagger class={className} {...rest}>
	{@render children?.()}
</svelte:element>
