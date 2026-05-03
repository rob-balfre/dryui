<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		observeInViewport,
		observePageVisibility,
		observeReducedMotionPreference
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		speed?: number;
		direction?: 'left' | 'right' | 'up' | 'down';
		pauseOnHover?: boolean;
		fade?: boolean;
		gap?: string;
		children: Snippet;
	}

	let {
		speed = 50,
		direction = 'left',
		pauseOnHover = false,
		fade = false,
		gap = '1rem',
		children,
		class: className,
		...rest
	}: Props = $props();

	let rootEl: HTMLDivElement | undefined = $state();
	let contentEl: HTMLDivElement | undefined = $state();
	let contentSize = $state(0);
	let prefersReducedMotion = $state(false);
	let onScreen = $state(true);
	let tabVisible = $state(true);

	const isVertical = $derived(direction === 'up' || direction === 'down');
	const duration = $derived(contentSize > 0 && speed > 0 ? contentSize / speed : 0);
	const paused = $derived(!onScreen || !tabVisible);

	$effect(() => {
		const unsubscribeMotion = observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		});
		const unsubscribeVisibility = observePageVisibility((visible) => {
			tabVisible = visible;
		});
		return () => {
			unsubscribeMotion();
			unsubscribeVisibility();
		};
	});

	$effect(() => {
		if (!rootEl) return;
		return observeInViewport(
			rootEl,
			(inView) => {
				onScreen = inView;
			},
			{ rootMargin: '200px' }
		);
	});

	$effect(() => {
		if (!contentEl) return;

		const el = contentEl;
		const measure = () => {
			contentSize = isVertical ? el.scrollHeight : el.scrollWidth;
		};

		measure();

		const observer = new ResizeObserver(measure);
		observer.observe(el);

		return () => observer.disconnect();
	});

	function applyRootStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--_marquee-duration', `${duration}s`);
			node.style.setProperty('--_marquee-gap', gap);
			node.style.setProperty('--_marquee-shift', `${contentSize}px`);
		});
	}

	function applyFlowDirection(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('--_flow', isVertical ? 'row' : 'column');
		});
	}
</script>

<div
	bind:this={rootEl}
	class={className}
	data-marquee
	data-direction={direction}
	data-pause-on-hover={pauseOnHover || undefined}
	data-fade={fade || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-paused={paused || undefined}
	use:applyRootStyles
	{...rest}
>
	<div data-marquee-track use:applyFlowDirection>
		<div data-marquee-content bind:this={contentEl} use:applyFlowDirection>
			{@render children()}
		</div>
		<div data-marquee-content aria-hidden="true" use:applyFlowDirection>
			{@render children()}
		</div>
	</div>
</div>

<style>
	[data-marquee] {
		/* Component tokens (Tier 3) */
		--dry-marquee-gap: var(--_marquee-gap, 1rem);
		--dry-marquee-speed: var(--_marquee-duration, 10s);

		overflow: hidden;
		position: relative;
		contain: content;
	}

	[data-marquee-track] {
		display: grid;
		grid-auto-flow: var(--_flow, column);
		animation-duration: var(--dry-marquee-speed);
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		backface-visibility: hidden;
	}

	[data-marquee]:not([data-paused]) [data-marquee-track] {
		will-change: transform;
	}

	[data-marquee-content] {
		display: grid;
		grid-auto-flow: var(--_flow, column);
		gap: var(--_marquee-gap, 1rem);
	}

	/* Trailing padding on content (not gap on track) keeps the keyframe loop seamless. */
	[data-marquee][data-direction='left'] [data-marquee-content],
	[data-marquee][data-direction='right'] [data-marquee-content] {
		padding-inline-end: var(--_marquee-gap, 1rem);
	}

	[data-marquee][data-direction='up'] [data-marquee-content],
	[data-marquee][data-direction='down'] [data-marquee-content] {
		padding-block-end: var(--_marquee-gap, 1rem);
	}

	[data-marquee][data-direction='left'] [data-marquee-track],
	[data-marquee][data-direction='right'] [data-marquee-track] {
		animation-name: marquee-horizontal;
	}

	[data-marquee][data-direction='up'] [data-marquee-track],
	[data-marquee][data-direction='down'] [data-marquee-track] {
		animation-name: marquee-vertical;
	}

	[data-marquee][data-direction='right'] [data-marquee-track],
	[data-marquee][data-direction='down'] [data-marquee-track] {
		animation-direction: reverse;
	}

	[data-marquee][data-pause-on-hover]:hover [data-marquee-track] {
		animation-play-state: paused;
	}

	[data-marquee][data-paused] [data-marquee-track] {
		animation-play-state: paused;
	}

	@keyframes marquee-horizontal {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(calc(-1 * var(--_marquee-shift, 0px)));
		}
	}

	@keyframes marquee-vertical {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(calc(-1 * var(--_marquee-shift, 0px)));
		}
	}

	[data-marquee][data-fade] {
		mask-image: linear-gradient(to right, transparent, black 8%, black 92%, transparent);
	}

	[data-marquee][data-fade][data-direction='up'],
	[data-marquee][data-fade][data-direction='down'] {
		mask-image: linear-gradient(to bottom, transparent, black 8%, black 92%, transparent);
	}

	[data-marquee][data-reduced-motion] [data-marquee-track] {
		animation-play-state: paused;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-marquee-track] {
			animation-play-state: paused;
		}
	}
</style>
