<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		getReducedMotionPreference,
		observeReducedMotionPreference,
		registerPropertyOnce,
		supportsPropertyRegistration,
		supportsPointerTracking
	} from '../internal/motion.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		colors?: readonly [string, string, string, string];
		speed?: 'slow' | 'normal' | 'fast' | number;
		interactive?: boolean;
		children?: Snippet;
	}

	let {
		colors = ['#7b68ee', '#38bdf8', '#f472b6', '#4ade80'] as const,
		speed = 'normal',
		interactive = false,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let prefersReducedMotion = $state(false);
	let animated = $state(false);
	let pointerX = $state('50%');
	let pointerY = $state('50%');

	function captureElement(node: HTMLDivElement) {
		element = node;
		return {
			destroy() {
				if (element === node) element = null;
			}
		};
	}

	const speedDuration = $derived.by(() => {
		if (typeof speed === 'number' && Number.isFinite(speed) && speed > 0) {
			return `${(12 / speed).toFixed(2)}s`;
		}
		if (speed === 'fast') return '8s';
		if (speed === 'slow') return '20s';
		return '12s';
	});

	function handlePointerMove(event: PointerEvent) {
		if (!interactive || prefersReducedMotion || !element || !supportsPointerTracking()) return;
		const rect = element.getBoundingClientRect();
		pointerX = `${(((event.clientX - rect.left) / rect.width) * 100).toFixed(1)}%`;
		pointerY = `${(((event.clientY - rect.top) / rect.height) * 100).toFixed(1)}%`;
	}

	function handlePointerLeave() {
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

		if (!supportsPropertyRegistration() || getReducedMotionPreference()) {
			animated = false;
			return stopMotionObserver;
		}

		animated = true;
		return stopMotionObserver;
	});

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-mesh-color-1', colors[0]);
			node.style.setProperty('--dry-mesh-color-2', colors[1]);
			node.style.setProperty('--dry-mesh-color-3', colors[2]);
			node.style.setProperty('--dry-mesh-color-4', colors[3]);
			node.style.setProperty('--dry-mesh-duration', speedDuration);
			node.style.setProperty('--dry-mesh-pointer-x', pointerX);
			node.style.setProperty('--dry-mesh-pointer-y', pointerY);
		});
	}
</script>

<div
	{@attach captureElement}
	class={['gradient-mesh', className]}
	data-animated={animated || undefined}
	data-interactive={interactive || undefined}
	data-reduced-motion={prefersReducedMotion || undefined}
	onpointermove={interactive ? handlePointerMove : undefined}
	onpointerleave={interactive ? handlePointerLeave : undefined}
	{...rest}
	use:applyStyles
>
	{@render children?.()}
</div>

<style>
	.gradient-mesh {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}
</style>
