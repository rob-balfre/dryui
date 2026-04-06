import type {
	CanvasCommand,
	CanvasStyle,
	LayoutDocument,
	LayoutNode,
	PropValue,
	ThemePreset,
	BatchCommand,
	DeselectAllCommand,
	DuplicateNodeCommand,
	InsertNodeCommand,
	MoveNodeCommand,
	RemoveNodeCommand,
	SelectNodeCommand,
	SetCssVarCommand,
	SetPropCommand,
	SetStyleCommand,
	SetTextCommand,
	SetThemeVarCommand
} from '../../canvas/src/index.js';

export type {
	BatchCommand,
	CanvasCommand,
	DeselectAllCommand,
	DuplicateNodeCommand,
	InsertNodeCommand,
	LayoutDocument,
	LayoutNode,
	MoveNodeCommand,
	PropValue,
	RemoveNodeCommand,
	SelectNodeCommand,
	SetCssVarCommand,
	SetPropCommand,
	SetStyleCommand,
	SetTextCommand,
	SetThemeVarCommand,
	ThemePreset,
	CanvasStyle
} from '../../canvas/src/index.js';

export interface StudioClientHelloMessage {
	readonly type: 'hello';
	readonly sessionId?: string;
	readonly clientId?: string;
}

export interface StudioClientCommandMessage {
	readonly type: 'command';
	readonly command: CanvasCommand;
}

export interface StudioClientPromptMessage {
	readonly type: 'prompt';
	readonly text: string;
}

export interface StudioClientPingMessage {
	readonly type: 'ping';
	readonly at: number;
}

export interface StudioClientAttachPtyMessage {
	readonly type: 'attach-pty';
	readonly sessionId: string;
}

export interface StudioClientResizeMessage {
	readonly type: 'resize';
	readonly columns: number;
	readonly rows: number;
}

export type StudioClientMessage =
	| StudioClientHelloMessage
	| StudioClientCommandMessage
	| StudioClientPromptMessage
	| StudioClientPingMessage
	| StudioClientAttachPtyMessage
	| StudioClientResizeMessage;

export interface StudioServerWelcomeMessage {
	readonly type: 'welcome';
	readonly sessionId: string;
	readonly serverTime: string;
}

export interface StudioServerStateMessage {
	readonly type: 'state';
	readonly session: StudioSessionSnapshot;
}

export interface StudioServerCommandAppliedMessage {
	readonly type: 'command-applied';
	readonly command: CanvasCommand;
}

export interface StudioServerPtyOutputMessage {
	readonly type: 'pty-output';
	readonly sessionId: string;
	readonly chunk: string;
}

export interface StudioServerPtyExitMessage {
	readonly type: 'pty-exit';
	readonly sessionId: string;
	readonly code: number | null;
	readonly signal: string | null;
}

export interface StudioServerPongMessage {
	readonly type: 'pong';
	readonly at: number;
}

export interface StudioServerErrorMessage {
	readonly type: 'error';
	readonly message: string;
	readonly recoverable?: boolean;
}

export type StudioServerMessage =
	| StudioServerWelcomeMessage
	| StudioServerStateMessage
	| StudioServerCommandAppliedMessage
	| StudioServerPtyOutputMessage
	| StudioServerPtyExitMessage
	| StudioServerPongMessage
	| StudioServerErrorMessage;

export interface StudioSessionSnapshot {
	readonly id: string;
	readonly createdAt: string;
	readonly updatedAt: string;
	readonly lastSeenAt: string;
	readonly status: 'idle' | 'active' | 'closed';
	readonly clientId?: string | undefined;
	readonly attachedPty: boolean;
	readonly commandCount: number;
	readonly document?: LayoutDocument | undefined;
	readonly metadata: Record<string, unknown>;
}
