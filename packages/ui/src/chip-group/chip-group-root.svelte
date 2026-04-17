<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { variantAttrs } from '@dryui/primitives';
	import { setChipGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		type?: 'single' | 'multiple';
		value?: string[];
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		size?: 'sm' | 'md';
		children: Snippet;
	}

	let {
		type = 'single',
		value = $bindable([]),
		disabled = false,
		orientation = 'horizontal',
		size = 'sm',
		class: className,
		children,
		...rest
	}: Props = $props();

	setChipGroupCtx({
		get type() {
			return type;
		},
		get disabled() {
			return disabled;
		},
		get value() {
			return value;
		},
		toggle(itemValue: string) {
			if (type === 'single') {
				value = value.includes(itemValue) ? [] : [itemValue];
			} else {
				value = value.includes(itemValue)
					? value.filter((selected) => selected !== itemValue)
					: [...value, itemValue];
			}
		},
		isSelected(itemValue: string) {
			return value.includes(itemValue);
		}
	});
</script>

<div
	role="group"
	data-chip-group
	{...variantAttrs({ orientation, size })}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-chip-group] {
		display: inline-grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-2);
	}

	[data-chip-group][data-orientation='horizontal'] {
		grid-auto-flow: column;
	}

	[data-chip-group][data-orientation='vertical'] {
		grid-template-columns: 1fr;
		justify-items: start;
	}

	[data-chip-group][data-size='sm'] {
		--dry-chip-group-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-chip-group-padding-x: var(--dry-space-2_5);
		--dry-chip-group-padding-y: var(--dry-space-0_5);
	}

	[data-chip-group][data-size='md'] {
		--dry-chip-group-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-chip-group-padding-x: var(--dry-space-3);
		--dry-chip-group-padding-y: var(--dry-space-1);
	}
</style>
