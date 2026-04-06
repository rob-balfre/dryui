<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		observeReducedMotionPreference,
		supportsPointerTracking,
		registerPropertyOnce
	} from '../internal/motion.js';
	import type { BlendMode } from '../internal/blend-modes.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		radius?: number;
		intensity?: number;
		color?: string;
		followPointer?: boolean;
		blendMode?: BlendMode;
		children: Snippet;
	}

	let {
		radius = 260,
		intensity = 26,
		color,
		followPointer = true,
		blendMode,
		children,
		class: className,
		style,
		...rest
	}: Props = $props();

	let element = $state<HTMLDivElement | null>(null);
	let x = $state('50%');
	let y = $state('50%');
	let active = $state(false);
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

	function centerSpotlight() {
		x = '50%';
		y = '50%';
	}

	function canTrackPointer(): boolean {
		return followPointer && !prefersReducedMotion && supportsPointerTracking();
	}

	function updateFromClientPoint(clientX: number, clientY: number) {
		if (!element) return;

		const rect = element.getBoundingClientRect();
		x = `${clientX - rect.left}px`;
		y = `${clientY - rect.top}px`;
	}

	function handlePointerEnter(event: PointerEvent) {
		if (!canTrackPointer()) return;
		active = true;
		updateFromClientPoint(event.clientX, event.clientY);
	}

	function handlePointerMove(event: PointerEvent) {
		if (!canTrackPointer()) return;
		active = true;
		updateFromClientPoint(event.clientX, event.clientY);
	}

	function handlePointerLeave() {
		active = prefersReducedMotion || !followPointer;
		centerSpotlight();
	}

	function handleFocusIn() {
		active = true;
		centerSpotlight();
	}

	function handleFocusOut() {
		active = prefersReducedMotion || !followPointer;
	}

	onMount(() => {
		registerPropertyOnce({
			name: '--dry-spotlight-x',
			syntax: '<length-percentage>',
			inherits: false,
			initialValue: '50%'
		});
		registerPropertyOnce({
			name: '--dry-spotlight-y',
			syntax: '<length-percentage>',
			inherits: false,
			initialValue: '50%'
		});

		return observeReducedMotionPreference((matches) => {
			prefersReducedMotion = matches;
			active = matches || !followPointer;
			centerSpotlight();
		});
	});

	const radiusValue = $derived(`${Math.max(0, radius)}px`);
	const intensityValue = $derived.by(() => {
		const normalized = intensity <= 1 ? intensity * 100 : intensity;
		return `${Math.max(0, Math.min(100, normalized))}%`;
	});
	const effectiveColor = $derived(color ?? 'rgba(59, 130, 246, 0.28)');
	let staticSpotlight = $state(true);

	$effect(() => {
		if (typeof window !== 'undefined') {
			staticSpotlight = prefersReducedMotion || !followPointer || !supportsPointerTracking();
		}
	});

	function applyStyles(node: HTMLElement) {
		$effect(() => {
			node.style.cssText = style || '';
			node.style.setProperty('--dry-spotlight-radius', radiusValue);
			node.style.setProperty('--dry-spotlight-intensity', intensityValue);
			node.style.setProperty('--dry-spotlight-color', effectiveColor);
			node.style.setProperty('--dry-spotlight-x', x);
			node.style.setProperty('--dry-spotlight-y', y);
			node.style.setProperty('--dry-spotlight-blend', blendMode ?? '');
		});
	}
</script>

<div
	{@attach captureElement}
	class={['spotlight', className]}
	data-active={active || undefined}
	data-static={staticSpotlight || undefined}
	data-follow-pointer={!staticSpotlight || undefined}
	onpointerenter={handlePointerEnter}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	{...rest}
	use:applyStyles
>
	{@render children()}
</div>

<style>
	.spotlight {
		position: relative;
		isolation: isolate;
	}
</style>
