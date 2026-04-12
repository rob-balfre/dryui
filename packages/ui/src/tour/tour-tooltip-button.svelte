<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	import Button from '../button/button.svelte';
	import { Tour as TourPrimitive, type TourStep } from '@dryui/primitives/tour';

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
</script>

{#if children}
	<TourPrimitive.Tooltip data-part="tooltip" {children} {...rest} />
{:else}
	<TourPrimitive.Tooltip data-part="tooltip" {...rest}>
		{#snippet children(ctx)}
			<div data-part="tooltipTitle">{ctx.step.title}</div>
			<div data-part="tooltipContent">{ctx.step.content}</div>
			<div data-part="tooltipFooter">
				<span data-part="tooltipCounter">{ctx.currentStep + 1} of {ctx.totalSteps}</span>
				<div data-part="tooltipActions">
					<Button variant="ghost" size="sm" data-part="skipButton" onclick={() => ctx.skip()}
						>Skip</Button
					>
					{#if ctx.currentStep > 0}
						<Button variant="outline" size="sm" data-part="prevButton" onclick={() => ctx.prev()}
							>Previous</Button
						>
					{/if}
					<Button variant="solid" size="sm" data-part="nextButton" onclick={() => ctx.next()}
						>{ctx.currentStep === ctx.totalSteps - 1 ? 'Finish' : 'Next'}</Button
					>
				</div>
			</div>
		{/snippet}
	</TourPrimitive.Tooltip>
{/if}
