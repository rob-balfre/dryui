<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Tour as TourPrimitive, type TourStep } from '@dryui/primitives/tour';

	interface Props extends HTMLAttributes<HTMLDivElement> {
		steps: TourStep[];
		active?: boolean;
		onComplete?: () => void;
		onSkip?: () => void;
		children: Snippet;
	}

	let { active = $bindable(false), children, ...rest }: Props = $props();
</script>

<TourPrimitive.Root bind:active data-part="root" {children} {...rest} />

<style>
	/* Tour primitives render these nodes in child components, so the hooks must be global. */
	:global([data-tour-overlay]) {
		position: fixed;
		inset: 0;
		z-index: var(--dry-layer-tour-overlay);
		pointer-events: auto;
	}

	:global([data-tour-spotlight]) {
		--dry-tour-overlay-color: var(--dry-color-overlay-backdrop-strong);
		--dry-tour-spotlight-padding: 8px;
		--dry-tour-spotlight-radius: 4px;
		--dry-tour-spotlight-ring: color-mix(in srgb, var(--dry-color-fill-brand) 35%, white 25%);

		position: fixed;
		top: var(--dry-tour-spotlight-top);
		left: var(--dry-tour-spotlight-left);
		right: calc(100% - var(--dry-tour-spotlight-left) - var(--dry-tour-spotlight-width));
		height: var(--dry-tour-spotlight-height);
		border-radius: var(--dry-tour-spotlight-radius);
		box-shadow:
			0 0 0 1px var(--dry-tour-spotlight-ring),
			0 0 0 9999px var(--dry-tour-overlay-color);
		pointer-events: none;
		z-index: var(--dry-layer-tour-spotlight);
		transition:
			top var(--dry-duration-normal) var(--dry-ease-out),
			left var(--dry-duration-normal) var(--dry-ease-out),
			right var(--dry-duration-normal) var(--dry-ease-out),
			height var(--dry-duration-normal) var(--dry-ease-out);
	}

	:global([data-part='tooltip']) {
		--dry-tour-tooltip-bg: var(--dry-color-bg-overlay);
		--dry-tour-tooltip-radius: var(--dry-radius-xl);
		--dry-tour-tooltip-shadow: var(--dry-shadow-overlay);
		--dry-tour-tooltip-max-width: 20rem;
		--dry-tour-arrow-size: var(--dry-space-3);

		container-type: inline-size;
		position: fixed;
		top: var(--dry-tour-tooltip-top);
		left: var(--dry-tour-tooltip-left);
		z-index: var(--dry-layer-tour-tooltip);
		pointer-events: auto;
		display: grid;
		grid-template-columns: minmax(16rem, min(var(--dry-tour-tooltip-max-width), calc(100vw - var(--dry-space-4))));
		background: var(--dry-tour-tooltip-bg);
		color: var(--dry-color-text-strong);
		border: 1px solid var(--dry-color-stroke-weak);
		border-radius: var(--dry-tour-tooltip-radius);
		box-shadow: var(--dry-tour-tooltip-shadow);
		padding: var(--dry-space-5);

		transition:
			top var(--dry-duration-normal) var(--dry-ease-out),
			left var(--dry-duration-normal) var(--dry-ease-out),
			opacity var(--dry-duration-fast) var(--dry-ease-out);
	}

	:global([data-part='tooltipTitle']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-base-size));
		font-weight: 600;
		color: var(--dry-color-text-strong);
		margin: 0 0 var(--dry-space-2);
		line-height: 1.3;
	}

	:global([data-part='tooltipContent']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		line-height: var(--dry-type-small-leading, var(--dry-text-sm-leading));
		color: var(--dry-color-text-weak);
		margin: 0 0 var(--dry-space-4);
	}

	:global([data-part='tooltipFooter']) {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--dry-space-3);
	}

	:global([data-part='tooltipCounter']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-tiny-size, var(--dry-text-xs-size));
		color: var(--dry-color-text-weak);
	}

	:global([data-part='tooltipActions']) {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		align-items: center;
		gap: var(--dry-space-2);
		justify-items: end;
	}

	:global([data-part='skipButton']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-weak);
		background: none;
		border: none;
		padding: var(--dry-space-1) var(--dry-space-2);
		cursor: pointer;
		border-radius: var(--dry-radius-sm);
		transition: color var(--dry-duration-fast);
	}

	:global([data-part='skipButton']):hover {
		color: var(--dry-color-text-strong);
	}

	:global([data-part='skipButton']):focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	:global([data-part='prevButton']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-text-strong);
		background: transparent;
		border: 1px solid var(--dry-color-stroke-weak);
		padding: var(--dry-space-1) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition: background var(--dry-duration-fast);
	}

	:global([data-part='prevButton']):hover {
		background: var(--dry-color-bg-raised);
	}

	:global([data-part='prevButton']):focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	:global([data-part='nextButton']) {
		font-family: var(--dry-font-sans);
		font-size: var(--dry-type-small-size, var(--dry-text-sm-size));
		color: var(--dry-color-on-brand);
		background: var(--dry-color-fill-brand);
		border: none;
		padding: var(--dry-space-1) var(--dry-space-3);
		border-radius: var(--dry-radius-md);
		cursor: pointer;
		transition: opacity var(--dry-duration-fast);
	}

	:global([data-part='nextButton']):hover {
		opacity: 0.9;
	}

	:global([data-part='nextButton']):focus-visible {
		outline: 2px solid var(--dry-color-focus-ring);
		outline-offset: 2px;
	}

	/* Arrow indicators via pseudo-elements */
	:global([data-part='tooltip'])::before {
		content: '';
		position: absolute;
		height: var(--dry-tour-arrow-size);
		aspect-ratio: 1;
		background: var(--dry-tour-tooltip-bg);
		border: 1px solid var(--dry-color-stroke-weak);
		transform: translate(-50%, -50%) rotate(45deg);
	}

	:global([data-part='tooltip'][data-placement='bottom'])::before {
		top: 0;
		left: var(--dry-tour-tooltip-arrow-offset, 50%);
		border-right: none;
		border-bottom: none;
	}

	:global([data-part='tooltip'][data-placement='top'])::before {
		bottom: 0;
		left: var(--dry-tour-tooltip-arrow-offset, 50%);
		border-left: none;
		border-top: none;
	}

	:global([data-part='tooltip'][data-placement='left'])::before {
		right: 0;
		top: var(--dry-tour-tooltip-arrow-offset, 50%);
		border-left: none;
		border-bottom: none;
	}

	:global([data-part='tooltip'][data-placement='right'])::before {
		left: 0;
		top: var(--dry-tour-tooltip-arrow-offset, 50%);
		border-right: none;
		border-top: none;
	}

	@container (max-width: 480px) {
		:global([data-part='tooltip']) {
			grid-template-columns: minmax(0, min(16rem, calc(100vw - var(--dry-space-4))));
		}

		:global([data-part='tooltipFooter']) {
			grid-template-columns: 1fr;
			align-items: stretch;
		}
	}
</style>
