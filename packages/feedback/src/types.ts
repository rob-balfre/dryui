import type { Snippet } from 'svelte';

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

export type SubmitStatus = 'idle' | 'waiting-for-capture' | 'capturing' | 'uploading';

export interface FeedbackProps {
	color?: string;
	disabled?: boolean;
	strokeWidth?: number;
	shortcut?: string;
	serverUrl?: string;
	scrollRoot?: string | HTMLElement;
	class?: string;
	/**
	 * Replace the default submit flow (capture, post, open dashboard) with a custom handler.
	 * Fires unconditionally when the submit button is clicked — the consumer takes full
	 * ownership including any "no feedback yet" gating they want to apply themselves.
	 */
	onSubmit?: () => void | Promise<void>;
	/**
	 * Decorative content rendered above the toolbar, anchored to its position so it
	 * tracks viewport resize and toolbar drag. Intended for marketing demos that want
	 * to point a hand-drawn note at the toolbar; not for primary UI.
	 */
	hint?: Snippet;
}
