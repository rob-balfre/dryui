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
		class: className,
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

<!--
	`data-dry-stagger` staggers the enter animation of the accordion items
	using the shared utility in `themes/default.css`. Item ordering is
	derived from `:nth-child()` — consumers can override by setting
	`--dry-index` directly on an `<AccordionItem>` if they render items
	in a non-DOM order.
-->
<div data-accordion data-dry-stagger data-orientation={orientation} class={className} {...rest}>
	{@render children()}
</div>

<style>
	[data-accordion] {
		display: grid;
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-radius-lg);
		overflow: hidden;
	}
</style>
