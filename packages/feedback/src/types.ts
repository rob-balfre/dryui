export interface Point {
	x: number;
	y: number;
}

export type DrawingSpace = 'scroll' | 'viewport';

interface DrawingBase {
	id: string;
	color: string;
	space?: DrawingSpace;
}

export interface Stroke extends DrawingBase {
	kind: 'freehand';
	points: Point[];
	width: number;
}

export interface Arrow extends DrawingBase {
	kind: 'arrow';
	start: Point;
	end: Point;
	width: number;
}

export interface TextLabel extends DrawingBase {
	kind: 'text';
	position: Point;
	text: string;
	fontSize: number;
}

export type Drawing = Stroke | Arrow | TextLabel;

export type Tool = 'pencil' | 'arrow' | 'text' | 'move' | 'eraser';

export const AGENTS = [
	'claude',
	'codex',
	'gemini',
	'opencode',
	'copilot',
	'copilot-vscode',
	'cursor',
	'windsurf',
	'zed',
	'off'
] as const;
export type SubmissionAgent = (typeof AGENTS)[number];

export interface DispatchTargetsResponse {
	defaultAgent: Exclude<SubmissionAgent, 'off'>;
	configuredAgents: Array<Exclude<SubmissionAgent, 'off'>>;
}

export interface FeedbackProps {
	color?: string;
	strokeWidth?: number;
	shortcut?: string;
	serverUrl?: string;
	scrollRoot?: string | HTMLElement;
	class?: string;
}
