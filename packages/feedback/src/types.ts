export interface Point {
	x: number;
	y: number;
}

export interface Stroke {
	id: string;
	kind: 'freehand';
	points: Point[];
	color: string;
	width: number;
}

export interface Arrow {
	id: string;
	kind: 'arrow';
	start: Point;
	end: Point;
	color: string;
	width: number;
}

export interface TextLabel {
	id: string;
	kind: 'text';
	position: Point;
	text: string;
	color: string;
	fontSize: number;
}

export type Drawing = Stroke | Arrow | TextLabel;

export interface FeedbackProps {
	color?: string;
	strokeWidth?: number;
	shortcut?: string;
	serverUrl?: string;
	class?: string;
}
