<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getLinkPreviewCtx } from './context.svelte.js';
	import OverlayContent from '../internal/overlay-content.svelte';
	import type { Placement } from '../utils/anchor-position.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getLinkPreviewCtx();
</script>

<OverlayContent
	{ctx}
	{placement}
	{offset}
	{style}
	role="tooltip"
	onmouseenter={() => ctx.showImmediate()}
	onmouseleave={() => ctx.close()}
	{...rest}
>
	{@render children()}
</OverlayContent>
