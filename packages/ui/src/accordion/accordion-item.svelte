<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getAccordionCtx, setAccordionItemCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value: string;
		disabled?: boolean;
		children: Snippet;
	}

	let { value, disabled = false, class: className, children, ...rest }: Props = $props();

	const ctx = getAccordionCtx();

	const contentId = $derived(`accordion-content-${value}`);

	setAccordionItemCtx({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get open() {
			return ctx.isOpen(value);
		},
		get contentId() {
			return contentId;
		}
	});
</script>

<div
	data-accordion-item
	data-state={ctx.isOpen(value) ? 'open' : 'closed'}
	data-disabled={disabled || undefined}
	class={className}
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-accordion-item] {
		display: grid;
		border-bottom: 1px solid var(--dry-color-stroke-weak);

		&:last-child {
			border-bottom: none;
		}
	}
</style>
