<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		blur?: number;
		tint?: string;
		saturation?: number;
		children: Snippet;
	}

	let {
		blur = 12,
		tint = 'rgba(255,255,255,0.08)',
		saturation = 120,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-glass-blur', `${Math.max(0, blur)}px`);
			node.style.setProperty('--dry-glass-tint', tint);
			node.style.setProperty(
				'--dry-glass-saturation',
				`${Math.max(0, Math.min(200, saturation))}%`
			);
		});
	}
</script>

<div class={['glass', className]} use:applyStyles {...rest}>
	{@render children()}
</div>

<style>
	.glass {
		position: relative;
	}
</style>
