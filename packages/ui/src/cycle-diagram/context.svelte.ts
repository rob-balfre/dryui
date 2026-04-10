import { createContext } from '@dryui/primitives';

interface CycleDiagramContext {
	readonly width: number;
	readonly height: number;
	readonly centerX: number;
	readonly centerY: number;
	readonly radius: number;
	readonly phaseCount: number;
	registerPhase: () => number;
}

export const [setCycleDiagramCtx, getCycleDiagramCtx] =
	createContext<CycleDiagramContext>('cycle-diagram');
