export type AnnotationColor = 'brand' | 'info' | 'success' | 'warning' | 'error' | 'neutral';

export type AnnotationKind = 'feedback' | 'placement' | 'rearrange';
export type OutputDetail = 'compact' | 'standard' | 'detailed' | 'forensic';
export type AnnotationIntent = 'fix' | 'change' | 'question' | 'approve';
export type AnnotationSeverity = 'blocking' | 'important' | 'suggestion';
export type AnnotationStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed' | 'failed';
export type SessionStatus = 'active' | 'approved' | 'closed';
export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
export type ResolvedBy = 'human' | 'agent';
export type FeedbackTheme = 'dark' | 'light' | 'system';
export type MarkerClickBehavior = 'edit' | 'delete';
export type FeedbackLayoutMode = 'idle' | 'design' | 'rearrange';
export type LayoutModeComponentType = import('./layout-mode/types.js').LayoutModeComponentType;
export type CanvasPurpose = import('./layout-mode/types.js').CanvasPurpose;

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface ThreadMessage {
	id: string;
	role: 'human' | 'agent';
	content: string;
	timestamp: number;
}

export interface SSEEvent<TPayload = unknown> {
	type: string;
	timestamp: string;
	sessionId?: string;
	payload: TPayload;
}

export interface DesignPlacement {
	id: string;
	type: LayoutModeComponentType;
	x: number;
	y: number;
	width: number;
	height: number;
	scrollY: number;
	timestamp: number;
	text?: string;
	note?: string;
}

export interface DetectedSection {
	id: string;
	label: string;
	tagName: string;
	selector: string;
	role: string | null;
	className: string | null;
	textSnippet: string | null;
	originalRect: Rect;
	currentRect: Rect;
	originalIndex: number;
	isFixed?: boolean;
	note?: string;
}

export interface RearrangeState {
	sections: DetectedSection[];
	originalOrder: string[];
	detectedAt: number;
}

export interface WireframeState {
	rearrange: RearrangeState | null;
	placements: DesignPlacement[];
	purpose: CanvasPurpose;
	prompt: string;
}

export interface Session {
	id: string;
	url: string;
	status: SessionStatus;
	createdAt: string;
	updatedAt?: string;
	projectId?: string;
	metadata?: Record<string, unknown>;
}

export interface SessionWithAnnotations extends Session {
	annotations: Annotation[];
}

export interface Annotation {
	id: string;
	x: number;
	y: number;
	isFixed: boolean;
	timestamp: number;
	element: string;
	elementPath: string;
	comment: string;
	kind?: AnnotationKind;
	color: AnnotationColor;
	selectedText?: string;
	boundingBox?: Rect;
	nearbyText?: string;
	cssClasses?: string;
	nearbyElements?: string;
	computedStyles?: string;
	accessibility?: string;
	fullPath?: string;
	reactComponents?: string;
	svelteComponent?: string;
	svelteComponents?: string;
	sourceFile?: string;
	dryuiComponent?: string;
	isMultiSelect?: boolean;
	drawingIndex?: number;
	elementBoundingBoxes?: Rect[];
	placement?: DesignPlacement;
	rearrange?: {
		selector: string;
		label: string;
		tagName: string;
		originalRect: Rect;
		currentRect: Rect;
	};
	sessionId?: string;
	url?: string;
	status?: AnnotationStatus;
	intent?: AnnotationIntent;
	severity?: AnnotationSeverity;
	thread?: ThreadMessage[];
	createdAt?: string;
	updatedAt?: string;
	resolvedAt?: string;
	resolvedBy?: ResolvedBy;
	resolutionNote?: string;
	authorId?: string;
	_syncedTo?: string;
}

export interface FeedbackSettings {
	outputDetail: OutputDetail;
	autoClearAfterCopy: boolean;
	annotationColor: AnnotationColor;
	blockInteractions: boolean;
	svelteDetection: boolean;
	markerClickBehavior: MarkerClickBehavior;
	theme: FeedbackTheme;
	webhookUrl: string;
	webhooksEnabled: boolean;
}

export interface FeedbackProps {
	annotations?: Annotation[];
	onAnnotationAdd?: (annotation: Annotation) => void;
	onAnnotationUpdate?: (annotation: Annotation) => void;
	onAnnotationReply?: (annotation: Annotation, message: ThreadMessage) => void;
	onAnnotationDelete?: (annotation: Annotation) => void;
	onAnnotationsClear?: (annotations: Annotation[]) => void;
	onCopy?: (markdown: string) => void;
	onSubmit?: (output: string, annotations: Annotation[]) => void;
	onSessionCreated?: (sessionId: string) => void;
	defaultDetail?: OutputDetail;
	defaultColor?: AnnotationColor;
	defaultTheme?: FeedbackTheme;
	copyToClipboard?: boolean;
	enableDesignMode?: boolean;
	enableRearrange?: boolean;
	enableSvelteDetection?: boolean;
	endpoint?: string;
	sessionId?: string;
	webhookUrl?: string;
	shortcut?: string;
	demoAnnotations?: DemoAnnotation[];
	demoDelay?: number;
	enableDemoMode?: boolean;
	class?: string;
}

export interface DemoAnnotation {
	comment: string;
	element: string;
	elementPath: string;
	x: number;
	y: number;
	intent?: AnnotationIntent;
	severity?: AnnotationSeverity;
}
