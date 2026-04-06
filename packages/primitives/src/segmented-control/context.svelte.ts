import { createContext } from '../utils/create-context.js';

export interface SegmentedControlContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
}
export const [setSegmentedControlCtx, getSegmentedControlCtx] =
	createContext<SegmentedControlContext>('segmented-control');
