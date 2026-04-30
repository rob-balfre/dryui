<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		supportsIntersectionObservers
	} from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		shape?: 'circle' | 'linear' | 'diagonal' | 'diamond';
		direction?: 'in' | 'out';
		once?: boolean;
		threshold?: number;
		duration?: number;
		children?: Snippet;
	}

	let {
		shape = 'circle',
		direction = 'in',
		once = true,
		threshold = 0.18,
		duration,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let revealed = $state(false);
	let prefersReducedMotion = $state(false);

	function captureElement(node: HTMLDivElement) {
		element = node;
		return {
			destroy() {
				if (element === node) element = null;
			}
		};
	}

	function toDuration(value: number | undefined): string | undefined {
		return typeof value === 'number' ? `${Math.max(0, value)}ms` : undefined;
	}

	const durationValue = $derived(toDuration(duration));

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			if (durationValue) node.style.setProperty('--dry-mask-reveal-duration', durationValue);
		});
	}

	$effect(() => {
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
			if (matches) revealed = true;
		});

		if (!supportsIntersectionObservers() || getReducedMotionPreference()) {
			revealed = true;
			return stopMotionObserver;
		}

		const current = element;
		if (!current) {
			revealed = true;
			return stopMotionObserver;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) return;

				if (entry.isIntersecting) {
					revealed = true;
					if (once) {
						observer.unobserve(current);
					}
					return;
				}

				if (!once) {
					revealed = false;
				}
			},
			{ threshold }
		);

		observer.observe(current);

		return () => {
			observer.disconnect();
			stopMotionObserver();
		};
	});
</script>

<div
	{@attach captureElement}
	class={['mask-reveal', className]}
	data-shape={shape}
	data-direction={direction}
	data-revealed={revealed || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
	use:applyStyles
>
	{@render children?.()}
</div>

<style>
	.mask-reveal {
		display: block;
	}
</style>
