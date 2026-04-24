<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setPageHeaderMetaCtx, type PageHeaderMetaColor } from './meta-context.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		children: Snippet;
		variant?: 'solid' | 'outline' | 'soft';
		color?: PageHeaderMetaColor;
		size?: 'sm' | 'md';
	}

	let { children, variant, color, size, ...rest }: Props = $props();

	setPageHeaderMetaCtx({
		get variant() {
			return variant;
		},
		get color() {
			return color;
		},
		get size() {
			return size;
		}
	});
</script>

<div data-page-header-meta {...rest}>
	{@render children()}
</div>

<style>
	[data-page-header-meta] {
		/* dryui-allow flex: metadata items have variable counts and widths; flex-wrap matches that cadence more cleanly than grid tracks. */
		display: flex;
		/* dryui-allow flex: paired with the display above. */
		flex-wrap: wrap;
		align-items: center;
		gap: var(--dry-space-2);
	}
</style>
