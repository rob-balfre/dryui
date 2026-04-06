<script lang="ts" generics="T">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { VirtualList as VirtualListPrimitive } from '@dryui/primitives/virtual-list';

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		items: T[];
		itemHeight: number | ((index: number) => number);
		overscan?: number | undefined;
		children: Snippet<[{ item: T; index: number; style: string }]>;
	}

	let { ...rest }: Props = $props();
</script>

<VirtualListPrimitive {...rest} data-virtual-list />

<!-- svelte-ignore css_unused_selector -->
<style>
	[data-virtual-list] {
		--dry-virtual-list-scrollbar-width: 8px;
		--dry-virtual-list-scrollbar-track: var(--dry-color-bg-raised, transparent);
		--dry-virtual-list-scrollbar-thumb: color-mix(
			in srgb,
			var(--dry-color-text-strong) 16%,
			transparent
		);
		--dry-virtual-list-scrollbar-thumb-hover: color-mix(
			in srgb,
			var(--dry-color-text-strong) 24%,
			transparent
		);
		--dry-virtual-list-scrollbar-radius: var(--dry-radius-full, 9999px);

		scrollbar-width: thin;
		scrollbar-color: var(--dry-virtual-list-scrollbar-thumb) var(--dry-virtual-list-scrollbar-track);
	}

	[data-virtual-list]::-webkit-scrollbar-track {
		background: var(--dry-virtual-list-scrollbar-track);
		border-radius: var(--dry-virtual-list-scrollbar-radius);
	}

	[data-virtual-list]::-webkit-scrollbar-thumb {
		background: var(--dry-virtual-list-scrollbar-thumb);
		border-radius: var(--dry-virtual-list-scrollbar-radius);
	}

	[data-virtual-list]::-webkit-scrollbar-thumb:hover {
		background: var(--dry-virtual-list-scrollbar-thumb-hover);
	}
</style>
