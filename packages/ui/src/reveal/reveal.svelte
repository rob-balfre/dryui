<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		supportsIntersectionObservers
	} from '@dryui/primitives/internal/motion';
	import type { BlendMode } from '@dryui/primitives/reveal';

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
		children: childSnippet,
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
				if (element === node) element = null;
			}
		};
	}

	function toDuration(value: number | undefined): string | undefined {
		return typeof value === 'number' ? `${Math.max(0, value)}ms` : undefined;
	}

	function toDistance(value: number | string | undefined): string | undefined {
		if (typeof value === 'number') return `${Math.max(0, value)}px`;
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
			node.style.setProperty('--_blend-mode', blendMode ?? 'normal');
		});
	}

	onMount(() => {
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
			if (matches) visible = true;
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
					if (once) observer.unobserve(current);
					return;
				}

				if (!once) visible = false;
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
	{@attach applyStyles}
	class={className}
	data-reveal
	data-variant={variant}
	data-visible={visible || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
>
	{@render childSnippet()}
</div>

<style>
	[data-reveal] {
		--dry-reveal-distance: var(--dry-motion-distance-sm, 0.75rem);
		--dry-reveal-delay: 0ms;
		--dry-reveal-duration: var(--dry-duration-entrance, 480ms);
		--dry-reveal-ease: cubic-bezier(0.16, 1, 0.3, 1);
		--dry-reveal-hidden-opacity: var(--dry-motion-opacity-enter, 0);
		--dry-reveal-hidden-scale: 1;
		--dry-reveal-hidden-blur: 0px;
		--dry-reveal-offset-y: 0px;
		--dry-reveal-mask-top: 0%;
		--dry-reveal-mask-radius: 0px;
		--_blend-mode: normal;

		display: block;
		mix-blend-mode: var(--_blend-mode);
		opacity: var(--dry-reveal-hidden-opacity);
		transform: translate3d(0, var(--dry-reveal-offset-y), 0) scale(var(--dry-reveal-hidden-scale));
		filter: blur(var(--dry-reveal-hidden-blur));
		clip-path: inset(var(--dry-reveal-mask-top) 0 0 0 round var(--dry-reveal-mask-radius));
		transition-property: opacity, transform, filter, clip-path;
		transition-duration: var(--dry-reveal-duration);
		transition-timing-function: var(--dry-reveal-ease);
		transition-delay: var(--dry-reveal-delay);
	}

	[data-reveal][data-variant='fade'] {
		will-change: opacity;
	}

	[data-reveal][data-variant='slide-up'] {
		will-change: opacity, transform;
		--dry-reveal-offset-y: var(--dry-reveal-distance);
	}

	[data-reveal][data-variant='scale-in'] {
		will-change: opacity, transform;
		--dry-reveal-hidden-scale: var(--dry-motion-scale-enter, 0.96);
	}

	[data-reveal][data-variant='blur-up'] {
		will-change: opacity, transform, filter;
		--dry-reveal-hidden-scale: 0.985;
		--dry-reveal-hidden-blur: var(--dry-motion-blur-enter, 16px);
		--dry-reveal-offset-y: calc(var(--dry-reveal-distance) * 0.5);
	}

	[data-reveal][data-variant='mask-up'] {
		will-change: clip-path, transform;
		--dry-reveal-hidden-opacity: 1;
		--dry-reveal-offset-y: calc(var(--dry-reveal-distance) * 0.35);
		--dry-reveal-mask-top: 100%;
		--dry-reveal-mask-radius: var(--dry-radius-xl, 12px);
		transition-property: clip-path, transform;
		transition-duration: var(--dry-reveal-duration), calc(var(--dry-reveal-duration) * 1.1);
		transition-timing-function: ease-in-out, cubic-bezier(0.16, 1, 0.3, 1);
	}

	[data-reveal][data-visible] {
		opacity: 1;
		transform: translate3d(0, 0, 0) scale(1);
		filter: blur(0);
		clip-path: inset(0 0 0 0 round var(--dry-reveal-mask-radius));
	}

	[data-reveal][data-reduced-motion] {
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-reveal] {
			transition: none;
		}
	}
</style>
