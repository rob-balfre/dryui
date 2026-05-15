<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeInViewport,
		observePageVisibility,
		observeReducedMotionPreference,
		supportsPointerTracking
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		colors?: readonly [string, string, string, string];
		speed?: 'slow' | 'normal' | 'fast' | number;
		interactive?: boolean;
		children: Snippet;
	}

	let {
		colors,
		speed = 'normal',
		interactive = false,
		children: childSnippet,
		class: className,
		style,
		...rest
	}: Props = $props();

	let element = $state<HTMLDivElement>();
	let prefersReducedMotion = $state(false);
	let animated = $state(false);
	let onScreen = $state(true);
	let tabVisible = $state(true);
	const paused = $derived(!onScreen || !tabVisible);
	let pointerX = $state('50%');
	let pointerY = $state('50%');
	let pointerFrame = $state<number | null>(null);
	let pendingPointerX = '50%';
	let pendingPointerY = '50%';

	const speedDuration = $derived.by(() => {
		if (typeof speed === 'number' && Number.isFinite(speed) && speed > 0) {
			return `${(12 / speed).toFixed(2)}s`;
		}
		if (speed === 'fast') return '8s';
		if (speed === 'slow') return '20s';
		return '12s';
	});

	function flushPointerPosition() {
		pointerFrame = null;
		pointerX = pendingPointerX;
		pointerY = pendingPointerY;
	}

	function queuePointerPosition(nextX: string, nextY: string) {
		pendingPointerX = nextX;
		pendingPointerY = nextY;

		if (pointerFrame !== null) return;

		pointerFrame = requestAnimationFrame(() => {
			flushPointerPosition();
		});
	}

	function cancelQueuedPointerPosition() {
		if (pointerFrame === null) return;
		cancelAnimationFrame(pointerFrame);
		pointerFrame = null;
	}

	function handlePointerMove(event: PointerEvent) {
		if (!interactive || prefersReducedMotion || !element || !supportsPointerTracking()) return;
		const rect = element.getBoundingClientRect();
		queuePointerPosition(
			`${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`,
			`${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`
		);
	}

	function handlePointerLeave() {
		cancelQueuedPointerPosition();
		pendingPointerX = '50%';
		pendingPointerY = '50%';
		pointerX = '50%';
		pointerY = '50%';
	}

	$effect(() => {
		const updateAnimatedState = (matches: boolean) => {
			prefersReducedMotion = matches;
			animated = !matches;
		};

		const stopMotionObserver = observeReducedMotionPreference(updateAnimatedState);
		const stopVisibility = observePageVisibility((visible) => {
			tabVisible = visible;
		});
		let stopViewport = () => {};
		if (element) {
			stopViewport = observeInViewport(
				element,
				(inView) => {
					onScreen = inView;
				},
				{ rootMargin: '200px' }
			);
		}

		animated = !getReducedMotionPreference();

		return () => {
			cancelQueuedPointerPosition();
			stopMotionObserver();
			stopVisibility();
			stopViewport();
		};
	});

	$effect(() => {
		if (!element) return;
		element.style.cssText = style || '';
		if (colors) {
			for (let i = 0; i < 4; i++) {
				const value = colors[i];
				const prop = `--dry-mesh-color-${i + 1}`;
				if (value) element.style.setProperty(prop, value);
				else element.style.removeProperty(prop);
			}
		}
		element.style.setProperty('--dry-mesh-duration', speedDuration);
		element.style.setProperty('--dry-mesh-pointer-x', pointerX);
		element.style.setProperty('--dry-mesh-pointer-y', pointerY);
	});
</script>

