<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import { getTourCtx, type TourStep } from './context.svelte.js';

	interface TooltipSnippetParams {
		step: TourStep;
		currentStep: number;
		totalSteps: number;
		next: () => void;
		prev: () => void;
		skip: () => void;
	}

	interface Props extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
		children?: Snippet<[TooltipSnippetParams]>;
	}

	let { children, ...rest }: Props = $props();

	const ctx = getTourCtx();

	function applyTooltipStyles(node: HTMLElement) {
		$effect(() => {
			if (!ctx.tooltipPosition) return;
			node.style.setProperty('--dry-tour-tooltip-top', ctx.tooltipPosition.top + 'px');
			node.style.setProperty('--dry-tour-tooltip-left', ctx.tooltipPosition.left + 'px');
			node.style.setProperty(
				'--dry-tour-tooltip-arrow-offset',
				ctx.tooltipArrowOffset !== null ? ctx.tooltipArrowOffset + 'px' : ''
			);
		});
	}
	let tooltipWidth = $state(0);
	let tooltipHeight = $state(0);

	const snippetParams: TooltipSnippetParams = {
		get step() {
			return ctx.currentStepData!;
		},
		get currentStep() {
			return ctx.currentStep;
		},
		get totalSteps() {
			return ctx.totalSteps;
		},
		next: () => ctx.next(),
		prev: () => ctx.prev(),
		skip: () => ctx.skip()
	};

	function updateTooltipWidth(width: number) {
		tooltipWidth = width;

		if (ctx.isActive && width && tooltipHeight) {
			ctx.updateTooltipSize(width, tooltipHeight);
		}
	}

	function updateTooltipHeight(height: number) {
		tooltipHeight = height;

		if (ctx.isActive && tooltipWidth && height) {
			ctx.updateTooltipSize(tooltipWidth, height);
		}
	}
</script>

{#if ctx.isActive && ctx.currentStepData && ctx.tooltipPosition}
	<div
		bind:offsetWidth={null, updateTooltipWidth}
		bind:offsetHeight={null, updateTooltipHeight}
		data-tour-tooltip
		data-placement={ctx.tooltipPlacement ?? ctx.currentStepData.placement ?? 'bottom'}
		use:applyTooltipStyles
		role="dialog"
		aria-label="Tour step {ctx.currentStep + 1} of {ctx.totalSteps}"
		{...rest}
	>
		{#if children}
			{@render children(snippetParams)}
		{:else}
			<!-- Default tooltip content -->
			<div data-tour-tooltip-default>
				<div data-tour-tooltip-title>{ctx.currentStepData.title}</div>
				<div data-tour-tooltip-content>{ctx.currentStepData.content}</div>
				<div data-tour-tooltip-footer>
					<span data-tour-tooltip-counter>{ctx.currentStep + 1} of {ctx.totalSteps}</span>
					<div data-tour-tooltip-actions>
						<button type="button" data-tour-skip onclick={() => ctx.skip()}>Skip</button>
						{#if ctx.currentStep > 0}
							<button type="button" data-tour-prev onclick={() => ctx.prev()}>Previous</button>
						{/if}
						<button type="button" data-tour-next onclick={() => ctx.next()}>
							{ctx.currentStep === ctx.totalSteps - 1 ? 'Finish' : 'Next'}
						</button>
					</div>
				</div>
			</div>
		{/if}
	</div>
{/if}
