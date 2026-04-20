<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import type { Placement } from '@dryui/primitives';
	import PickerPopoverContent from '../internal/picker-popover-content.svelte';
	import { getDateRangePickerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		placement?: Placement;
		offset?: number;
		children: Snippet;
	}

	let {
		placement = 'bottom-start',
		offset = 8,
		children,
		style,
		class: className,
		...rest
	}: Props = $props();

	const ctx = getDateRangePickerCtx();
</script>

<PickerPopoverContent
	controller={ctx}
	dataAttribute="data-drp-content"
	{placement}
	{offset}
	contentStyle={style}
	contentClass={className}
	{children}
	{...rest}
/>
