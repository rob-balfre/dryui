<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference
	} from '@dryui/primitives/internal/motion';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		shape?: 'circle' | 'linear' | 'diagonal' | 'diamond';
		direction?: 'in' | 'out';
		once?: boolean;
		threshold?: number;
		duration?: number;
		children: Snippet;
	}

	let {
		shape = 'circle',
		direction = 'in',
		once = true,
		threshold = 0.18,
		duration,
		children: childSnippet,
		class: className,
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

	function applyDuration(node: HTMLDivElement) {
		$effect(() => {
			if (typeof duration === 'number') {
				node.style.setProperty('--dry-mask-reveal-duration', `${Math.max(0, duration)}ms`);
			} else {
				node.style.removeProperty('--dry-mask-reveal-duration');
			}
		});
	}

	onMount(() => {
		const stopMotionObserver = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
			if (matches) revealed = true;
		});

		if (getReducedMotionPreference()) {
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
	{@attach applyDuration}
	class={className}
	data-mask-reveal
	data-shape={shape}
	data-direction={direction}
	data-revealed={revealed || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	{...rest}
>
	{#if childSnippet}
		{@render childSnippet()}
	{/if}
</div>

<style>
	[data-mask-reveal] {
		--dry-mask-reveal-duration: var(--dry-duration-entrance, 480ms);
		--dry-mask-reveal-ease: var(--dry-ease-spring-snappy, cubic-bezier(0.16, 1, 0.3, 1));
		--dry-mask-reveal-size: 0%;

		display: block;
		overflow: hidden;
	}

	/* Circle shape */
	[data-mask-reveal][data-shape='circle'] {
		mask-image: radial-gradient(
			circle,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
		-webkit-mask-image: radial-gradient(
			circle,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
	}

	/* Linear shape */
	[data-mask-reveal][data-shape='linear'] {
		mask-image: linear-gradient(
			to top,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
		-webkit-mask-image: linear-gradient(
			to top,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
	}

	/* Diagonal shape */
	[data-mask-reveal][data-shape='diagonal'] {
		mask-image: linear-gradient(
			to top right,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
		-webkit-mask-image: linear-gradient(
			to top right,
			black var(--dry-mask-reveal-size),
			transparent var(--dry-mask-reveal-size)
		);
	}

	/* Diamond shape */
	[data-mask-reveal][data-shape='diamond'] {
		mask-image: none;
		-webkit-mask-image: none;
		clip-path: polygon(
			50% calc(50% - var(--dry-mask-reveal-size)),
			calc(50% + var(--dry-mask-reveal-size)) 50%,
			50% calc(50% + var(--dry-mask-reveal-size)),
			calc(50% - var(--dry-mask-reveal-size)) 50%
		);
	}

	/* Revealed state */
	[data-mask-reveal][data-revealed] {
		--dry-mask-reveal-size: 150%;
		transition: --dry-mask-reveal-size var(--dry-mask-reveal-duration) var(--dry-mask-reveal-ease);
	}

	/* Diamond revealed */
	[data-mask-reveal][data-shape='diamond'][data-revealed] {
		clip-path: polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%);
		transition: clip-path var(--dry-mask-reveal-duration) var(--dry-mask-reveal-ease);
	}

	/* Direction: out */
	[data-mask-reveal][data-direction='out'] {
		--dry-mask-reveal-size: 150%;
	}

	[data-mask-reveal][data-direction='out'][data-revealed] {
		--dry-mask-reveal-size: 0%;
	}

	[data-mask-reveal][data-direction='out'][data-shape='diamond'] {
		clip-path: polygon(50% -50%, 150% 50%, 50% 150%, -50% 50%);
	}

	[data-mask-reveal][data-direction='out'][data-shape='diamond'][data-revealed] {
		clip-path: polygon(50% 50%, 50% 50%, 50% 50%, 50% 50%);
	}

	/* Reduced motion */
	[data-mask-reveal][data-reduced-motion] {
		mask-image: none;
		-webkit-mask-image: none;
		clip-path: none;
		transition: none;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-mask-reveal] {
			mask-image: none;
			-webkit-mask-image: none;
			clip-path: none;
			transition: none;
		}
	}
</style>
