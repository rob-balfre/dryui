<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { BlendMode } from '@dryui/primitives/adjust';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		brightness?: number;
		contrast?: number;
		saturate?: number;
		hueRotate?: number;
		grayscale?: number;
		sepia?: number;
		invert?: number;
		blur?: number;
		blendMode?: BlendMode;
		children: Snippet;
	}

	let {
		brightness,
		contrast,
		saturate,
		hueRotate,
		grayscale,
		sepia,
		invert,
		blur,
		blendMode,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	const filterString = $derived.by(() => {
		const parts: string[] = [];
		if (brightness != null && brightness !== 100) parts.push(`brightness(${brightness / 100})`);
		if (contrast != null && contrast !== 100) parts.push(`contrast(${contrast / 100})`);
		if (saturate != null && saturate !== 100) parts.push(`saturate(${saturate / 100})`);
		if (hueRotate != null && hueRotate !== 0) parts.push(`hue-rotate(${hueRotate}deg)`);
		if (grayscale != null && grayscale !== 0) parts.push(`grayscale(${grayscale / 100})`);
		if (sepia != null && sepia !== 0) parts.push(`sepia(${sepia / 100})`);
		if (invert != null && invert !== 0) parts.push(`invert(${invert / 100})`);
		if (blur != null && blur !== 0) parts.push(`blur(${blur}px)`);
		return parts.length ? parts.join(' ') : undefined;
	});

	let el = $state<HTMLDivElement>();

	$effect(() => {
		if (!el) return;
		el.style.cssText = style || '';
		el.style.setProperty('--_filter', filterString ?? 'none');
		el.style.setProperty('--_blend', blendMode ?? 'normal');
	});
</script>

<div bind:this={el} data-adjust class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-adjust] {
		block-size: var(--dry-adjust-block-size, auto);
		border-radius: inherit;
		filter: var(--_filter, none);
		min-block-size: var(--dry-adjust-min-block-size, 0);
		mix-blend-mode: var(--_blend, normal);
		overflow: var(--dry-adjust-overflow, visible);
	}
</style>
