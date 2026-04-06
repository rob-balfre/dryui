export { default as DesignPalette } from './design-palette.svelte';
export { default as DesignMode } from './design-mode.svelte';
export { default as RearrangeOverlay } from './rearrange-overlay.svelte';
export { default as ComponentPicker } from './component-picker.svelte';
export { default as RouteCreator } from './route-creator.svelte';
export { default as ComponentActions } from './component-actions.svelte';
export { default as ResponsiveBar } from './responsive-bar.svelte';

export type {
	LayoutModeComponentType,
	CanvasPurpose,
	CanvasWidth,
	CatalogEntry,
	ComponentAction,
	ComponentDefinition,
	ComponentSection,
	CSSContext,
	DesignPlacement,
	DetectedSection,
	HistoryEntry,
	RearrangeState,
	Rect,
	SpatialContext,
	ViewportSize
} from './types.js';

export { CANVAS_WIDTHS, COMPONENT_MAP, COMPONENT_REGISTRY, DEFAULT_SIZES } from './types.js';

export {
	captureElement,
	detectPageSections,
	generateSelector,
	getSectionLabels,
	labelSection
} from './section-detection.js';

export {
	computeSectionSnap,
	computeSnap,
	createRectFromPoint,
	dedupeRects,
	MIN_CAPTURE_SIZE,
	MIN_SIZE,
	SNAP_THRESHOLD,
	isMeaningfulDrag
} from './geometry.js';

export type { Guide } from './geometry.js';

export {
	analyzeLayoutPatterns,
	formatCSSPosition,
	formatPositionSummary,
	formatSpatialLines,
	getElementCSSContext,
	getPageLayout,
	getPopupPosition,
	getSpatialContext,
	hasMeaningfulArea,
	intersectsRect,
	normalizeText,
	rectFromPoints,
	toRect,
	unionRects,
	uniqueLabels
} from './spatial.js';

export { generateDesignOutput, generateRearrangeOutput } from './output.js';

export {
	getCatalog,
	loadCatalog,
	searchCatalog,
	getAlternatives,
	getAntiPatterns
} from './catalog.js';

export { createHistory } from './history.js';
export type { History } from './history.js';

export { createMountManager } from './live-mount.js';
export type { MountManager, ReconcileDiff } from './live-mount.js';

export { generateSketchBrief, generateEditBrief } from './output.js';
export type { SketchBriefOptions, EditAnnotation, EditBriefOptions } from './output.js';

export {
	INTERACTIVE_TAGS,
	isElementFixed,
	isSelectableAreaTarget,
	rectFromElement
} from './element-heuristics.js';

export {
	freezeLayoutModeAnimations,
	isLayoutModeFrozen,
	originalRequestAnimationFrame,
	originalSetInterval,
	originalSetTimeout,
	unfreezeLayoutModeAnimations
} from './freeze.js';
