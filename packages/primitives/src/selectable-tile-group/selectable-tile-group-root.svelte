<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setSelectableTileGroupCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string;
		disabled?: boolean;
		orientation?: 'horizontal' | 'vertical';
		children: Snippet;
	}

	let {
		value = $bindable(''),
		disabled = false,
		orientation = 'horizontal',
		children,
		...rest
	}: Props = $props();

	setSelectableTileGroupCtx({
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
	{...rest}
>
	{@render children()}
</div>
