<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string[];
		maxTags?: number;
		allowDuplicates?: boolean;
		disabled?: boolean;
		onValueChange?: (value: string[]) => void;
		children: Snippet;
	}

	let {
		value = $bindable([]),
		maxTags = 0,
		allowDuplicates = false,
		disabled = false,
		onValueChange,
		children,
		...rest
	}: Props = $props();

	const canAddMore = $derived(maxTags === 0 || value.length < maxTags);

	setTagsInputCtx({
		get value() {
			return value;
		},
		get disabled() {
			return disabled;
		},
		get maxTags() {
			return maxTags;
		},
		get allowDuplicates() {
			return allowDuplicates;
		},
		get canAddMore() {
			return canAddMore;
		},
		addTag(tag: string): boolean {
			const trimmed = tag.trim();
			if (!trimmed) return false;
			if (!canAddMore) return false;
			if (!allowDuplicates && value.includes(trimmed)) return false;
			value = [...value, trimmed];
			onValueChange?.(value);
			return true;
		},
		removeTag(index: number): void {
			value = value.filter((_, i) => i !== index);
			onValueChange?.(value);
		},
		removeLastTag(): void {
			if (value.length === 0) return;
			value = value.slice(0, -1);
			onValueChange?.(value);
		}
	});
</script>

<div role="group" data-disabled={disabled || undefined} {...rest}>
	{@render children()}
</div>
