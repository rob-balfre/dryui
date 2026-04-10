import type { DolphinEdgeType, DolphinNodeKind, SystemMapGraph } from '@dryui/ui';

export type ArchitectureGraphData = SystemMapGraph;

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
