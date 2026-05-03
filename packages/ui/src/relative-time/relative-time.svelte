<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLTimeElement> {
		date: Date | string | number;
		locale?: string;
		updateInterval?: number;
	}

	let { date, locale = 'en', updateInterval = 60000, class: className, ...rest }: Props = $props();

	const dateObj = $derived(date instanceof Date ? date : new Date(date));
	let now = $state(Date.now());

	$effect(() => {
		const interval = setInterval(() => {
			now = Date.now();
		}, updateInterval);
		return () => clearInterval(interval);
	});

	const formatted = $derived(formatRelative(dateObj, now, locale));

	function formatRelative(date: Date, now: number, locale: string): string {
		const diff = now - date.getTime();
		const absDiff = Math.abs(diff);
		const sign = diff < 0 ? 1 : -1;

		const seconds = Math.floor(absDiff / 1000);
		const minutes = Math.floor(seconds / 60);
		const hours = Math.floor(minutes / 60);
		const days = Math.floor(hours / 24);
		const weeks = Math.floor(days / 7);
		const months = Math.floor(days / 30);
		const years = Math.floor(days / 365);

		const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

		if (seconds < 60) return rtf.format(sign * seconds, 'second');
		if (minutes < 60) return rtf.format(sign * minutes, 'minute');
		if (hours < 24) return rtf.format(sign * hours, 'hour');
		if (days < 7) return rtf.format(sign * days, 'day');
		if (weeks < 4) return rtf.format(sign * weeks, 'week');
		if (months < 12) return rtf.format(sign * months, 'month');
		return rtf.format(sign * years, 'year');
	}
</script>

<time
	class={className}
	datetime={dateObj.toISOString()}
	title={dateObj.toLocaleString(locale)}
	data-relative-time
	{...rest}
>
	{formatted}
</time>

<style>
	[data-relative-time] {
		color: var(--dry-relative-time-color, var(--dry-color-text-weak));
		font-size: var(--dry-relative-time-font-size, var(--dry-type-small-size));
		font-family: var(--dry-font-sans);
		font-variant-numeric: var(--dry-numeric-variant);
		line-height: var(--dry-type-small-leading);
	}
</style>
