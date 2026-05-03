<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: number;
		locale?: string;
		type?: 'decimal' | 'currency' | 'percent' | 'unit';
		currency?: string;
		unit?: string;
		notation?: 'standard' | 'scientific' | 'engineering' | 'compact';
		minimumFractionDigits?: number;
		maximumFractionDigits?: number;
		minimumIntegerDigits?: number;
		minimumSignificantDigits?: number;
		maximumSignificantDigits?: number;
	}

	let {
		value,
		locale = 'en',
		type: numberStyle = 'decimal',
		currency,
		unit,
		notation,
		minimumFractionDigits,
		maximumFractionDigits,
		minimumIntegerDigits,
		minimumSignificantDigits,
		maximumSignificantDigits,
		class: className,
		...rest
	}: Props = $props();

	const formatted = $derived(
		new Intl.NumberFormat(locale, {
			style: numberStyle,
			...(currency && { currency }),
			...(unit && { unit }),
			...(notation && { notation }),
			...(minimumFractionDigits != null && { minimumFractionDigits }),
			...(maximumFractionDigits != null && { maximumFractionDigits }),
			...(minimumIntegerDigits != null && { minimumIntegerDigits }),
			...(minimumSignificantDigits != null && { minimumSignificantDigits }),
			...(maximumSignificantDigits != null && { maximumSignificantDigits })
		}).format(value)
	);
</script>

<span class={className} data-format-number {...rest}>{formatted}</span>

<style>
	[data-format-number] {
		color: var(--dry-format-number-color, var(--dry-color-text-weak));
		font-size: var(--dry-format-number-font-size, var(--dry-type-small-size));
		font-family: var(--dry-font-sans);
		font-variant-numeric: tabular-nums;
		line-height: var(--dry-type-small-leading);
	}
</style>
