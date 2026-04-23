<script lang="ts">
	import type { Snippet } from 'svelte';
	import { setSelectCtx } from './context.svelte.js';
	import SelectTrigger from './select-trigger-button.svelte';
	import SelectValue from './select-value.svelte';
	import SelectContent from './select-content.svelte';
	import SelectItem from './select-item.svelte';

	type SelectOption = { value: string; label: string };

	interface Props {
		open?: boolean;
		value?: string;
		disabled?: boolean;
		name?: string;
		class?: string;
		options?: Array<string | SelectOption>;
		placeholder?: string;
		children?: Snippet;
	}

	let {
		open = $bindable(false),
		value = $bindable(''),
		disabled = false,
		name,
		class: className,
		options,
		placeholder,
		children
	}: Props = $props();

	const normalizedOptions = $derived(
		options?.map((opt) => (typeof opt === 'string' ? { value: opt, label: opt } : opt))
	);

	const uid = $props.id();
	const triggerId = `select-trigger-${uid}`;
	const contentId = `select-content-${uid}`;

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

<div data-select-wrapper class={className}>
	{#if normalizedOptions && !children}
		<SelectTrigger>
			<SelectValue {placeholder} />
		</SelectTrigger>
		<SelectContent>
			{#each normalizedOptions as opt (opt.value)}
				<SelectItem value={opt.value}>{opt.label}</SelectItem>
			{/each}
		</SelectContent>
	{:else if children}
		{@render children()}
	{/if}

	{#if name}
		<input type="hidden" {name} {value} disabled={disabled || undefined} />
	{/if}
</div>

<style>
	[data-select-wrapper] {
		display: grid;
	}
</style>
