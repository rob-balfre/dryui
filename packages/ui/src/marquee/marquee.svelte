<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { observeReducedMotionPreference } from '@dryui/primitives/internal/motion';

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

	let contentEl: HTMLDivElement | undefined = $state();
	let contentSize = $state(0);
	let prefersReducedMotion = $state(false);

	const isVertical = $derived(direction === 'up' || direction === 'down');
	const duration = $derived(contentSize > 0 && speed > 0 ? contentSize / speed : 0);

	onMount(() =>
		observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
		})
	);

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
			node.style.setProperty('--marquee-duration', `${duration}s`);
			node.style.setProperty('--marquee-gap', gap);
		});
	}

	function applyTrackStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('grid-auto-flow', isVertical ? 'row' : 'column');
			node.style.setProperty('gap', 'var(--marquee-gap)');
		});
	}

	function applyContentStyles(node: HTMLElement) {
		$effect(() => {
			node.style.setProperty('grid-auto-flow', isVertical ? 'row' : 'column');
			node.style.setProperty('gap', 'var(--marquee-gap)');
		});
	}
</script>

<div
	class={className}
	data-marquee
	data-direction={direction}
	data-pause-on-hover={pauseOnHover || undefined}
	data-fade={fade || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	use:applyRootStyles
	{...rest}
>
	<div data-marquee-track use:applyTrackStyles>
		<div data-marquee-content bind:this={contentEl} use:applyContentStyles>
			{@render children()}
		</div>
		<div data-marquee-content aria-hidden="true" use:applyContentStyles>
			{@render children()}
		</div>
	</div>
</div>

<style>
	[data-marquee] {
		/* Component tokens (Tier 3) */
		--dry-marquee-gap: var(--marquee-gap, 1rem);
		--dry-marquee-speed: var(--marquee-duration, 10s);

		overflow: hidden;
		position: relative;
	}

	[data-marquee-track] {
		display: grid;
		animation-duration: var(--dry-marquee-speed);
		animation-timing-function: linear;
		animation-iteration-count: infinite;
		will-change: transform;
	}

	[data-marquee-content] {
		display: grid;
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

	@keyframes marquee-horizontal {
		from {
			transform: translateX(0);
		}
		to {
			transform: translateX(-50%);
		}
	}

	@keyframes marquee-vertical {
		from {
			transform: translateY(0);
		}
		to {
			transform: translateY(-50%);
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
