<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		count?: number;
		maxVisible?: number;
		size?: 'sm' | 'md' | 'lg';
		overlap?: 'sm' | 'md' | 'lg';
		status?: 'online' | 'offline' | 'busy' | 'away';
		label?: string;
		children: Snippet;
	}

	let {
		count = 0,
		maxVisible = 4,
		size = 'md',
		overlap = 'md',
		status,
		label = 'Avatar group',
		class: className,
		children,
		...rest
	}: Props = $props();

	const overflow = $derived(Math.max(0, count - maxVisible));
</script>

<div
	role="group"
	aria-label={label}
	data-size={size}
	data-overlap={overlap}
	data-status={status || undefined}
	data-overflow={overflow > 0 ? overflow : undefined}
	class={className}
	{...rest}
>
	{@render children()}
	{#if overflow > 0}
		<span data-part="overflow" aria-hidden="true">+{overflow}</span>
	{/if}
</div>
