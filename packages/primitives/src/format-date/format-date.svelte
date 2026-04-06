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

<time datetime={dateObj.toISOString()} {...rest}>{formatted}</time>
