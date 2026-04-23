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

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--dry-stagger-step', stepValue);
		});
	}
</script>

<!-- dryui-allow svelte-element -->
<svelte:element this={as} data-dry-stagger {@attach applyStyles}>
	{@render children?.()}
</svelte:element>
