<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		step?: 'section' | 'word' | 'letter' | number;
		as?: string;
		children?: Snippet;
	}

	let { step = 'section', as = 'div', children }: Props = $props();

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

<svelte:element this={as} bind:this={el} data-dry-stagger>
	{@render children?.()}
</svelte:element>
