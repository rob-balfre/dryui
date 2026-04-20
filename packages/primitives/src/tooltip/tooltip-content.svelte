<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTooltipCtx } from './context.svelte.js';
	import OverlayContent from '../internal/overlay-content.svelte';
	import type { Placement } from '../utils/anchor-position.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'top', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getTooltipCtx();
</script>

<OverlayContent {ctx} {placement} {offset} {style} role="tooltip" {...rest}>
	{@render children()}
</OverlayContent>
