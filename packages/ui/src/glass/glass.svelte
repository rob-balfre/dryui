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
		tint,
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
			if (tint) node.style.setProperty('--dry-glass-tint', tint);
			else node.style.removeProperty('--dry-glass-tint');
			node.style.setProperty(
				'--dry-glass-saturation',
				`${Math.max(0, Math.min(200, saturation))}%`
			);
		});
	}
</script>

<div class={className} data-glass use:applyStyles {...rest}>
	{@render children()}
</div>

<style>
	[data-glass] {
		position: relative;
		backdrop-filter: blur(var(--dry-glass-blur, 12px)) saturate(var(--dry-glass-saturation, 120%));
		-webkit-backdrop-filter: blur(var(--dry-glass-blur, 12px))
			saturate(var(--dry-glass-saturation, 120%));
		background: var(--dry-glass-tint, var(--dry-color-glass-tint, rgba(255, 255, 255, 0.08)));
		border-radius: inherit;
	}
</style>