<div
	bind:this={element}
	class={className}
	data-gradient-mesh
	data-animated={animated || undefined}
	data-interactive={interactive || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	data-paused={paused || undefined}
	onpointermove={interactive ? handlePointerMove : undefined}
	onpointerleave={interactive ? handlePointerLeave : undefined}
	{...rest}
>
	{#if childSnippet}
		<div data-gradient-mesh-content>
			{@render childSnippet()}
		</div>
	{/if}
</div>

<style>
	[data-gradient-mesh] {
		--dry-mesh-duration: 12s;
		--dry-mesh-pointer-x: 50%;
		--dry-mesh-pointer-y: 50%;
		--dry-mesh-origin-1: 18% 18%;
		--dry-mesh-origin-2: 82% 18%;
		--dry-mesh-origin-3: 72% 82%;
		--dry-mesh-origin-4: 18% 78%;
		--dry-mesh-base: linear-gradient(
			135deg,
			var(--dry-mesh-color-4, #4ade80) 0%,
			var(--dry-mesh-color-1, #7b68ee) 34%,
			var(--dry-mesh-color-2, #38bdf8) 68%,
			var(--dry-mesh-color-3, #f472b6) 100%
		);

		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: inherit;
		background:
			radial-gradient(
				ellipse 80% 70% at var(--dry-mesh-origin-1),
				var(--dry-mesh-color-1, #7b68ee) 0%,
				transparent 68%
			),
			radial-gradient(
				ellipse 70% 68% at var(--dry-mesh-origin-2),
				var(--dry-mesh-color-2, #38bdf8) 0%,
				transparent 70%
			),
			radial-gradient(
				ellipse 78% 62% at var(--dry-mesh-origin-3),
				var(--dry-mesh-color-3, #f472b6) 0%,
				transparent 70%
			),
			radial-gradient(
				ellipse 72% 66% at var(--dry-mesh-origin-4),
				var(--dry-mesh-color-4, #4ade80) 0%,
				transparent 72%
			),
			var(--dry-mesh-base);
		background:
			radial-gradient(
				ellipse 80% 70% at var(--dry-mesh-origin-1),
				color-mix(in srgb, var(--dry-mesh-color-1, #7b68ee) 86%, transparent) 0%,
				transparent 68%
			),
			radial-gradient(
				ellipse 70% 68% at var(--dry-mesh-origin-2),
				color-mix(in srgb, var(--dry-mesh-color-2, #38bdf8) 82%, transparent) 0%,
				transparent 70%
			),
			radial-gradient(
				ellipse 78% 62% at var(--dry-mesh-origin-3),
				color-mix(in srgb, var(--dry-mesh-color-3, #f472b6) 84%, transparent) 0%,
				transparent 70%
			),
			radial-gradient(
				ellipse 72% 66% at var(--dry-mesh-origin-4),
				color-mix(in srgb, var(--dry-mesh-color-4, #4ade80) 84%, transparent) 0%,
				transparent 72%
			),
			var(--dry-mesh-base);
		background-size:
			130% 130%,
			125% 125%,
			135% 130%,
			125% 130%,
			100% 100%;
		background-position:
			0% 8%,
			100% 0%,
			90% 100%,
			0% 92%,
			center;
	}

	[data-gradient-mesh][data-animated] {
		animation: mesh-cycle var(--dry-mesh-duration) ease-in-out infinite alternate;
	}

	[data-gradient-mesh][data-animated]:not([data-paused]) {
		will-change: background-position;
	}

	[data-gradient-mesh][data-animated][data-paused] {
		animation-play-state: paused;
	}

	[data-gradient-mesh][data-interactive] {
		--dry-mesh-origin-1: var(--dry-mesh-pointer-x) var(--dry-mesh-pointer-y);
	}

	[data-gradient-mesh][data-reduced-motion] {
		animation: none;
	}

	[data-gradient-mesh-content] {
		position: relative;
		z-index: 1;
	}

	@keyframes mesh-cycle {
		0% {
			background-position:
				0% 8%,
				100% 0%,
				90% 100%,
				0% 92%,
				center;
		}

		50% {
			background-position:
				12% 18%,
				88% 14%,
				100% 82%,
				14% 100%,
				center;
		}

		100% {
			background-position:
				8% 0%,
				96% 18%,
				82% 94%,
				6% 84%,
				center;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-gradient-mesh] {
			animation: none;
		}
	}
</style>
