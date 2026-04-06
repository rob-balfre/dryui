<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setAccordionCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		type?: 'single' | 'multiple';
		value?: string[];
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		type = 'single',
		value = $bindable([]),
		orientation = 'vertical',
		children,
		...rest
	}: Props = $props();

	setAccordionCtx({
		get type() {
			return type;
		},
		get orientation() {
			return orientation;
		},
		get value() {
			return value;
		},
		set value(v) {
			value = v;
		},
		toggle(itemValue: string) {
			if (type === 'single') {
				value = value.includes(itemValue) ? [] : [itemValue];
			} else {
				value = value.includes(itemValue)
					? value.filter((v) => v !== itemValue)
					: [...value, itemValue];
			}
		},
		isOpen(itemValue: string) {
			return value.includes(itemValue);
		}
	});
</script>

<div data-orientation={orientation} {...rest}>
	{@render children()}
</div>
