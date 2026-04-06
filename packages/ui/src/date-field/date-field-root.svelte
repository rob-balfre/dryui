<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { setDateFieldCtx, getLocaleFormat, type DateSegmentType } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		value?: Date | null;
		name?: string;
		locale?: string;
		min?: Date | null;
		max?: Date | null;
		disabled?: boolean;
		size?: 'sm' | 'md' | 'lg';
		children: Snippet;
	}

	let {
		value = $bindable<Date | null>(null),
		name,
		locale = 'en-US',
		min = null,
		max = null,
		disabled = false,
		children,
		class: className,
		size = 'md',
		...rest
	}: Props = $props();

	let month = $state<number | null>(value ? value.getMonth() + 1 : null);
	let day = $state<number | null>(value ? value.getDate() : null);
	let year = $state<number | null>(value ? value.getFullYear() : null);

	// Sync from value prop
	$effect(() => {
		if (value) {
			month = value.getMonth() + 1;
			day = value.getDate();
			year = value.getFullYear();
		}
	});

	function tryBuildDate() {
		if (month !== null && day !== null && year !== null && year >= 1000) {
			const d = new Date(year, month - 1, day);
			if (d.getMonth() === month - 1 && d.getDate() === day) {
				value = d;
			}
		}
	}

	const localeFormat = $derived(getLocaleFormat(locale));

	const segments = $derived(
		localeFormat.order.map((type) => ({
			type,
			value: type === 'month' ? month : type === 'day' ? day : year
		}))
	);

	function serializeDateValue(date: Date | null): string {
		if (!date) return '';

		const year = String(date.getFullYear());
		const monthValue = String(date.getMonth() + 1).padStart(2, '0');
		const dayValue = String(date.getDate()).padStart(2, '0');

		return `${year}-${monthValue}-${dayValue}`;
	}

	// Segment element registry for index-based navigation
	const segmentElements = new Map<DateSegmentType, HTMLElement>();

	setDateFieldCtx({
		get value() {
			return value;
		},
		get locale() {
			return locale;
		},
		get min() {
			return min;
		},
		get max() {
			return max;
		},
		get disabled() {
			return disabled;
		},
		get segmentOrder() {
			return localeFormat.order;
		},
		get separator() {
			return localeFormat.separator;
		},
		get segments() {
			return segments;
		},
		updateSegment(type: DateSegmentType, val: number) {
			if (type === 'month') month = val;
			else if (type === 'day') day = val;
			else if (type === 'year') year = val;
			tryBuildDate();
		},
		registerSegment(type: DateSegmentType, el: HTMLElement) {
			segmentElements.set(type, el);
		},
		unregisterSegment(type: DateSegmentType) {
			segmentElements.delete(type);
		},
		focusSegment(type: DateSegmentType, direction: 'next' | 'prev') {
			const order = localeFormat.order;
			const idx = order.indexOf(type);
			const targetIdx = direction === 'next' ? idx + 1 : idx - 1;
			if (targetIdx >= 0 && targetIdx < order.length) {
				const targetType = order[targetIdx]!;
				const el = segmentElements.get(targetType);
				el?.focus();
			}
		}
	});
</script>

<div
	role="group"
	aria-label="Date"
	data-disabled={disabled || undefined}
	{...rest}
	class={className}
>
	{@render children()}

	{#if name}
		<input
			type="hidden"
			{name}
			value={serializeDateValue(value)}
			disabled={disabled || undefined}
		/>
	{/if}
</div>

<style>
	[data-df-wrapper] {
		container-type: inline-size;
		display: grid;
	}

	[data-df-root] {
		--dry-df-bg: var(--dry-color-bg-raised);
		--dry-df-border: var(--dry-color-stroke-strong);
		--dry-df-color: var(--dry-color-text-strong);
		--dry-df-radius: var(--dry-radius-md);
		--dry-df-padding-x: var(--dry-space-3);
		--dry-df-padding-y: var(--dry-space-2);
		--dry-df-font-size: var(--dry-type-small-size);

		display: inline-grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		padding: var(--dry-df-padding-y) var(--dry-df-padding-x);
		font-size: var(--dry-df-font-size);
		line-height: var(--dry-type-small-leading);
		font-family: var(--dry-font-sans);
		color: var(--dry-df-color);
		background: var(--dry-df-bg);
		border: 1px solid var(--dry-df-border);
		border-radius: var(--dry-df-radius);
		box-sizing: border-box;
		transition:
			border-color var(--dry-duration-fast) var(--dry-ease-default),
			box-shadow var(--dry-duration-fast) var(--dry-ease-default);
	}

	[data-df-root]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-strong);
	}

	[data-df-root]:focus-within:not([data-disabled]) {
		outline: 2px solid var(--dry-color-stroke-focus);
		outline-offset: -1px;
		border-color: var(--dry-color-stroke-focus);
	}

	[data-df-root][data-disabled] {
		--dry-df-bg: var(--dry-color-bg-sunken);
		--dry-df-border: var(--dry-color-stroke-disabled);
		--dry-df-color: var(--dry-color-text-disabled);
		cursor: not-allowed;
	}

	[data-df-root][aria-invalid='true'],
	[data-df-root][data-invalid] {
		--dry-df-bg: var(--dry-color-fill-error-weak);
		--dry-df-border: var(--dry-color-stroke-error);
		--dry-df-color: var(--dry-color-text-error);
	}

	[data-df-root][aria-invalid='true']:hover:not([data-disabled]),
	[data-df-root][data-invalid]:hover:not([data-disabled]) {
		border-color: var(--dry-color-stroke-error);
	}

	[data-df-root][aria-invalid='true']:focus-within,
	[data-df-root][data-invalid]:focus-within {
		outline-color: var(--dry-color-stroke-error);
		border-color: var(--dry-color-stroke-error);
	}

	/* ── Size variants ──────────────────────────────────────────────────── */

	[data-df-root][data-size='sm'] {
		--dry-df-padding-x: var(--dry-space-2);
		--dry-df-padding-y: var(--dry-space-1);
		--dry-df-font-size: var(--dry-type-tiny-size);
		line-height: var(--dry-type-tiny-leading);
	}

	[data-df-root][data-size='md'] {
		--dry-df-padding-x: var(--dry-space-3);
		--dry-df-padding-y: var(--dry-space-2);
		--dry-df-font-size: var(--dry-type-small-size);
		line-height: var(--dry-type-small-leading);
	}

	[data-df-root][data-size='lg'] {
		--dry-df-padding-x: var(--dry-space-4);
		--dry-df-padding-y: var(--dry-space-2_5);
		--dry-df-font-size: var(--dry-type-heading-4-size);
		line-height: var(--dry-type-heading-4-leading);
	}

	@container (max-width: 200px) {
		[data-df-root] {
			--dry-df-padding-x: var(--dry-space-2);
		}
	}
</style>
