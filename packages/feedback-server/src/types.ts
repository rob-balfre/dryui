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

export interface Submission {
	id: string;
	url: string;
	screenshotPath: string;
	drawings: unknown[];
	viewport: { width: number; height: number } | null;
	status: SubmissionStatus;
	createdAt: string;
}

export interface CreateSubmissionInput {
	url: string;
	image: string;
	drawings: unknown[];
	viewport?: { width: number; height: number };
}
