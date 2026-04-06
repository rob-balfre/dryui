export type PropScalar = string | number | boolean | null;

export type PropValue =
	| PropScalar
	| PropValue[]
	| {
			[key: string]: PropValue;
	  };

export type CanvasLayoutMode = 'stack' | 'flex' | 'grid' | 'block';
export type CanvasSpacing = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | string;

export interface CanvasStyle {
	layout: CanvasLayoutMode;
	gap: CanvasSpacing;
	width?: string;
	height?: string;
	minWidth?: string;
	minHeight?: string;
	maxWidth?: string;
	maxHeight?: string;
	padding?: string;
	margin?: string;
	align?: string;
	justify?: string;
	columns?: string;
	grow?: number;
}

export interface ThemePreset {
	id: string;
	label: string;
	mode: 'light' | 'dark' | 'custom';
	vars: Record<string, string>;
}

export interface LayoutNode {
	id: string;
	component: string;
	part: string | null;
	props: Record<string, PropValue>;
	cssVarOverrides: Record<string, string>;
	style: CanvasStyle;
	children: LayoutNode[];
	text?: string;
	locked: boolean;
	visible: boolean;
	label?: string;
}

export interface LayoutDocument {
	version: 1;
	id: string;
	name: string;
	createdAt: string;
	updatedAt: string;
	canvas: {
		width: number;
		height: number | 'auto';
		background: string;
	};
	theme: ThemePreset;
	root: LayoutNode;
}

export interface TreeLocation {
	node: LayoutNode;
	parent: LayoutNode | null;
	index: number;
	depth: number;
}

export interface FactoryNodeOptions {
	id?: string;
	component: string;
	part?: string | null;
	props?: Record<string, PropValue>;
	cssVarOverrides?: Record<string, string>;
	style?: Partial<CanvasStyle>;
	children?: LayoutNode[];
	text?: string;
	locked?: boolean;
	visible?: boolean;
	label?: string;
}
