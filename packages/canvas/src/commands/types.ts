import type { CanvasStyle, LayoutNode, PropValue } from '../ast/types.js';

export type CommandSource = 'keyboard' | 'mouse' | 'gesture' | 'ai' | 'system';

export interface InsertNodeCommand {
	type: 'insert-node';
	parentId: string;
	index: number;
	node: LayoutNode;
}

export interface RemoveNodeCommand {
	type: 'remove-node';
	nodeId: string;
}

export interface MoveNodeCommand {
	type: 'move-node';
	nodeId: string;
	newParentId: string;
	newIndex: number;
}

export interface SetPropCommand {
	type: 'set-prop';
	nodeId: string;
	propName: string;
	value: PropValue;
}

export interface SetCssVarCommand {
	type: 'set-css-var';
	nodeId: string;
	varName: string;
	value: string;
}

export interface SetStyleCommand {
	type: 'set-style';
	nodeId: string;
	property: keyof CanvasStyle;
	value: CanvasStyle[keyof CanvasStyle];
}

export interface SetTextCommand {
	type: 'set-text';
	nodeId: string;
	text: string;
}

export interface SetThemeVarCommand {
	type: 'set-theme-var';
	varName: string;
	value: string;
}

export interface SelectNodeCommand {
	type: 'select-node';
	nodeId: string;
	append?: boolean;
}

export interface DeselectAllCommand {
	type: 'deselect-all';
}

export interface DuplicateNodeCommand {
	type: 'duplicate-node';
	nodeId: string;
}

export interface BatchCommand {
	type: 'batch';
	label: string;
	commands: CanvasCommand[];
}

export type CanvasCommand =
	| InsertNodeCommand
	| RemoveNodeCommand
	| MoveNodeCommand
	| SetPropCommand
	| SetCssVarCommand
	| SetStyleCommand
	| SetTextCommand
	| SetThemeVarCommand
	| SelectNodeCommand
	| DeselectAllCommand
	| DuplicateNodeCommand
	| BatchCommand;

export interface CommandHistoryEntry {
	command: CanvasCommand;
	inverse: CanvasCommand;
	label: string;
	source: CommandSource;
	timestamp: string;
}

export interface CommandLock {
	nodeId: string;
	source: CommandSource;
}
