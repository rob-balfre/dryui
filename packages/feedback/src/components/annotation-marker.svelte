<script lang="ts">
	import type { Action } from 'svelte/action';
	import { Badge } from '@dryui/ui/badge';
	import { Button } from '@dryui/ui/button';
	import { ProgressRing } from '@dryui/ui/progress-ring';
	import { Tooltip } from '@dryui/ui/tooltip';
	import type { Annotation } from '../types.js';

	interface Props {
		annotation: Annotation;
		index: number;
		onclick?: (annotation: Annotation) => void;
		onmouseenter?: (annotation: Annotation) => void;
		onmouseleave?: () => void;
	}

	let { annotation, index, onclick, onmouseenter, onmouseleave }: Props = $props();

	function markerColor(color: Annotation['color']): string {
		switch (color) {
			case 'info':
				return 'var(--dry-color-fill-info, #0ea5e9)';
			case 'success':
				return 'var(--dry-color-fill-success, #16a34a)';
			case 'warning':
				return 'var(--dry-color-fill-warning, #d97706)';
			case 'error':
				return 'var(--dry-color-fill-error, #dc2626)';
			case 'neutral':
				return 'var(--dry-color-fill, #6b7280)';
			case 'brand':
			default:
				return 'var(--dry-color-fill-brand, #4f46e5)';
		}
	}

	const status = $derived(annotation.status ?? 'pending');
	const isResolved = $derived(status === 'resolved');
	const isDismissed = $derived(status === 'dismissed');
	const isWorking = $derived(status === 'acknowledged');
	const isFailed = $derived(status === 'failed');

	const bg = $derived(
		isResolved
			? 'var(--dry-color-fill-success, #16a34a)'
			: isFailed
				? 'var(--dry-color-fill-error, #dc2626)'
				: isDismissed
					? 'var(--dry-color-fill, #6b7280)'
					: markerColor(annotation.color)
	);

	const tooltip = $derived(
		`${annotation.element}${annotation.comment ? `: ${annotation.comment}` : ''}`
	);

	function handleClick(event: MouseEvent) {
		event.stopPropagation();
		onclick?.(annotation);
	}

	function handleMouseEnter() {
		onmouseenter?.(annotation);
	}

	interface MarkerPositionParams {
		isFixed: boolean;
		x: number;
		y: number;
	}

	/** Sets dynamic position/offset properties that depend on annotation data. */
	const markerPosition: Action<HTMLElement, MarkerPositionParams> = (node, params) => {
		function apply(p: MarkerPositionParams) {
			node.style.setProperty('position', p.isFixed ? 'fixed' : 'absolute');
			node.style.setProperty('left', `${p.x}%`);
			node.style.setProperty('top', `${Math.max(12, p.y)}px`);
		}

		apply(params);

		return {
			update: apply
		};
	};
</script>

<div
	class="marker-root"
	data-dryui-feedback
	use:markerPosition={{ isFixed: annotation.isFixed, x: annotation.x, y: annotation.y }}
>
	{#if isWorking}
		<div class="ring-wrapper">
			<ProgressRing
				indeterminate
				size={34}
				strokeWidth={2.5}
				color="yellow"
				style="--dry-progress-ring-indeterminate-speed: 1.2s;"
			/>
		</div>
	{:else if isResolved}
		<div class="ring-wrapper">
			<ProgressRing value={100} max={100} size={34} strokeWidth={2.5} color="green" />
		</div>
	{:else if isFailed}
		<div class="ring-wrapper">
			<ProgressRing value={100} max={100} size={34} strokeWidth={2.5} color="red" />
		</div>
	{/if}

	<Tooltip.Root openDelay={200}>
		<Tooltip.Trigger>
			<Button
				size="icon-sm"
				variant="solid"
				data-feedback-marker
				data-dryui-feedback
				data-feedback-marker-color={annotation.color}
				data-status={status}
				data-dismissed={isDismissed || undefined}
				aria-label={`${annotation.element}. ${annotation.comment || 'Open annotation'}`}
				aria-pressed={isResolved}
				onclick={handleClick}
				onmouseenter={handleMouseEnter}
				{onmouseleave}
				style="
          --dry-btn-bg: {bg};
          --dry-btn-border: var(--dry-color-bg-base, #fff);
          --dry-btn-color: var(--dry-color-on-brand, #fff);
          --dry-btn-radius: var(--dry-radius-full, 9999px);
          --dry-btn-accent: {bg};
          --dry-btn-accent-hover: {bg};
          --dry-btn-accent-active: {bg};
        "
			>
				{#if isResolved}
					<svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
						<path
							d="M2.5 6L5 8.5L9.5 3.5"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				{:else if isFailed}
					!
				{:else}
					{index}
				{/if}
			</Button>
		</Tooltip.Trigger>
		<Tooltip.Content>
			{tooltip}
			{#if isResolved}
				<div>Resolved</div>
			{:else if isWorking}
				<div>In progress</div>
			{:else if isDismissed}
				<div>Dismissed</div>
			{/if}
		</Tooltip.Content>
	</Tooltip.Root>

	{#if status === 'pending'}
		<Badge
			variant="dot"
			pulse
			color="blue"
			style="position: absolute; top: -1px; right: -1px; pointer-events: none;"
		/>
	{/if}
</div>
