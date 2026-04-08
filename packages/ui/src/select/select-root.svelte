<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '@dryui/primitives';
	import { setSelectCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		value?: string;
		disabled?: boolean;
		name?: string;
		class?: string;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		value = $bindable(''),
		disabled = false,
		name,
		class: className,
		children
	}: Props = $props();

	const triggerId = generateFormId('select-trigger');
	const contentId = generateFormId('select-content');

	let displayText = $state('');

	setSelectCtx({
		get open() {
			return open;
		},
		get value() {
			return value;
		},
		get displayText() {
			return displayText;
		},
		get disabled() {
			return disabled;
		},
		triggerId,
		contentId,
		triggerEl: null,
		show() {
			if (!disabled) open = true;
		},
		close() {
			open = false;
		},
		toggle() {
			if (!disabled) open = !open;
		},
		select(v: string, text: string) {
			value = v;
			displayText = text;
		}
	});
</script>

<div data-select-wrapper class={className}>
	{@render children()}

	{#if name}
		<input type="hidden" {name} {value} disabled={disabled || undefined} />
	{/if}
</div>

<style>
	[data-select-wrapper] {
		display: grid;
	}
</style>
