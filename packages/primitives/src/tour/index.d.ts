import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import type { TourStep } from './context.svelte.js';
export type { TourStep };
interface TooltipSnippetParams {
	step: TourStep;
	currentStep: number;
	totalSteps: number;
	next: () => void;
	prev: () => void;
	skip: () => void;
}
export interface TourRootProps extends HTMLAttributes<HTMLDivElement> {
	steps: TourStep[];
	active?: boolean;
	onComplete?: () => void;
	onSkip?: () => void;
	children: Snippet;
}
export interface TourTooltipProps extends Omit<HTMLAttributes<HTMLDivElement>, 'children'> {
	children?: Snippet<[TooltipSnippetParams]>;
}
import TourRoot from './tour-root.svelte';
import TourTooltip from './tour-tooltip.svelte';
export declare const Tour: {
	Root: typeof TourRoot;
	Tooltip: typeof TourTooltip;
};
