import { createContext } from '@dryui/primitives';

interface SplitterContext {
	readonly orientation: 'horizontal' | 'vertical';
	readonly sizes: number[];
	setSizes(sizes: number[]): void;
	startResize(index: number, event: PointerEvent): void;
	nextPanelIndex(): number;
	nextHandleIndex(): number;
}
export const [setSplitterCtx, getSplitterCtx] = createContext<SplitterContext>('splitter');
