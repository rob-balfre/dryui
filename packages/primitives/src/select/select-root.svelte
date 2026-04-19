<script lang="ts">
	import type { Snippet } from 'svelte';
	import { generateFormId } from '../utils/form-control.svelte.js';
	import { setSelectCtx } from './context.svelte.js';

	interface Props {
		open?: boolean;
		value?: string;
		disabled?: boolean;
		name?: string;
		children: Snippet;
	}

	let {
		open = $bindable(false),
		value = $bindable(''),
		disabled = false,
		name,
		children
	}: Props = $props();

	const triggerId = generateFormId('select-trigger');
	const contentId = generateFormId('select-content');

	let displayText = $state('');
	let triggerEl = $state<HTMLElement | null>(null);

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
		get triggerEl() {
			return triggerEl;
		},
		set triggerEl(element: HTMLElement | null) {
			triggerEl = element;
		},
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

{@render children()}

{#if name}
	<input type="hidden" {name} {value} disabled={disabled || undefined} />
{/if}
