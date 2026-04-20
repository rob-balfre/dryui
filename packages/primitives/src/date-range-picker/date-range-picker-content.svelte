<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateRangePickerCtx } from './context.svelte.js';
	import OverlayContent from '../internal/overlay-content.svelte';
	import type { Placement } from '../utils/anchor-position.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let { placement = 'bottom-start', offset = 8, children, style, ...rest }: Props = $props();

	const ctx = getDateRangePickerCtx();
</script>

<OverlayContent
	{ctx}
	{placement}
	{offset}
	{style}
	popoverMode="auto"
	role="dialog"
	ontoggle={(e) => {
		const newState = (e as ToggleEvent).newState === 'open';
		if (newState && !ctx.open) {
			ctx.show();
		} else if (!newState && ctx.open) {
			ctx.close();
		}
	}}
	{...rest}
>
	{@render children()}
</OverlayContent>
