import { createContext } from '@dryui/primitives';

export interface GraphNodeDef {
	id: string;
	x: number;
	y: number;
}

interface NodeGraphContext {
	readonly width: number;
	readonly height: number;
	registerNode: (node: GraphNodeDef) => void;
	getNode: (id: string) => GraphNodeDef | undefined;
}

export const [setNodeGraphCtx, getNodeGraphCtx] =
	createContext<NodeGraphContext>('node-graph');
