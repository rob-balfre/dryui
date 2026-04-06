import type { DolphinEdgeType, DolphinGraph, DolphinNodeKind } from '@dryui/mcp/architecture';

export type ArchitectureGraphData = DolphinGraph;

export interface ArchitectureFocusItem {
	id: string;
	label: string;
	kind: DolphinEdgeType | DolphinNodeKind;
	href?: string;
	description?: string;
}

export interface ArchitectureFocusGroup {
	id: string;
	title: string;
	description: string;
	items: ArchitectureFocusItem[];
}

export interface ArchitectureFocusData {
	component: string;
	summary: string;
	groups: ArchitectureFocusGroup[];
}
