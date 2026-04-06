import { createContext } from '@dryui/primitives';

export interface SegmentedControlContext {
	readonly value: string;
	readonly disabled: boolean;
	readonly orientation: 'horizontal' | 'vertical';
	select: (value: string) => void;
}
export const [setSegmentedControlCtx, getSegmentedControlCtx] =
	createContext<SegmentedControlContext>('segmented-control');
