<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setOptionPickerCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		columns?: 1 | 2 | 3 | 4;
		children: Snippet;
	}

	let {
		value = $bindable(''),
		disabled = false,
		orientation = 'horizontal',
		columns,
		class: className,
		children,
		...rest
	}: Props = $props();

	setOptionPickerCtx({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get orientation() {
			return orientation;
		},
		select(nextValue: string) {
			value = nextValue;
		},
		isSelected(itemValue: string) {
			return value === itemValue;
		}
	});
</script>

<div
	role="radiogroup"
	aria-orientation={orientation}
	data-orientation={orientation}
	data-disabled={disabled || undefined}
	data-columns={columns}
	data-option-picker-root
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-option-picker-root] {
		display: grid;
		grid-template-columns: repeat(
			auto-fit,
			minmax(var(--dry-option-picker-min-column, 10rem), 1fr)
		);
		gap: var(--dry-option-picker-gap, var(--dry-space-3));
		align-items: stretch;
	}

	[data-option-picker-root][data-orientation='vertical'] {
		grid-template-columns: 1fr;
	}

	[data-option-picker-root][data-columns='2'] {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	[data-option-picker-root][data-columns='3'] {
		grid-template-columns: repeat(3, minmax(0, 1fr));
	}

	[data-option-picker-root][data-columns='4'] {
		grid-template-columns: repeat(4, minmax(0, 1fr));
	}
</style>
