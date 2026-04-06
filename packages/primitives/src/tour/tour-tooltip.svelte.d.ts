import type { Snippet } from 'svelte';
import type { HTMLAttributes } from 'svelte/elements';
import { type TourStep } from './context.svelte.js';
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
declare const TourTooltip: import('svelte').Component<Props, {}, ''>;
type TourTooltip = ReturnType<typeof TourTooltip>;
export default TourTooltip;
