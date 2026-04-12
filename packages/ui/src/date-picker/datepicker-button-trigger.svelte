<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { getDatePickerCtx } from './context.svelte.js';
	import { formatDate } from '@dryui/primitives';

	interface Props extends Omit<HTMLButtonAttributes, 'children'> {
		placeholder?: string;
		size?: 'sm' | 'md' | 'lg';
		children?: Snippet | undefined;
	}

	let { placeholder = 'Select date', children, size = 'md', ...rest }: Props = $props();

	const ctx = getDatePickerCtx();

	$effect(() => {
		const node = document.getElementById(ctx.triggerId);
		if (node) {
			ctx.triggerEl = node as HTMLButtonElement;
		}
		return () => {
			if (ctx.triggerEl && ctx.triggerEl.id === ctx.triggerId) {
				ctx.triggerEl = null;
			}
		};
	});

	const displayText = $derived(
		ctx.value
			? formatDate(ctx.value, ctx.locale, { year: 'numeric', month: 'long', day: 'numeric' })
			: ''
	);
</script>

<Button
	variant="outline"
	type="button"
	{size}
	id={ctx.triggerId}
	aria-haspopup="dialog"
	aria-expanded={ctx.open}
	aria-controls={ctx.contentId}
	data-state={ctx.open ? 'open' : 'closed'}
	data-disabled={ctx.disabled ? '' : undefined}
	disabled={ctx.disabled}
	popovertarget={ctx.contentId}
	{...rest}
>
	{#if children}
		{@render children()}
	{:else}
		<span data-placeholder={!ctx.value ? '' : undefined}>
			{displayText || placeholder}
		</span>
	{/if}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		aria-hidden="true"
		><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line
			x1="16"
			y1="2"
			x2="16"
			y2="6"
		/><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg
	>
</Button>
