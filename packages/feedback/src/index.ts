export { default as Feedback } from './feedback.svelte';

export type {
	Annotation,
	AnnotationColor,
	AnnotationKind,
	AnnotationIntent,
	AnnotationSeverity,
	AnnotationStatus,
	ConnectionStatus,
	DesignPlacement,
	DetectedSection,
	DemoAnnotation,
	OutputDetail,
	Rect,
	FeedbackSettings,
	FeedbackTheme,
	FeedbackProps,
	MarkerClickBehavior,
	RearrangeState,
	Session,
	SessionStatus,
	SessionWithAnnotations,
	SSEEvent,
	ThreadMessage,
	WireframeState
} from './types.js';
export type { GenerateOutputOptions } from './utils/output.js';
export type { ActionResponse, PendingResponse } from './utils/sync.js';

export {
	identifyElement,
	getElementPath,
	getNearbyText,
	getElementClasses
} from './utils/element-id.js';
export {
	deepElementFromPoint,
	isInShadowDOM,
	getShadowHost,
	closestCrossingShadow
} from './utils/shadow-dom.js';
export {
	clearAnnotations,
	clearAnnotationsForUrl,
	clearDesignPlacements,
	clearDesignPlacementsForUrl,
	clearRearrangeState,
	clearRearrangeStateForUrl,
	clearSessionId,
	clearSessionIdForUrl,
	clearSettings,
	clearSyncMarkers,
	clearWireframeState,
	clearWireframeStateForUrl,
	getAnnotationStorageKey,
	getDesignPlacementsStorageKey,
	getRearrangeStateStorageKey,
	getSessionStorageKey,
	getSessionStorageKeyForUrl,
	getStorageKey,
	getUnsyncedAnnotations,
	getWireframeStateStorageKey,
	loadAllAnnotations,
	loadAnnotations,
	loadAnnotationsForUrl,
	loadDesignPlacements,
	loadDesignPlacementsForUrl,
	loadRearrangeState,
	loadRearrangeStateForUrl,
	loadSessionId,
	loadSessionIdForUrl,
	loadSettings,
	loadToolbarHidden,
	loadWireframeState,
	loadWireframeStateForUrl,
	saveAnnotations,
	saveAnnotationsForUrl,
	saveAnnotationsWithSyncMarker,
	saveDesignPlacements,
	saveDesignPlacementsForUrl,
	saveRearrangeState,
	saveRearrangeStateForUrl,
	saveSessionId,
	saveSessionIdForUrl,
	saveSettings,
	saveToolbarHidden,
	saveWireframeState,
	saveWireframeStateForUrl
} from './utils/storage.js';
export {
	OUTPUT_DETAIL_OPTIONS,
	generateDesignOutput,
	generateFeedbackOutput,
	generateOutput,
	generateRearrangeOutput
} from './utils/output.js';
export {
	animationsAreFrozen,
	freezeAnimations,
	originalRequestAnimationFrame,
	originalSetInterval,
	originalSetTimeout,
	toggleAnimationsFrozen,
	unfreezeAnimations
} from './utils/freeze.js';
export {
	createSession,
	deleteAnnotation,
	getAllPending,
	getSession,
	getPending,
	listSessions,
	requestAction,
	syncAnnotation,
	updateAnnotation
} from './utils/sync.js';
