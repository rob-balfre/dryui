<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: number;
		locale?: string;
		unit?: 'byte' | 'bit';
		display?: 'short' | 'long' | 'narrow';
	}

	let {
		value,
		locale = 'en',
		unit: unitType = 'byte',
		display = 'short',
		class: className,
		...rest
	}: Props = $props();

	const units = $derived(
		unitType === 'byte'
			? ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte', 'petabyte']
			: ['bit', 'kilobit', 'megabit', 'gigabit', 'terabit', 'petabit']
	);

	const formatted = $derived(
		(() => {
			if (value === 0)
				return new Intl.NumberFormat(locale, {
					style: 'unit',
					unit: units[0],
					unitDisplay: display
				}).format(0);
			const base = unitType === 'byte' ? 1024 : 1000;
			const exp = Math.min(
				Math.floor(Math.log(Math.abs(value)) / Math.log(base)),
				units.length - 1
			);
			const val = value / Math.pow(base, exp);
			return new Intl.NumberFormat(locale, {
				style: 'unit',
				unit: units[exp],
				unitDisplay: display,
				maximumFractionDigits: exp === 0 ? 0 : 1
			}).format(val);
		})()
	);
</script>

<span data-format-bytes class={className} {...rest}>{formatted}</span>

<style>
	[data-format-bytes] {
		color: var(--dry-format-bytes-color, var(--dry-color-text-weak));
		font-size: var(--dry-format-bytes-font-size, var(--dry-type-small-size));
		font-family: var(--dry-font-sans);
		font-variant-numeric: tabular-nums;
		line-height: var(--dry-type-small-leading);
	}
</style>
