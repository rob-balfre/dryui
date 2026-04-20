<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getPopoverCtx } from './context.svelte.js';
	import OverlayContent from '../internal/overlay-content.svelte';
	import type { Placement } from '../utils/anchor-position.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getPopoverCtx();
</script>

<OverlayContent
	{ctx}
	{placement}
	{offset}
	{style}
	dismiss
	onDismiss={() => ctx.close()}
	preventDefaultOnEscape
	returnFocusTo={() => ctx.triggerEl}
	{...rest}
>
	{@render children()}
</OverlayContent>
