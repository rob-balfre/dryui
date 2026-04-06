<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import { getDateFieldCtx, type DateSegmentType } from './context.svelte.js';
	import { onMount } from 'svelte';

	interface Props extends HTMLAttributes<HTMLSpanElement> {
		type: DateSegmentType;
	}

	let { type, ...rest }: Props = $props();

	const ctx = getDateFieldCtx();

	let el: HTMLSpanElement;

	onMount(() => {
		ctx.registerSegment(type, el);
		return () => ctx.unregisterSegment(type);
	});

	const segmentData = $derived(ctx.segments.find((s) => s.type === type));

	const minValue = $derived(type === 'month' ? 1 : type === 'day' ? 1 : 1000);
	const maxValue = $derived(type === 'month' ? 12 : type === 'day' ? 31 : 9999);
	const placeholder = $derived(type === 'month' ? 'MM' : type === 'day' ? 'DD' : 'YYYY');

	const displayValue = $derived(
		segmentData?.value !== null && segmentData?.value !== undefined
			? type === 'year'
				? String(segmentData.value)
				: String(segmentData.value).padStart(2, '0')
			: placeholder
	);

	let inputBuffer = '';
	let bufferTimeout: ReturnType<typeof setTimeout>;

	function increment() {
		const current = segmentData?.value ?? minValue - 1;
		const next = current >= maxValue ? minValue : current + 1;
		ctx.updateSegment(type, next);
	}

	function decrement() {
		const current = segmentData?.value ?? maxValue + 1;
		const next = current <= minValue ? maxValue : current - 1;
		ctx.updateSegment(type, next);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (ctx.disabled) return;

		switch (e.key) {
			case 'ArrowUp': {
				e.preventDefault();
				increment();
				break;
			}
			case 'ArrowDown': {
				e.preventDefault();
				decrement();
				break;
			}
			case 'ArrowRight': {
				e.preventDefault();
				ctx.focusSegment(type, 'next');
				break;
			}
			case 'ArrowLeft': {
				e.preventDefault();
				ctx.focusSegment(type, 'prev');
				break;
			}
			case 'Tab':
				// Let default behavior handle tab
				break;
			case 'Backspace': {
				e.preventDefault();
				inputBuffer = '';
				ctx.updateSegment(type, minValue);
				break;
			}
			default: {
				if (/^\d$/.test(e.key)) {
					e.preventDefault();
					clearTimeout(bufferTimeout);
					inputBuffer += e.key;
					const num = parseInt(inputBuffer, 10);
					const maxDigits = type === 'year' ? 4 : 2;

					if (inputBuffer.length >= maxDigits || num > maxValue) {
						ctx.updateSegment(type, Math.min(Math.max(num, minValue), maxValue));
						inputBuffer = '';
						// Auto-advance to next segment
						if (type !== 'year') {
							ctx.focusSegment(type, 'next');
						}
					} else {
						ctx.updateSegment(type, num);
						bufferTimeout = setTimeout(() => {
							inputBuffer = '';
							if (type !== 'year') {
								ctx.focusSegment(type, 'next');
							}
						}, 750);
					}
				}
			}
		}
	}
</script>

<span
	bind:this={el}
	role="spinbutton"
	tabindex={ctx.disabled ? undefined : 0}
	aria-label={type}
	aria-valuemin={minValue}
	aria-valuemax={maxValue}
	aria-valuenow={segmentData?.value ?? undefined}
	aria-valuetext={displayValue}
	data-segment={type}
	data-placeholder={segmentData?.value === null ? '' : undefined}
	data-disabled={ctx.disabled || undefined}
	onkeydown={handleKeydown}
	{...rest}
>
	{displayValue}
</span>
