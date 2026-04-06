<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setChipGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		type?: 'single' | 'multiple';
		value?: string[];
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		type = 'single',
		value = $bindable([]),
		disabled = false,
		orientation = 'horizontal',
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

<div role="group" data-orientation={orientation} {...rest}>
	{@render children()}
</div>
