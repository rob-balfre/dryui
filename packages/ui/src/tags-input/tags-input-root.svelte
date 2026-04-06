<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setTagsInputCtx } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: string[];
		maxTags?: number;
		allowDuplicates?: boolean;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		onValueChange?: (value: string[]) => void;
		children: Snippet;
	}

	let {
		value = $bindable([]),
		maxTags = 0,
		allowDuplicates = false,
		disabled = false,
		size = 'md',
		onValueChange,
		class: className,
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

<div data-part="wrapper">
	<div
		role="group"
		data-part="root"
		data-size={size}
		data-disabled={disabled || undefined}
		class={className}
		{...rest}
	>
		{@render children()}
	</div>
</div>

<style>
	[data-part='wrapper'] {
		container-type: inline-size;
		display: grid;
	}

	[data-part='root'] {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min-content, max-content));
		gap: var(--dry-space-1_5);
		padding: var(--dry-space-2);
		border: 1px solid var(--dry-color-stroke-strong);
		border-radius: var(--dry-radius-md);
		background: var(--dry-color-bg-raised);
		min-height: 44px;
		align-items: center;
		box-sizing: border-box;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
		cursor: text;

		&:hover:not([data-disabled]) {
			border-color: var(--dry-color-stroke-strong);
		}

		&:focus-within {
			outline: 2px solid var(--dry-color-focus-ring);
			outline-offset: -1px;
			border-color: var(--dry-color-stroke-focus);
			box-shadow: 0 0 0 1px var(--dry-color-stroke-focus);
		}

		&[data-disabled] {
			background: var(--dry-color-bg-sunken);
			border-color: var(--dry-color-stroke-disabled);
			color: var(--dry-color-text-disabled);
			cursor: not-allowed;
			pointer-events: none;
		}
	}

	/* Size variants */
	[data-size='sm'] {
		padding: var(--dry-space-1) var(--dry-space-1_5);
		min-height: 32px;
		gap: var(--dry-space-1);
		--dry-tags-input-tag-padding-x: var(--dry-space-1_5);
		--dry-tags-input-tag-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		--dry-tags-input-font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
	}

	[data-size='md'] {
		padding: var(--dry-space-2);
		min-height: 44px;
		gap: var(--dry-space-1_5);
	}

	[data-size='lg'] {
		padding: var(--dry-space-2_5);
		min-height: 52px;
		gap: var(--dry-space-2);
		--dry-tags-input-tag-padding-x: var(--dry-space-2_5);
		--dry-tags-input-tag-font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		--dry-tags-input-font-size: var(--dry-type-small-size, var(--dry-text-base-size));
	}

	@container (max-width: 200px) {
		[data-part='root'] {
			grid-template-columns: 1fr;
		}
	}
</style>
