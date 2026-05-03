<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		value: number | string;
		stable?: boolean;
		align?: 'start' | 'center' | 'end';
		minDigits?: number;
	}

	let {
		value,
		stable = false,
		align = 'end',
		minDigits,
		class: className,
		...rest
	}: Props = $props();

	const minWidth = $derived.by(() => {
		if (!stable) return undefined;
		const digits = minDigits ?? String(value).replace(/[^\d]/g, '').length;
		return `${digits * 0.6}em`;
	});

	let el = $state<HTMLSpanElement>();

	$effect(() => {
		if (!el) return;
		if (minWidth) {
			el.style.setProperty('min-width', minWidth);
		} else {
			el.style.removeProperty('min-width');
		}
	});
</script>

<span
	bind:this={el}
	class={['dry-numeric dry-tabular-nums', className]}
	data-align={align}
	{...rest}
>
	{value}
</span>

<style>
	.dry-numeric {
		display: inline-block;
		font-variant-numeric: var(--dry-numeric-variant);
	}

	[data-align='end'] {
		text-align: end;
	}

	[data-align='center'] {
		text-align: center;
	}

	[data-align='start'] {
		text-align: start;
	}
</style>
