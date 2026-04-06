<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTimeElement> {
		date: Date | string | number;
		locale?: string;
		weekday?: 'long' | 'short' | 'narrow';
		era?: 'long' | 'short' | 'narrow';
		year?: 'numeric' | '2-digit';
		month?: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow';
		day?: 'numeric' | '2-digit';
		hour?: 'numeric' | '2-digit';
		minute?: 'numeric' | '2-digit';
		second?: 'numeric' | '2-digit';
		timeZoneName?: 'long' | 'short';
		timeZone?: string;
		hourCycle?: 'h11' | 'h12' | 'h23' | 'h24';
		dateStyle?: 'full' | 'long' | 'medium' | 'short';
		timeStyle?: 'full' | 'long' | 'medium' | 'short';
	}

	let {
		date,
		locale = 'en',
		weekday,
		era,
		year,
		month,
		day,
		hour,
		minute,
		second,
		timeZoneName,
		timeZone,
		hourCycle,
		dateStyle,
		timeStyle,
		class: className,
		...rest
	}: Props = $props();

	const dateObj = $derived(date instanceof Date ? date : new Date(date));

	const options = $derived({
		...(weekday && { weekday }),
		...(era && { era }),
		...(year && { year }),
		...(month && { month }),
		...(day && { day }),
		...(hour && { hour }),
		...(minute && { minute }),
		...(second && { second }),
		...(timeZoneName && { timeZoneName }),
		...(timeZone && { timeZone }),
		...(hourCycle && { hourCycle }),
		...(dateStyle && { dateStyle }),
		...(timeStyle && { timeStyle })
	} as Intl.DateTimeFormatOptions);

	const formatted = $derived(
		new Intl.DateTimeFormat(
			locale,
			Object.keys(options).length > 0 ? options : { dateStyle: 'medium' }
		).format(dateObj)
	);
</script>

<time class={className} datetime={dateObj.toISOString()} data-format-date {...rest}
	>{formatted}</time
>

<style>
	[data-format-date] {
		/* Component tokens (Tier 3) */
		--dry-format-date-color: var(--dry-color-text-weak);
		--dry-format-date-font-size: var(--dry-type-small-size);

		color: var(--dry-format-date-color);
		font-size: var(--dry-format-date-font-size);
		font-family: var(--dry-font-sans);
		line-height: var(--dry-type-small-leading);
	}
</style>
