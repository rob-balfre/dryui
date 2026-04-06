import { GENERATED_LAYOUT_LIBRARY } from './generated-library.js';

export type LayoutModeComponentType =
	| 'navigation'
	| 'hero'
	| 'card'
	| 'button'
	| 'sidebar'
	| 'table'
	| 'form'
	| 'input'
	| 'modal'
	| 'footer'
	| 'avatar'
	| 'badge'
	| 'text'
	| 'image'
	| 'list'
	| 'tabs'
	| 'header'
	| 'section'
	| 'grid'
	| 'dropdown'
	| 'toggle'
	| 'breadcrumb'
	| 'pagination'
	| 'progress'
	| 'divider'
	| 'accordion'
	| 'carousel'
	| 'chart'
	| 'video'
	| 'search'
	| 'toast'
	| 'tooltip'
	| 'pricing'
	| 'testimonial'
	| 'cta'
	| 'alert'
	| 'banner'
	| 'stat'
	| 'stepper'
	| 'tag'
	| 'rating'
	| 'map'
	| 'timeline'
	| 'fileUpload'
	| 'codeBlock'
	| 'calendar'
	| 'notification'
	| 'productCard'
	| 'profile'
	| 'drawer'
	| 'popover'
	| 'logo'
	| 'faq'
	| 'gallery'
	| 'checkbox'
	| 'radio'
	| 'slider'
	| 'datePicker'
	| 'skeleton'
	| 'chip'
	| 'icon'
	| 'spinner'
	| 'feature'
	| 'team'
	| 'login'
	| 'contact';

export type CanvasPurpose = 'new-page' | 'replace-current';

export interface Rect {
	x: number;
	y: number;
	width: number;
	height: number;
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

export interface ComponentDefinition {
	type: LayoutModeComponentType;
	label: string;
	width: number;
	height: number;
	description: string;
	sourceKind: 'component' | 'block';
	sourceId: string;
	sourceName: string;
	sourceLabel: string;
	sourceImport: string | null;
	routePath: string | null;
	tags: string[];
	structure: string | null;
	guidance: string;
}

export interface ComponentSection {
	section: string;
	items: ComponentDefinition[];
}

export interface ViewportSize {
	width: number;
	height: number;
}

export interface SpatialContext {
	top: number | null;
	right: number | null;
	bottom: number | null;
	left: number | null;
	centerX: number;
	centerY: number;
	rowCount: number;
	columnCount: number;
}

export interface CSSContext {
	parentSelector: string;
	parentDisplay: string;
	flexDirection?: string | null;
	gridCols?: string | null;
	gap?: string | null;
}

export const DEFAULT_SIZES: Record<LayoutModeComponentType, { width: number; height: number }> = {
	navigation: { width: 800, height: 56 },
	hero: { width: 800, height: 320 },
	header: { width: 800, height: 80 },
	section: { width: 800, height: 400 },
	sidebar: { width: 240, height: 400 },
	footer: { width: 800, height: 160 },
	modal: { width: 480, height: 300 },
	card: { width: 280, height: 240 },
	text: { width: 400, height: 120 },
	image: { width: 320, height: 200 },
	video: { width: 480, height: 270 },
	table: { width: 560, height: 220 },
	grid: { width: 600, height: 300 },
	list: { width: 300, height: 180 },
	chart: { width: 400, height: 240 },
	button: { width: 140, height: 40 },
	input: { width: 280, height: 56 },
	form: { width: 360, height: 320 },
	tabs: { width: 480, height: 240 },
	dropdown: { width: 200, height: 200 },
	toggle: { width: 44, height: 24 },
	search: { width: 320, height: 44 },
	avatar: { width: 48, height: 48 },
	badge: { width: 80, height: 28 },
	breadcrumb: { width: 300, height: 24 },
	pagination: { width: 300, height: 36 },
	progress: { width: 240, height: 8 },
	divider: { width: 600, height: 1 },
	accordion: { width: 400, height: 200 },
	carousel: { width: 600, height: 300 },
	toast: { width: 320, height: 64 },
	tooltip: { width: 180, height: 40 },
	pricing: { width: 300, height: 360 },
	testimonial: { width: 360, height: 200 },
	cta: { width: 600, height: 160 },
	alert: { width: 400, height: 56 },
	banner: { width: 800, height: 48 },
	stat: { width: 200, height: 120 },
	stepper: { width: 480, height: 48 },
	tag: { width: 72, height: 28 },
	rating: { width: 160, height: 28 },
	map: { width: 480, height: 300 },
	timeline: { width: 360, height: 320 },
	fileUpload: { width: 360, height: 180 },
	codeBlock: { width: 480, height: 200 },
	calendar: { width: 300, height: 300 },
	notification: { width: 360, height: 72 },
	productCard: { width: 280, height: 360 },
	profile: { width: 280, height: 200 },
	drawer: { width: 320, height: 400 },
	popover: { width: 240, height: 160 },
	logo: { width: 120, height: 40 },
	faq: { width: 560, height: 320 },
	gallery: { width: 560, height: 360 },
	checkbox: { width: 20, height: 20 },
	radio: { width: 20, height: 20 },
	slider: { width: 240, height: 32 },
	datePicker: { width: 300, height: 320 },
	skeleton: { width: 320, height: 120 },
	chip: { width: 96, height: 32 },
	icon: { width: 24, height: 24 },
	spinner: { width: 32, height: 32 },
	feature: { width: 360, height: 200 },
	team: { width: 560, height: 280 },
	login: { width: 360, height: 360 },
	contact: { width: 400, height: 320 }
};

export const COMPONENT_REGISTRY: ComponentSection[] = GENERATED_LAYOUT_LIBRARY.map((section) => ({
	section: section.section,
	items: section.items.map(({ section: _section, ...item }) => ({
		...item,
		tags: [...item.tags],
		...DEFAULT_SIZES[item.type]
	}))
}));

export const COMPONENT_MAP: Record<LayoutModeComponentType, ComponentDefinition> =
	Object.fromEntries(
		COMPONENT_REGISTRY.flatMap((section) => section.items.map((item) => [item.type, item] as const))
	) as Record<LayoutModeComponentType, ComponentDefinition>;

/** Responsive width presets for the sketch canvas */
export type CanvasWidth = 375 | 768 | 1280 | 1536;

export const CANVAS_WIDTHS = [
	{ label: 'Mobile', value: 375 },
	{ label: 'Tablet', value: 768 },
	{ label: 'Desktop', value: 1280 },
	{ label: 'Wide', value: 1536 }
] as const satisfies readonly { label: string; value: CanvasWidth }[];

/** Component action from context-aware click */
export type ComponentAction =
	| {
			kind: 'swap';
			targetSelector: string;
			fromComponent: string;
			toComponent: string;
			reason: string;
	  }
	| { kind: 'refine'; targetSelector: string; component: string; comment: string }
	| { kind: 'delete'; targetSelector: string; component: string };

/** Catalog entry: merged metadata from spec.json + composition-data */
export interface CatalogEntry {
	name: string;
	category: string;
	description: string;
	tags: string[];
	compound: boolean;
	importPath: string;
	structure: string | null;
	alternatives: { component: string; useWhen: string; rank: number }[];
	antiPatterns: { pattern: string; reason: string; fix: string }[];
	combinesWith: string[];
}

/** Undo/redo history snapshot */
export interface HistoryEntry {
	placements: DesignPlacement[];
	timestamp: number;
}
