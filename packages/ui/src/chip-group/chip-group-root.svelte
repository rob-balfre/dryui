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
		gap?: 'sm' | 'md' | 'lg';
		justify?: 'start' | 'center' | 'end' | 'between';
		children: Snippet;
	}

	let {
		type = 'single',
		value = $bindable([]),
		disabled = false,
		orientation = 'horizontal',
		size = 'sm',
		gap = 'md',
		justify = 'start',
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
	{...variantAttrs({ orientation, size, gap, justify })}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	/*
	 * ChipGroup wraps tag/chip clusters with content-driven flow.
	 * This is the sanctioned home for flex-wrap: the `[data-chip-group]`
	 * attribute is carved out of `dryui/no-flex` so chip/tag wrapping
	 * reads naturally without grid hacks.
	 */
	[data-chip-group] {
		--_chip-group-gap-default: var(--dry-space-2);

		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--dry-chip-group-gap, var(--_chip-group-gap-default));
	}

	[data-chip-group][data-orientation='vertical'] {
		flex-direction: column;
		align-items: flex-start;
	}

	/* Gap presets — map onto --dry-space tokens. */
	[data-chip-group][data-gap='sm'] {
		--_chip-group-gap-default: var(--dry-space-1);
	}

	[data-chip-group][data-gap='md'] {
		--_chip-group-gap-default: var(--dry-space-2);
	}

	[data-chip-group][data-gap='lg'] {
		--_chip-group-gap-default: var(--dry-space-3);
	}

	/* Justify presets. */
	[data-chip-group][data-justify='start'] {
		justify-content: flex-start;
	}

	[data-chip-group][data-justify='center'] {
		justify-content: center;
	}

	[data-chip-group][data-justify='end'] {
		justify-content: flex-end;
	}

	[data-chip-group][data-justify='between'] {
		justify-content: space-between;
	}

	/* Size presets retained for backward-compatible Item styling. */
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
