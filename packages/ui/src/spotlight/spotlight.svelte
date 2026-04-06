<script lang="ts">
	import { onMount } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		observeReducedMotionPreference,
		supportsPointerTracking,
		registerPropertyOnce
	} from '@dryui/primitives/internal/motion';
	import type { BlendMode } from '@dryui/primitives/spotlight';

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
		color = 'rgba(59, 130, 246, 0.28)',
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
				if (element === node) element = null;
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
			node.style.setProperty('--dry-spotlight-color', color);
			node.style.setProperty('--dry-spotlight-x', x);
			node.style.setProperty('--dry-spotlight-y', y);
			if (blendMode) node.style.setProperty('--dry-spotlight-blend', blendMode);
		});
	}
</script>

<div
	{@attach captureElement}
	class={className}
	data-spotlight
	data-active={active || undefined}
	data-static={staticSpotlight || undefined}
	data-follow-pointer={!staticSpotlight || undefined}
	onpointerenter={handlePointerEnter}
	onpointermove={handlePointerMove}
	onpointerleave={handlePointerLeave}
	onfocusin={handleFocusIn}
	onfocusout={handleFocusOut}
	use:applyStyles
	{...rest}
>
	{@render children()}
</div>

<style>
	[data-spotlight] {
		position: relative;
		isolation: isolate;
		overflow: hidden;
		border-radius: inherit;
	}

	[data-spotlight]::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: inherit;
		pointer-events: none;
		mix-blend-mode: var(--dry-spotlight-blend, normal);
		background:
			radial-gradient(
				circle var(--dry-spotlight-radius, 260px) at var(--dry-spotlight-x, 50%)
					var(--dry-spotlight-y, 50%),
				color-mix(
						in srgb,
						var(--dry-spotlight-color, rgba(59, 130, 246, 0.28)) var(--dry-spotlight-intensity, 26%),
						transparent
					)
					0%,
				color-mix(
						in srgb,
						var(--dry-spotlight-color, rgba(59, 130, 246, 0.28))
							calc(var(--dry-spotlight-intensity, 26%) * 0.72),
						transparent
					)
					28%,
				color-mix(
						in srgb,
						var(--dry-spotlight-color, rgba(59, 130, 246, 0.28))
							calc(var(--dry-spotlight-intensity, 26%) * 0.38),
						transparent
					)
					52%,
				color-mix(
						in srgb,
						var(--dry-spotlight-color, rgba(59, 130, 246, 0.28))
							calc(var(--dry-spotlight-intensity, 26%) * 0.12),
						transparent
					)
					76%,
				transparent 100%
			),
			radial-gradient(
				circle calc(var(--dry-spotlight-radius, 260px) * 0.3) at var(--dry-spotlight-x, 50%)
					var(--dry-spotlight-y, 50%),
				rgba(255, 255, 255, 0.12) 0%,
				rgba(255, 255, 255, 0.04) 50%,
				transparent 100%
			);
		opacity: 0;
		transform: scale(1.02);
		transition:
			opacity var(--dry-duration-normal, 200ms) var(--dry-ease-out, ease),
			transform var(--dry-duration-normal, 200ms) var(--dry-ease-out, ease),
			--dry-spotlight-x 60ms ease-out,
			--dry-spotlight-y 60ms ease-out;
		will-change: opacity, transform;
	}

	[data-spotlight][data-active]::before,
	[data-spotlight][data-static]::before {
		opacity: 1;
		transform: scale(1);
	}

	[data-spotlight][data-static]::before {
		opacity: 0.88;
	}

	@media (prefers-reduced-motion: reduce) {
		[data-spotlight]::before {
			transition: none;
			transform: none;
		}
	}
</style>
