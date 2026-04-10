import { createContext } from '@dryui/primitives';

interface FlowDiagramContext {
	readonly direction: 'horizontal' | 'vertical';
}

export const [setFlowDiagramCtx, getFlowDiagramCtx] =
	createContext<FlowDiagramContext>('flow-diagram');
