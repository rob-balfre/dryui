<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		supportsIntersectionObservers
	} from '../internal/motion.js';
	import type { BlendMode } from '../internal/blend-modes.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		variant?: 'fade' | 'slide-up' | 'scale-in' | 'blur-up' | 'mask-up';
		once?: boolean;
		threshold?: number;
		delay?: number;
		duration?: number;
		distance?: number | string;
		blendMode?: BlendMode;
		children: Snippet;
	}

	let {
		variant = 'fade',
		once = true,
		threshold = 0.18,
		delay,
		duration,
		distance,
		blendMode,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let visible = $state(false);
	let prefersReducedMotion = $state(false);

	function captureElement(node: HTMLDivElement) {
		element = node;

		return {
			destroy() {
				if (element === node) {
					element = null;
				}
			}
		};
	}

	function toDuration(value: number | undefined): string | undefined {
		return typeof value === 'number' ? `${Math.max(0, value)}ms` : undefined;
	}

	function toDistance(value: number | string | undefined): string | undefined {
		if (typeof value === 'number') {
			return `${Math.max(0, value)}px`;
		}

		return typeof value === 'string' ? value : undefined;
	}

	const delayValue = $derived(toDuration(delay));
	const durationValue = $derived(toDuration(duration));
	const distanceValue = $derived(toDistance(distance));

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			if (delayValue) node.style.setProperty('--dry-reveal-delay', delayValue);
			if (durationValue) node.style.setProperty('--dry-reveal-duration', durationValue);
			if (distanceValue) node.style.setProperty('--dry-reveal-distance', distanceValue);
			node.style.setProperty('mix-blend-mode', blendMode ?? '');
		});
	}

	$effect(() => {
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
			if (matches) {
				visible = true;
			}
		});

		if (!supportsIntersectionObservers() || getReducedMotionPreference()) {
			visible = true;
			return stopMotionObserver;
		}

		const current = element;
		if (!current) {
			visible = true;
			return stopMotionObserver;
		}

		const observer = new IntersectionObserver(
			(entries) => {
				const entry = entries[0];
				if (!entry) return;

				if (entry.isIntersecting) {
					visible = true;
					if (once) {
						observer.unobserve(current);
					}
					return;
				}

				if (!once) {
					visible = false;
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
	class={['reveal', className]}
	data-variant={variant}
	data-visible={visible || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
	use:applyStyles
>
	{@render children()}
</div>

<style>
	.reveal {
		display: block;
	}
</style>
