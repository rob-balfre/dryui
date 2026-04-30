<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeInViewport,
		observePageVisibility,
		observeReducedMotionPreference,
		registerPropertyOnce,
		supportsPropertyRegistration,
		supportsPointerTracking
	} from '@dryui/primitives';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		colors?: readonly [string, string, string, string];
		speed?: 'slow' | 'normal' | 'fast' | number;
		interactive?: boolean;
		children: Snippet;
	}

	let {
		colors = ['#7b68ee', '#38bdf8', '#f472b6', '#4ade80'] as const,
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
		registerPropertyOnce({
			name: '--dry-mesh-color-1',
			syntax: '<color>',
			inherits: false,
			initialValue: '#7b68ee'
		});
		registerPropertyOnce({
			name: '--dry-mesh-color-2',
			syntax: '<color>',
			inherits: false,
			initialValue: '#38bdf8'
		});
		registerPropertyOnce({
			name: '--dry-mesh-color-3',
			syntax: '<color>',
			inherits: false,
			initialValue: '#f472b6'
		});
		registerPropertyOnce({
			name: '--dry-mesh-color-4',
			syntax: '<color>',
			inherits: false,
			initialValue: '#4ade80'
		});

		const updateAnimatedState = (matches: boolean) => {
			prefersReducedMotion = matches;
			animated = !matches && supportsPropertyRegistration();
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

		if (!supportsPropertyRegistration() || getReducedMotionPreference()) {
			animated = false;
		} else {
			animated = true;
		}

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
		element.style.setProperty('--dry-mesh-color-1', colors[0]);
		element.style.setProperty('--dry-mesh-color-2', colors[1]);
		element.style.setProperty('--dry-mesh-color-3', colors[2]);
		element.style.setProperty('--dry-mesh-color-4', colors[3]);
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
		--dry-mesh-color-1: #7b68ee;
		--dry-mesh-color-2: #38bdf8;
		--dry-mesh-color-3: #f472b6;
		--dry-mesh-color-4: #4ade80;
		--dry-mesh-pointer-x: 50%;
		--dry-mesh-pointer-y: 50%;

		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: inherit;
		background:
			radial-gradient(ellipse 60% 50% at 20% 20%, var(--dry-mesh-color-1), transparent 70%),
			radial-gradient(ellipse 50% 60% at 80% 20%, var(--dry-mesh-color-2), transparent 70%),
			radial-gradient(ellipse 55% 55% at 70% 80%, var(--dry-mesh-color-3), transparent 70%),
			radial-gradient(ellipse 50% 50% at 25% 75%, var(--dry-mesh-color-4), transparent 70%);
	}

	/* Static fallback without @property */
	@supports not (background: paint(id)) {
		[data-gradient-mesh]:not([data-animated]) {
			background: linear-gradient(
				135deg,
				var(--dry-mesh-color-1) 0%,
				var(--dry-mesh-color-2) 33%,
				var(--dry-mesh-color-3) 66%,
				var(--dry-mesh-color-4) 100%
			);
		}
	}

	[data-gradient-mesh][data-animated] {
		animation: mesh-cycle var(--dry-mesh-duration) ease-in-out infinite alternate;
	}

	[data-gradient-mesh][data-animated][data-paused] {
		animation-play-state: paused;
	}

	[data-gradient-mesh][data-interactive] {
		background:
			radial-gradient(
				ellipse 60% 50% at var(--dry-mesh-pointer-x) var(--dry-mesh-pointer-y),
				var(--dry-mesh-color-1),
				transparent 70%
			),
			radial-gradient(ellipse 50% 60% at 80% 20%, var(--dry-mesh-color-2), transparent 70%),
			radial-gradient(ellipse 55% 55% at 70% 80%, var(--dry-mesh-color-3), transparent 70%),
			radial-gradient(ellipse 50% 50% at 25% 75%, var(--dry-mesh-color-4), transparent 70%);
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
			--dry-mesh-color-1: var(--dry-mesh-color-1);
			--dry-mesh-color-2: var(--dry-mesh-color-2);
			--dry-mesh-color-3: var(--dry-mesh-color-3);
			--dry-mesh-color-4: var(--dry-mesh-color-4);
		}

		33% {
			--dry-mesh-color-1: var(--dry-mesh-color-2);
			--dry-mesh-color-2: var(--dry-mesh-color-3);
			--dry-mesh-color-3: var(--dry-mesh-color-4);
			--dry-mesh-color-4: var(--dry-mesh-color-1);
		}

		66% {
			--dry-mesh-color-1: var(--dry-mesh-color-3);
			--dry-mesh-color-2: var(--dry-mesh-color-4);
			--dry-mesh-color-3: var(--dry-mesh-color-1);
			--dry-mesh-color-4: var(--dry-mesh-color-2);
		}

		100% {
			--dry-mesh-color-1: var(--dry-mesh-color-4);
			--dry-mesh-color-2: var(--dry-mesh-color-1);
			--dry-mesh-color-3: var(--dry-mesh-color-2);
			--dry-mesh-color-4: var(--dry-mesh-color-3);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		[data-gradient-mesh] {
			animation: none;
		}
	}
</style>
