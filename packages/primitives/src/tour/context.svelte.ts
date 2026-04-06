import { createContext } from '../utils/create-context.js';

export interface TourStep {
	target: string;
	title: string;
	content: string;
	placement?: 'top' | 'bottom' | 'left' | 'right';
}

export interface TourContext {
	readonly currentStep: number;
	readonly totalSteps: number;
	readonly isActive: boolean;
	readonly currentStepData: TourStep | null;
	readonly targetRect: DOMRect | null;
	readonly tooltipPosition: { top: number; left: number } | null;
	readonly tooltipPlacement: TourStep['placement'] | null;
	readonly tooltipArrowOffset: number | null;
	start: () => void;
	next: () => void;
	prev: () => void;
	skip: () => void;
	goTo: (step: number) => void;
	updateTooltipSize: (width: number, height: number) => void;
}
export const [setTourCtx, getTourCtx] = createContext<TourContext>('tour');
