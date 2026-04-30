export type AnnotationIntent = 'fix' | 'change' | 'question' | 'approve';
export type AnnotationSeverity = 'blocking' | 'important' | 'suggestion';
export type AnnotationStatus = 'pending' | 'acknowledged' | 'resolved' | 'dismissed' | 'failed';
export type AnnotationKind = 'feedback' | 'placement' | 'rearrange';
export type AnnotationColor = 'brand' | 'info' | 'success' | 'warning' | 'error' | 'neutral';
export type SessionStatus = 'active' | 'approved' | 'closed';
export type ThreadRole = 'human' | 'agent';
export type ResolvedBy = 'human' | 'agent';

export interface BoundingBox {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface PlacementData {
	componentType: string;
	width: number;
	height: number;
	scrollY: number;
	text?: string;
}

export interface RearrangeData {
	selector: string;
	label: string;
	tagName: string;
	originalRect: BoundingBox;
	currentRect: BoundingBox;
}

export interface ThreadMessage {
	id: string;
	role: ThreadRole;
	content: string;
	timestamp: number;
}

export interface Annotation {
	id: string;
	sessionId: string;
	x: number;
	y: number;
	comment: string;
	element: string;
	elementPath: string;
	timestamp: number;
	selectedText?: string;
	boundingBox?: BoundingBox;
	nearbyText?: string;
	cssClasses?: string;
	nearbyElements?: string;
	computedStyles?: string;
	fullPath?: string;
	accessibility?: string;
	isMultiSelect?: boolean;
	isFixed: boolean;
	svelteComponents?: string;
	url?: string;
	intent?: AnnotationIntent;
	severity?: AnnotationSeverity;
	status?: AnnotationStatus;
	thread?: ThreadMessage[];
	createdAt?: string;
	updatedAt?: string;
	resolvedAt?: string;
	resolvedBy?: ResolvedBy;
	resolutionNote?: string;
	authorId?: string;
	kind?: AnnotationKind;
	color: AnnotationColor;
	extra?: {
		placement?: PlacementData;
		rearrange?: RearrangeData;
	};
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

export interface PendingResponse {
	count: number;
	annotations: Annotation[];
}

export interface SSEEvent<TPayload = unknown> {
	type: string;
	timestamp: string;
	sessionId: string;
	payload: TPayload;
}

export interface ActionRequest {
	output: string;
}

export interface ActionResponse {
	success: boolean;
	annotationCount: number;
	delivered: {
		sseListeners: number;
		webhooks: number;
		total: number;
	};
}

export interface CreateSessionInput {
	url: string;
}

export interface CreateAnnotationInput extends Omit<
	Annotation,
	'sessionId' | 'createdAt' | 'updatedAt' | 'resolvedAt'
> {
	sessionId?: string;
}

export interface UpdateAnnotationInput extends Partial<Omit<Annotation, 'id' | 'sessionId'>> {}

export type SubmissionStatus = 'pending' | 'resolved';
export type SubmissionQueryStatus = SubmissionStatus | 'all';
export type SubmissionAgent =
	| 'claude'
	| 'codex'
	| 'gemini'
	| 'opencode'
	| 'copilot'
	| 'copilot-vscode'
	| 'cursor'
	| 'windsurf'
	| 'zed'
	| 'off';

export interface SubmissionPoint {
	x: number;
	y: number;
}

export type DrawingSpace = 'scroll' | 'viewport';

interface SubmissionDrawingBase {
	id: string;
	color: string;
	space?: DrawingSpace;
}

export interface SubmissionStrokeDrawing extends SubmissionDrawingBase {
	kind: 'freehand';
	points: SubmissionPoint[];
	width: number;
}

export interface SubmissionArrowDrawing extends SubmissionDrawingBase {
	kind: 'arrow';
	start: SubmissionPoint;
	end: SubmissionPoint;
	width: number;
}

export interface SubmissionTextDrawing extends SubmissionDrawingBase {
	kind: 'text';
	position: SubmissionPoint;
	text: string;
	fontSize: number;
}

export type SubmissionDrawing =
	| SubmissionStrokeDrawing
	| SubmissionArrowDrawing
	| SubmissionTextDrawing;

export type SubmissionCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';

export interface SubmissionHintElement {
	tag: string;
	id?: string;
	selector?: string;
}

export interface SubmissionDrawingHint {
	corner: SubmissionCorner;
	percentX: number;
	percentY: number;
	element?: SubmissionHintElement;
}

export interface SubmissionScrollOffset {
	x: number;
	y: number;
}

export interface SubmissionScreenshotPaths {
	webp: string;
	png: string;
}

export interface SubmissionAddedComponent {
	id: string;
	kind: string;
	label?: string;
	props?: Record<string, unknown>;
	rect: { x: number; y: number; width: number; height: number };
}

export interface SubmissionRemovedElement {
	tag: string;
	id?: string;
	selector?: string;
	rect: { x: number; y: number; width: number; height: number };
}

/**
 * Captured when the user moved a component in layout mode. `originalRect` is
 * where the element sat in the page flow at submit time (still occupied via
 * `visibility: hidden`); `currentRect` is where the user dragged the clone to.
 */
export interface SubmissionMovedElement {
	tag: string;
	id?: string;
	selector?: string;
	originalRect: { x: number; y: number; width: number; height: number };
	currentRect: { x: number; y: number; width: number; height: number };
}

export type SubmissionLayoutKind =
	| 'box'
	| 'centered'
	| 'stack'
	| 'sidebar'
	| 'holy-grail'
	| '12-span'
	| 'card-grid';

/**
 * A free-drawn rectangle the user sketches on top of the page in Layout mode
 * to communicate a new region (intent only — no CSS mutation). Coordinates are
 * page-relative pixels at submit time.
 */
export interface SubmissionLayoutBox {
	id: string;
	kind?: SubmissionLayoutKind;
	label: string;
	pageX: number;
	pageY: number;
	width: number;
	height: number;
}

/**
 * New submissions always carry both WebP and PNG paths. Legacy rows that only
 * have a WebP file populate `webp` with the existing path and leave `png` as an
 * empty string; callers check truthiness before reading.
 */
export interface Submission {
	id: string;
	url: string;
	screenshotPath: SubmissionScreenshotPaths;
	drawings: SubmissionDrawing[];
	hints?: SubmissionDrawingHint[];
	components?: SubmissionAddedComponent[];
	removed?: SubmissionRemovedElement[];
	moved?: SubmissionMovedElement[];
	layoutBoxes?: SubmissionLayoutBox[];
	viewport: { width: number; height: number } | null;
	scroll?: SubmissionScrollOffset | null;
	status: SubmissionStatus;
	createdAt: string;
	agent?: SubmissionAgent;
	/** Dispatch prefers this over the live server workspace so deeplinks survive the server being restarted from a different cwd. */
	workspace?: string;
}

export interface CreateSubmissionImageInput {
	webp: string;
	png: string;
}

export interface CreateSubmissionInput {
	url: string;
	image: CreateSubmissionImageInput;
	drawings: SubmissionDrawing[];
	hints?: SubmissionDrawingHint[];
	components?: SubmissionAddedComponent[];
	removed?: SubmissionRemovedElement[];
	moved?: SubmissionMovedElement[];
	layoutBoxes?: SubmissionLayoutBox[];
	viewport?: { width: number; height: number };
	scroll?: SubmissionScrollOffset;
	agent?: SubmissionAgent;
}
