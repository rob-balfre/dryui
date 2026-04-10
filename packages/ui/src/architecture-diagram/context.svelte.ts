import { createContext } from '@dryui/primitives';

interface ArchitectureDiagramContext {
	readonly layout: 'horizontal' | 'vertical';
}

export const [setArchDiagramCtx, getArchDiagramCtx] =
	createContext<ArchitectureDiagramContext>('architecture-diagram');
