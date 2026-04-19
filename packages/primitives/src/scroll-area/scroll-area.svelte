<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		orientation?: 'vertical' | 'horizontal' | 'both';
		children: Snippet;
	}

	let {
		orientation = 'vertical',
		role: roleProp,
		tabindex = 0,
		'aria-label': ariaLabel,
		'aria-labelledby': ariaLabelledBy,
		children,
		...rest
	}: Props = $props();

	const role = $derived(roleProp ?? (ariaLabel || ariaLabelledBy ? 'region' : undefined));

	function applyOverflow(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('overflow-y', orientation === 'horizontal' ? 'hidden' : 'auto');
			node.style.setProperty('overflow-x', orientation === 'vertical' ? 'hidden' : 'auto');
		});
	}
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	{role}
	aria-label={ariaLabel}
	aria-labelledby={ariaLabelledBy}
	data-orientation={orientation}
	{tabindex}
	{@attach applyOverflow}
	{...rest}
>
	{@render children()}
</div>
