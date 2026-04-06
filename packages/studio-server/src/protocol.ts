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
	StudioClientAttachPtyMessage,
	StudioClientCommandMessage,
	StudioClientHelloMessage,
	StudioClientMessage,
	StudioClientPingMessage,
	StudioClientPromptMessage,
	StudioClientResizeMessage,
	StudioServerCommandAppliedMessage,
	StudioServerErrorMessage,
	StudioServerMessage,
	StudioServerPongMessage,
	StudioServerPtyExitMessage,
	StudioServerPtyOutputMessage,
	StudioServerStateMessage,
	StudioServerWelcomeMessage,
	ThemePreset,
	CanvasStyle
} from './types.js';

export function encodeStudioMessage(message: unknown): string {
	return JSON.stringify(message);
}

export function decodeStudioMessage(payload: string | ArrayBufferLike): unknown {
	const text =
		typeof payload === 'string' ? payload : new TextDecoder().decode(new Uint8Array(payload));
	return JSON.parse(text);
}
