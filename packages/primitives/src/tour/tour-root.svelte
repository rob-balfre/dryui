<script lang="ts">
	import { untrack } from 'svelte';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Portal from '../portal/portal.svelte';
	import { setTourCtx, type TourStep } from './context.svelte.js';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		steps: TourStep[];
		active?: boolean;
		onComplete?: () => void;
		onSkip?: () => void;
		children: Snippet;
	}

	let { steps, active = $bindable(false), onComplete, onSkip, children, ...rest }: Props = $props();

	let currentStep = $state(0);
	let targetRect = $state<DOMRect | null>(null);
	let tooltipPosition = $state<{ top: number; left: number } | null>(null);
	let tooltipPlacement = $state<TourStep['placement'] | null>(null);
	let tooltipArrowOffset = $state<number | null>(null);
	let tooltipSize = $state<{ width: number; height: number } | null>(null);

	const SPOTLIGHT_PADDING = 8;
	const TOOLTIP_OFFSET = 12;
	const DEFAULT_TOOLTIP_SIZE = { width: 320, height: 150 };

	const currentStepData = $derived<TourStep | null>(
		active && currentStep >= 0 && currentStep < steps.length ? (steps[currentStep] ?? null) : null
	);

	function isRectFullyVisible(rect: DOMRect) {
		return (
			rect.top >= 8 &&
			rect.left >= 8 &&
			rect.bottom <= window.innerHeight - 8 &&
			rect.right <= window.innerWidth - 8
		);
	}

	function measureTarget(shouldScroll = false) {
		if (!currentStepData) {
			targetRect = null;
			tooltipPosition = null;
			tooltipPlacement = null;
			tooltipArrowOffset = null;
			return;
		}

		const el = document.querySelector(currentStepData.target);
		if (!el) {
			targetRect = null;
			tooltipPosition = null;
			tooltipPlacement = null;
			tooltipArrowOffset = null;
			return;
		}

		const rect = el.getBoundingClientRect();

		if (shouldScroll && !isRectFullyVisible(rect)) {
			el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
		}

		requestAnimationFrame(() => {
			const nextRect = el.getBoundingClientRect();
			const { width, height } = untrack(() => tooltipSize ?? DEFAULT_TOOLTIP_SIZE);

			targetRect = nextRect;
			calculateTooltipPosition(nextRect, currentStepData.placement ?? 'bottom', width, height);
		});
	}

	function calculateTooltipPosition(
		rect: DOMRect,
		placement: 'top' | 'bottom' | 'left' | 'right',
		tooltipWidth: number,
		tooltipHeight: number
	) {
		const nextPosition = getPositionForPlacement(rect, placement, tooltipWidth, tooltipHeight);
		tooltipPosition = {
			top: nextPosition.top,
			left: nextPosition.left
		};
		tooltipPlacement = nextPosition.placement;
		tooltipArrowOffset = nextPosition.arrowOffset;
	}

	function getPositionForPlacement(
		rect: DOMRect,
		placement: string,
		tooltipWidth: number,
		tooltipHeight: number
	): { top: number; left: number; placement: TourStep['placement']; arrowOffset: number } {
		const padded = {
			top: rect.top - SPOTLIGHT_PADDING,
			left: rect.left - SPOTLIGHT_PADDING,
			bottom: rect.bottom + SPOTLIGHT_PADDING,
			right: rect.right + SPOTLIGHT_PADDING,
			width: rect.width + SPOTLIGHT_PADDING * 2,
			height: rect.height + SPOTLIGHT_PADDING * 2
		};

		let top = 0;
		let left = 0;
		let resolvedPlacement: TourStep['placement'] = placement as TourStep['placement'];

		switch (placement) {
			case 'bottom':
				top = padded.bottom + TOOLTIP_OFFSET;
				left = padded.left + padded.width / 2 - tooltipWidth / 2;
				if (top + tooltipHeight > window.innerHeight) {
					resolvedPlacement = 'top';
					top = padded.top - TOOLTIP_OFFSET - tooltipHeight;
				}
				break;
			case 'top':
				top = padded.top - TOOLTIP_OFFSET - tooltipHeight;
				left = padded.left + padded.width / 2 - tooltipWidth / 2;
				if (top < 0) {
					resolvedPlacement = 'bottom';
					top = padded.bottom + TOOLTIP_OFFSET;
				}
				break;
			case 'left':
				top = padded.top + padded.height / 2 - tooltipHeight / 2;
				left = padded.left - TOOLTIP_OFFSET - tooltipWidth;
				if (left < 0) {
					resolvedPlacement = 'right';
					left = padded.right + TOOLTIP_OFFSET;
				}
				break;
			case 'right':
				top = padded.top + padded.height / 2 - tooltipHeight / 2;
				left = padded.right + TOOLTIP_OFFSET;
				if (left + tooltipWidth > window.innerWidth) {
					resolvedPlacement = 'left';
					left = padded.left - TOOLTIP_OFFSET - tooltipWidth;
				}
				break;
		}

		// Clamp to viewport
		left = Math.max(8, Math.min(left, window.innerWidth - tooltipWidth - 8));
		top = Math.max(8, Math.min(top, window.innerHeight - tooltipHeight - 8));

		const centerX = padded.left + padded.width / 2;
		const centerY = padded.top + padded.height / 2;
		const arrowInset = 16;

		const arrowOffset = ['top', 'bottom'].includes(resolvedPlacement ?? '')
			? Math.max(arrowInset, Math.min(centerX - left, tooltipWidth - arrowInset))
			: Math.max(arrowInset, Math.min(centerY - top, tooltipHeight - arrowInset));

		return { top, left, placement: resolvedPlacement, arrowOffset };
	}

	$effect(() => {
		if (active && currentStepData) {
			measureTarget(true);
		} else {
			targetRect = null;
			tooltipPosition = null;
			tooltipPlacement = null;
			tooltipArrowOffset = null;
		}
	});

	$effect(() => {
		if (active && currentStepData && tooltipSize) {
			measureTarget(false);
		}
	});

	$effect(() => {
		if (!active) return;

		function onResizeOrScroll() {
			measureTarget(false);
		}

		window.addEventListener('resize', onResizeOrScroll);
		window.addEventListener('scroll', onResizeOrScroll, true);

		return () => {
			window.removeEventListener('resize', onResizeOrScroll);
			window.removeEventListener('scroll', onResizeOrScroll, true);
		};
	});

	// Keyboard navigation
	$effect(() => {
		if (!active) return;

		function handleKeydown(e: KeyboardEvent) {
			switch (e.key) {
				case 'Escape':
					e.preventDefault();
					skip();
					break;
				case 'ArrowRight':
					e.preventDefault();
					next();
					break;
				case 'ArrowLeft':
					e.preventDefault();
					prev();
					break;
			}
		}

		document.addEventListener('keydown', handleKeydown);
		return () => document.removeEventListener('keydown', handleKeydown);
	});

	function start() {
		currentStep = 0;
		tooltipSize = null;
		active = true;
	}

	function next() {
		if (currentStep < steps.length - 1) {
			currentStep++;
			tooltipSize = null;
		} else {
			active = false;
			currentStep = 0;
			tooltipSize = null;
			onComplete?.();
		}
	}

	function prev() {
		if (currentStep > 0) {
			currentStep--;
			tooltipSize = null;
		}
	}

	function skip() {
		active = false;
		currentStep = 0;
		tooltipSize = null;
		onSkip?.();
	}

	function goTo(step: number) {
		if (step >= 0 && step < steps.length) {
			currentStep = step;
			tooltipSize = null;
		}
	}

	function updateTooltipSize(width: number, height: number) {
		const nextWidth = Math.round(width);
		const nextHeight = Math.round(height);

		if (tooltipSize?.width === nextWidth && tooltipSize?.height === nextHeight) {
			return;
		}

		tooltipSize = {
			width: nextWidth,
			height: nextHeight
		};
	}

	function applySpotlightStyles(node: HTMLElement) {
		$effect(() => {
			if (!targetRect) return;
			node.style.setProperty('--dry-tour-spotlight-top', targetRect.top - SPOTLIGHT_PADDING + 'px');
			node.style.setProperty(
				'--dry-tour-spotlight-left',
				targetRect.left - SPOTLIGHT_PADDING + 'px'
			);
			node.style.setProperty(
				'--dry-tour-spotlight-width',
				targetRect.width + SPOTLIGHT_PADDING * 2 + 'px'
			);
			node.style.setProperty(
				'--dry-tour-spotlight-height',
				targetRect.height + SPOTLIGHT_PADDING * 2 + 'px'
			);
		});
	}

	setTourCtx({
		get currentStep() {
			return currentStep;
		},
		get totalSteps() {
			return steps.length;
		},
		get isActive() {
			return active;
		},
		get currentStepData() {
			return currentStepData;
		},
		get targetRect() {
			return targetRect;
		},
		get tooltipPosition() {
			return tooltipPosition;
		},
		get tooltipPlacement() {
			return tooltipPlacement;
		},
		get tooltipArrowOffset() {
			return tooltipArrowOffset;
		},
		start,
		next,
		prev,
		skip,
		goTo,
		updateTooltipSize
	});
</script>

<div data-tour-root {...rest}>
	{@render children()}

	{#if active && targetRect}
		<Portal>
			<!-- Overlay: full-screen click barrier. Portaled to body so `position: fixed`
			     escapes any ancestor that creates a containing block (container-type,
			     transform, filter, perspective, will-change, contain: layout/strict). -->
			<div data-tour-overlay onclick={(e) => e.stopPropagation()} role="presentation">
				<!-- Spotlight: transparent box over target, box-shadow creates the dark overlay -->
				<div data-tour-spotlight use:applySpotlightStyles role="presentation"></div>
			</div>
		</Portal>
	{/if}
</div>
