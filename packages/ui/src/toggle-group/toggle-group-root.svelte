<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setToggleGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		type?: 'single' | 'multiple';
		value?: string[];
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		type = 'single',
		value = $bindable([]),
		disabled = false,
		orientation = 'horizontal',
		size = 'md',
		class: className,
		children,
		...rest
	}: Props = $props();

	const selectedSet = $derived(new Set(value));

	setToggleGroupCtx({
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
				value = selectedSet.has(itemValue) ? [] : [itemValue];
			} else {
				value = selectedSet.has(itemValue)
					? value.filter((v) => v !== itemValue)
					: [...value, itemValue];
			}
		},
		get orientation() {
			return orientation;
		},
		isSelected(itemValue: string) {
			return selectedSet.has(itemValue);
		}
	});
</script>

<div
	role="toolbar"
	aria-orientation={orientation}
	data-part="root"
	data-orientation={orientation}
	data-size={size}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-part='root'] {
		display: inline-grid;
		gap: 0;
	}

	[data-orientation='horizontal'] {
		grid-auto-flow: column;
		grid-auto-columns: max-content;
	}

	[data-orientation='vertical'] {
		grid-auto-flow: row;
	}

	[data-size='sm'] {
		--dry-tg-padding-x: var(--dry-space-2);
		--dry-tg-padding-y: var(--dry-space-1_5);
		--dry-tg-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-tg-min-height: var(--dry-space-8);
		--dry-tg-radius: var(--dry-radius-sm);
	}

	[data-size='md'] {
		--dry-tg-padding-x: var(--dry-space-3);
		--dry-tg-padding-y: var(--dry-space-2);
		--dry-tg-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-tg-min-height: var(--dry-space-10);
		--dry-tg-radius: var(--dry-radius-md);
	}

	[data-size='lg'] {
		--dry-tg-padding-x: var(--dry-space-4);
		--dry-tg-padding-y: var(--dry-space-2_5);
		--dry-tg-font-size: var(--dry-type-heading-4-size, var(--dry-text-base-size));
		--dry-tg-min-height: var(--dry-space-12);
		--dry-tg-radius: var(--dry-radius-lg);
	}
</style>
