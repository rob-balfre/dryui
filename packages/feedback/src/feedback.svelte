<script lang="ts">
	import { Button, Input, Portal, Toast } from '@dryui/ui';
	import { Hotkey } from '@dryui/primitives/hotkey';
	import { tryShowPopover, tryHidePopover } from '@dryui/primitives';
	import { Check } from 'lucide-svelte';
	import {
		createRawSnippet,
		mount as mountComponent,
		onDestroy,
		onMount,
		unmount as unmountComponent,
		untrack
	} from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import { SvelteMap } from 'svelte/reactivity';
	import {
		type Arrow,
		type Drawing,
		type DrawingSpace,
		type FeedbackProps,
		type Point,
		type Stroke,
		type SubmitStatus,
		type Tool
	} from './types.js';
	import { describeElement, describePosition, type DrawingHint } from './position-hints.js';
	import Toolbar, { type LayoutTool, type Mode } from './components/toolbar.svelte';
	import ComponentsInspector from './components/components-inspector.svelte';
	import LayoutInspector from './components/layout-inspector.svelte';
	import LayoutBoxesOverlay from './components/layout-boxes-overlay.svelte';

	// Runtime opt-out. Set DRY_FEEDBACK_DISABLED=1 (or any truthy value) to
	// omit the widget entirely. Useful for CI, screenshot jobs, or
	// demo/recreation contexts where editing the root layout is not an option.
	//
	// - process.env.DRY_FEEDBACK_DISABLED covers the SSR process (Node).
	// - import.meta.env.VITE_DRY_FEEDBACK_DISABLED also works and is baked into
	//   the client bundle by Vite, so it disables the widget on both sides.
	//   Prefer the VITE_-prefixed form for consistent SSR + client behavior.
	const feedbackDisabled = (() => {
		const maybeProcess = (globalThis as { process?: { env?: Record<string, unknown> } }).process;
		try {
			const env = maybeProcess?.env;
			if (env) {
				if (env.DRY_FEEDBACK_DISABLED) return true;
				if (env.VITE_DRY_FEEDBACK_DISABLED) return true;
			}
		} catch {
			// process is not available in the current runtime; ignore.
		}
		try {
			const metaEnv = (import.meta as { env?: Record<string, unknown> }).env;
			if (metaEnv) {
				if (metaEnv.DRY_FEEDBACK_DISABLED) return true;
				if (metaEnv.VITE_DRY_FEEDBACK_DISABLED) return true;
			}
		} catch {
			// import.meta.env is unavailable outside Vite builds; ignore.
		}
		return false;
	})();

	const ANNOTATION_FILL = 'hsl(25 100% 55%)';
	const ANNOTATION_OUTLINE = 'hsl(0 0% 100%)';
	const STROKE_OUTLINE_WIDTH = 4;
	const TEXT_OUTLINE_RATIO = 0.22;
	const FEEDBACK_QUERY_PARAM = 'dryui-feedback';
	const DASHBOARD_TAB_NAME = 'dryui-feedback-list';
	const LOCATION_CHANGE_EVENT = 'dryui-feedback:locationchange';

	let {
		color = ANNOTATION_FILL,
		strokeWidth = 3,
		shortcut = '$mod+m',
		serverUrl,
		scrollRoot,
		class: className
	}: FeedbackProps = $props();

	let active = $state(false);
	let tool = $state<Tool>('pencil');
	let inspectingComponents = $state(false);
	let inspectingLayout = $state(false);
	let layoutTool = $state<LayoutTool | null>(null);
	let selectedComponentEl = $state<HTMLElement | null>(null);
	const mode = $derived<Mode>(
		inspectingLayout ? 'layout' : inspectingComponents ? 'components' : 'annotate'
	);
	const annotationActive = $derived(active && !inspectingComponents && !inspectingLayout);

	function setMode(next: Mode) {
		if (next !== 'annotate') {
			currentStroke = null;
			currentArrow = null;
			if (textInput) commitText();
			erasing = false;
			moving = null;
			movedDuringDrag = false;
			erasedDuringDrag = false;
		}
		inspectingComponents = next === 'components';
		inspectingLayout = next === 'layout';
		selectedComponentEl = null;
	}

	function stopInspectingComponents() {
		inspectingComponents = false;
		selectedComponentEl = null;
	}

	function stopInspectingLayout() {
		inspectingLayout = false;
		layoutTool = null;
	}

	function setLayoutTool(next: LayoutTool | null) {
		layoutTool = next;
	}

	function selectComponent(el: HTMLElement | null) {
		selectedComponentEl = el;
	}

	type LayoutSnapshot = {
		left: string;
		top: string;
		width: string;
		height: string;
		transform: string;
		rotation: string | undefined;
	};

	type AddedSnapshot = {
		id: string;
		kind: string;
		snap: LayoutSnapshot;
		label?: string;
		propsJson?: string;
	};

	type GridOverrideMap = Map<string, string>;

	type LayoutBox = {
		id: string;
		label: string;
		pageX: number;
		pageY: number;
		width: number;
		height: number;
	};

	type HistoryFrame = {
		drawings: Drawing[];
		cloneSnapshots: Map<HTMLElement, LayoutSnapshot>;
		added: AddedSnapshot[];
		removed: HTMLElement[];
		gridOverrides: Map<HTMLElement, GridOverrideMap>;
		labelTexts: Map<HTMLElement, string>;
		boxes: LayoutBox[];
	};

	const GRID_TEMPLATE_PROPS = [
		'--dry-area-grid-template-areas',
		'--dry-area-grid-template-areas-wide',
		'--dry-area-grid-template-areas-xl',
		'--dry-area-grid-template-columns',
		'--dry-area-grid-template-columns-wide',
		'--dry-area-grid-template-columns-xl',
		'--dry-area-grid-template-rows',
		'--dry-area-grid-template-rows-wide',
		'--dry-area-grid-template-rows-xl',
		'--dry-grid-area-name'
	] as const;

	type RemovedRecord = {
		prevDisplay: string;
		rect: { x: number; y: number; width: number; height: number };
		descriptor: ReturnType<typeof describeElement>;
	};

	const LAYOUT_DATASET = {
		clone: 'dryuiLayoutClone',
		prevVis: 'dryuiLayoutPrevVis',
		rotation: 'dryuiLayoutRotation',
		addedId: 'dryuiAddedId'
	} as const;

	type AddedRecord = {
		el: HTMLElement;
		kind: string;
		initialSnap: LayoutSnapshot;
		label?: string;
		propsJson?: string;
		mounted?: ReturnType<typeof mountComponent> | null;
	};

	const layoutClones = new SvelteMap<HTMLElement, HTMLElement>();
	const cloneInitialSnaps = new SvelteMap<HTMLElement, LayoutSnapshot>();
	const addedComponents = new Map<string, AddedRecord>();
	const removedElements = new SvelteMap<HTMLElement, RemovedRecord>();
	const gridOverrideInitialSnaps = new SvelteMap<HTMLElement, GridOverrideMap>();
	const labelTextInitialSnaps = new SvelteMap<HTMLElement, string>();
	let layoutVersion = $state(0);
	let layoutBoxes = $state<LayoutBox[]>([]);

	let placingComponent = $state<string | null>(null);

	function emptyHistoryFrame(initialDrawings: Drawing[] = []): HistoryFrame {
		return {
			drawings: [...initialDrawings],
			cloneSnapshots: new Map(),
			added: [],
			removed: [],
			gridOverrides: new Map(),
			labelTexts: new Map(),
			boxes: []
		};
	}

	let historyFrames = $state<HistoryFrame[]>([emptyHistoryFrame()]);
	let frameIndex = $state(0);

	const cloneSelectedComponent = $derived(
		selectedComponentEl ? (layoutClones.get(selectedComponentEl) ?? null) : null
	);
	const canUndo = $derived(frameIndex > 0);
	const canRedo = $derived(frameIndex < historyFrames.length - 1);

	function snapshotClone(clone: HTMLElement): LayoutSnapshot {
		return {
			left: clone.style.left,
			top: clone.style.top,
			width: clone.style.width,
			height: clone.style.height,
			transform: clone.style.transform,
			rotation: clone.dataset[LAYOUT_DATASET.rotation]
		};
	}

	function applyLayoutSnapshot(clone: HTMLElement, snap: LayoutSnapshot) {
		clone.style.left = snap.left;
		clone.style.top = snap.top;
		clone.style.width = snap.width;
		clone.style.height = snap.height;
		clone.style.transform = snap.transform;
		if (snap.rotation === undefined) delete clone.dataset[LAYOUT_DATASET.rotation];
		else clone.dataset[LAYOUT_DATASET.rotation] = snap.rotation;
	}

	function sameLayoutSnapshot(a: LayoutSnapshot, b: LayoutSnapshot): boolean {
		return (
			a.left === b.left &&
			a.top === b.top &&
			a.width === b.width &&
			a.height === b.height &&
			a.transform === b.transform &&
			a.rotation === b.rotation
		);
	}

	function hasModifiedLayoutClone(): boolean {
		for (const [original, clone] of layoutClones) {
			const initial = cloneInitialSnaps.get(original);
			if (!initial || !sameLayoutSnapshot(snapshotClone(clone), initial)) return true;
		}
		return false;
	}

	function notifyLayoutChange() {
		requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
	}

	function ensureLayoutClone(original: HTMLElement): HTMLElement {
		const existing = layoutClones.get(original);
		if (existing) return existing;
		const clone = makeLayoutClone(original);
		layoutClones.set(original, clone);
		cloneInitialSnaps.set(original, snapshotClone(clone));
		original.dataset[LAYOUT_DATASET.prevVis] = original.style.visibility ?? '';
		original.style.visibility = 'hidden';
		return clone;
	}

	function destroyLayoutClone(original: HTMLElement) {
		const clone = layoutClones.get(original);
		if (!clone) return;
		clone.remove();
		layoutClones.delete(original);
		cloneInitialSnaps.delete(original);
		const prevVis = original.dataset[LAYOUT_DATASET.prevVis];
		if (prevVis !== undefined) {
			original.style.visibility = prevVis;
			delete original.dataset[LAYOUT_DATASET.prevVis];
		}
	}

	function destroyAllLayoutClones() {
		for (const original of [...layoutClones.keys()]) destroyLayoutClone(original);
		for (const id of [...addedComponents.keys()]) destroyAddedClone(id);
		for (const original of [...removedElements.keys()]) restoreLayoutElement(original);
		resetAllGridOverrides();
		layoutBoxes = [];
		layoutVersion++;
	}

	function removeLayoutElement(original: HTMLElement) {
		if (removedElements.has(original)) return;
		const rect = original.getBoundingClientRect();
		destroyLayoutClone(original);
		const prevDisplay = original.style.display;
		original.style.display = 'none';
		removedElements.set(original, {
			prevDisplay,
			rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height },
			descriptor: describeElement(original)
		});
		if (selectedComponentEl === original) selectedComponentEl = null;
	}

	function restoreLayoutElement(original: HTMLElement) {
		const record = removedElements.get(original);
		if (!record) return;
		original.style.display = record.prevDisplay;
		removedElements.delete(original);
	}

	function layoutStageTarget(): HTMLElement {
		return layoutStageEl ?? document.body;
	}

	const captureLayoutStage: Attachment<HTMLDivElement> = (node) => {
		layoutStageEl = node;
		return () => {
			if (layoutStageEl === node) layoutStageEl = undefined;
		};
	};

	const captureTextInputWrap: Attachment<HTMLDivElement> = (node) => {
		textInputWrapEl = node;
		const frame = requestAnimationFrame(() => {
			node.querySelector<HTMLInputElement>('[data-feedback-text-input]')?.focus();
		});
		return () => {
			cancelAnimationFrame(frame);
			if (textInputWrapEl === node) textInputWrapEl = undefined;
		};
	};

	function makeAddedElement(id: string, kind: string, snap: LayoutSnapshot): HTMLElement {
		const el = document.createElement('div');
		el.dataset[LAYOUT_DATASET.addedId] = id;
		Object.assign(el.style, {
			position: 'fixed',
			left: snap.left,
			top: snap.top,
			width: snap.width,
			height: snap.height,
			margin: '0',
			zIndex: '0',
			display: 'grid',
			placeItems: 'center',
			background: 'hsl(25 100% 55% / 0.16)',
			border: '2px dashed hsl(25 100% 55%)',
			borderRadius: '8px',
			color: 'hsl(25 100% 88%)',
			fontFamily: 'system-ui, -apple-system, sans-serif',
			fontSize: '13px',
			fontWeight: '600',
			letterSpacing: '0.02em',
			textAlign: 'center',
			padding: '4px 8px',
			boxSizing: 'border-box',
			transformOrigin: '50% 50%',
			pointerEvents: inspectingComponents ? 'none' : 'auto',
			transform: snap.transform
		});
		const content = document.createElement('div');
		content.dataset.dryuiAddedContent = '';
		content.style.cssText = 'display: contents;';
		const fallback = document.createElement('span');
		fallback.dataset.dryuiAddedFallback = '';
		fallback.textContent = kind;
		el.appendChild(content);
		el.appendChild(fallback);
		if (snap.rotation !== undefined) el.dataset[LAYOUT_DATASET.rotation] = snap.rotation;
		return el;
	}

	function parsePropsJson(json: string | undefined): Record<string, unknown> {
		if (!json?.trim()) return {};
		try {
			const parsed = JSON.parse(json);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as Record<string, unknown>;
			}
		} catch {
			// fall through to empty props on invalid JSON
		}
		return {};
	}

	function resolveMountable(value: unknown): unknown {
		if (typeof value === 'function') return value;
		if (value && typeof value === 'object') {
			const root = (value as Record<string, unknown>).Root;
			if (typeof root === 'function') return root;
		}
		return null;
	}

	const COMPONENT_DEFAULTS: Record<string, () => Promise<{ default: unknown }>> = {
		Accordion: () => import('./components/component-defaults/accordion.svelte'),
		AffixGroup: () => import('./components/component-defaults/affix-group.svelte'),
		AlertDialog: () => import('./components/component-defaults/alert-dialog.svelte'),
		Breadcrumb: () => import('./components/component-defaults/breadcrumb.svelte'),
		Calendar: () => import('./components/component-defaults/calendar.svelte'),
		Card: () => import('./components/component-defaults/card.svelte'),
		Carousel: () => import('./components/component-defaults/carousel.svelte'),
		Chart: () => import('./components/component-defaults/chart.svelte'),
		ChipGroup: () => import('./components/component-defaults/chip-group.svelte'),
		Collapsible: () => import('./components/component-defaults/collapsible.svelte'),
		ColorPicker: () => import('./components/component-defaults/color-picker.svelte'),
		Combobox: () => import('./components/component-defaults/combobox.svelte'),
		CommandPalette: () => import('./components/component-defaults/command-palette.svelte'),
		ContextMenu: () => import('./components/component-defaults/context-menu.svelte'),
		DataGrid: () => import('./components/component-defaults/data-grid.svelte'),
		DateField: () => import('./components/component-defaults/date-field.svelte'),
		DatePicker: () => import('./components/component-defaults/date-picker.svelte'),
		DateRangePicker: () => import('./components/component-defaults/date-range-picker.svelte'),
		DescriptionList: () => import('./components/component-defaults/description-list.svelte'),
		Diagram: () => import('./components/component-defaults/diagram.svelte'),
		Dialog: () => import('./components/component-defaults/dialog.svelte'),
		DragAndDrop: () => import('./components/component-defaults/drag-and-drop.svelte'),
		Drawer: () => import('./components/component-defaults/drawer.svelte'),
		DropdownMenu: () => import('./components/component-defaults/dropdown-menu.svelte'),
		EmptyState: () => import('./components/component-defaults/empty-state.svelte'),
		FormatBytes: () => import('./components/component-defaults/format-bytes.svelte'),
		FormatDate: () => import('./components/component-defaults/format-date.svelte'),
		ImageComparison: () => import('./components/component-defaults/image-comparison.svelte'),
		MarkdownRenderer: () => import('./components/component-defaults/markdown-renderer.svelte'),
		Motion: () => import('./components/component-defaults/motion.svelte'),
		RelativeTime: () => import('./components/component-defaults/relative-time.svelte'),
		Sparkline: () => import('./components/component-defaults/sparkline.svelte'),
		VideoEmbed: () => import('./components/component-defaults/video-embed.svelte'),
		VirtualList: () => import('./components/component-defaults/virtual-list.svelte'),
		Field: () => import('./components/component-defaults/field.svelte'),
		Fieldset: () => import('./components/component-defaults/fieldset.svelte'),
		FileSelect: () => import('./components/component-defaults/file-select.svelte'),
		FileUpload: () => import('./components/component-defaults/file-upload.svelte'),
		FlipCard: () => import('./components/component-defaults/flip-card.svelte'),
		FloatButton: () => import('./components/component-defaults/float-button.svelte'),
		Footer: () => import('./components/component-defaults/footer.svelte'),
		Hero: () => import('./components/component-defaults/hero.svelte'),
		HoverCard: () => import('./components/component-defaults/hover-card.svelte'),
		InputGroup: () => import('./components/component-defaults/input-group.svelte'),
		LinkPreview: () => import('./components/component-defaults/link-preview.svelte'),
		List: () => import('./components/component-defaults/list.svelte'),
		Listbox: () => import('./components/component-defaults/listbox.svelte'),
		Map: () => import('./components/component-defaults/map.svelte'),
		MegaMenu: () => import('./components/component-defaults/mega-menu.svelte'),
		Menubar: () => import('./components/component-defaults/menubar.svelte'),
		MultiSelectCombobox: () =>
			import('./components/component-defaults/multi-select-combobox.svelte'),
		NavigationMenu: () => import('./components/component-defaults/navigation-menu.svelte'),
		NotificationCenter: () => import('./components/component-defaults/notification-center.svelte'),
		OptionPicker: () => import('./components/component-defaults/option-picker.svelte'),
		Pagination: () => import('./components/component-defaults/pagination.svelte'),
		PinInput: () => import('./components/component-defaults/pin-input.svelte'),
		Popover: () => import('./components/component-defaults/popover.svelte'),
		RadioGroup: () => import('./components/component-defaults/radio-group.svelte'),
		RangeCalendar: () => import('./components/component-defaults/range-calendar.svelte'),
		RichTextEditor: () => import('./components/component-defaults/rich-text-editor.svelte'),
		SegmentedControl: () => import('./components/component-defaults/segmented-control.svelte'),
		Select: () => import('./components/component-defaults/select.svelte'),
		SelectableTileGroup: () =>
			import('./components/component-defaults/selectable-tile-group.svelte'),
		Sidebar: () => import('./components/component-defaults/sidebar.svelte'),
		Splitter: () => import('./components/component-defaults/splitter.svelte'),
		StarRating: () => import('./components/component-defaults/star-rating.svelte'),
		StatCard: () => import('./components/component-defaults/stat-card.svelte'),
		Stepper: () => import('./components/component-defaults/stepper.svelte'),
		Table: () => import('./components/component-defaults/table.svelte'),
		TableOfContents: () => import('./components/component-defaults/table-of-contents.svelte'),
		Tabs: () => import('./components/component-defaults/tabs.svelte'),
		TagsInput: () => import('./components/component-defaults/tags-input.svelte'),
		Timeline: () => import('./components/component-defaults/timeline.svelte'),
		Toast: () => import('./components/component-defaults/toast.svelte'),
		ToggleGroup: () => import('./components/component-defaults/toggle-group.svelte'),
		Toolbar: () => import('./components/component-defaults/toolbar.svelte'),
		Tooltip: () => import('./components/component-defaults/tooltip.svelte'),
		Tour: () => import('./components/component-defaults/tour.svelte'),
		Transfer: () => import('./components/component-defaults/transfer.svelte'),
		Tree: () => import('./components/component-defaults/tree.svelte'),
		Typography: () => import('./components/component-defaults/typography.svelte')
	};

	async function loadDefaultTemplate(kind: string): Promise<unknown | null> {
		const factory = COMPONENT_DEFAULTS[kind];
		if (!factory) return null;
		try {
			const mod = await factory();
			return typeof mod.default === 'function' ? mod.default : null;
		} catch {
			return null;
		}
	}

	async function tryRenderInto(record: AddedRecord) {
		try {
			let Component: unknown = await loadDefaultTemplate(record.kind);
			const usingDefault = !!Component;
			if (!Component) {
				const ui = await import('@dryui/ui');
				Component = resolveMountable((ui as Record<string, unknown>)[record.kind]);
			}
			if (typeof Component !== 'function') return;
			if (!record.el.isConnected) return;
			const target = record.el.querySelector<HTMLElement>('[data-dryui-added-content]');
			if (!target) return;
			target.style.cssText = 'display: contents;';
			const labelText = record.label?.trim() || record.kind;
			const labelSnippet = createRawSnippet(() => ({
				render: () => `<span>${escapeHtml(labelText)}</span>`
			}));
			const extraProps = parsePropsJson(record.propsJson);
			const props = usingDefault ? extraProps : { children: labelSnippet, ...extraProps };
			const instance = mountComponent(Component as Parameters<typeof mountComponent>[0], {
				target,
				props
			});
			record.mounted = instance;
			record.el.dataset.dryuiAddedRendered = '';
			record.el.style.background = 'transparent';
			record.el.style.border = '0';
			record.el.style.padding = '0';
			record.el.style.borderRadius = '0';
			record.el.style.placeItems = 'start';
			const fallback = record.el.querySelector<HTMLElement>('[data-dryui-added-fallback]');
			if (fallback) fallback.style.display = 'none';
			// Component mount shrink-wraps the placeholder to its real content size,
			// so the inspector needs to rebuild its bounding boxes for the new rect.
			notifyLayoutChange();
			// If the rendered component collapsed (typically because its content uses
			// width: 100% inside our shrink-to-fit parent, or it portals out), fall
			// back to a visible drag-target so the user can still interact with the
			// placeholder. Skip when the component already laid out at a usable size
			// so chips/buttons/etc. keep their natural bounds.
			await waitForNextPaint();
			if (!record.el.isConnected) return;
			const rect = record.el.getBoundingClientRect();
			if (rect.width < 40) record.el.style.minWidth = '200px';
			if (rect.height < 20) record.el.style.minHeight = '40px';
			if (rect.width < 40 || rect.height < 20) notifyLayoutChange();
		} catch (err) {
			console.warn('[feedback] failed to render', record.kind, err);
		}
	}

	function unmountAdded(record: AddedRecord) {
		if (!record.mounted) return;
		try {
			unmountComponent(record.mounted);
		} catch {
			// component may already be torn down; ignore
		}
		record.mounted = null;
	}

	function escapeHtml(value: string): string {
		return value.replace(/[&<>"']/g, (ch) => {
			switch (ch) {
				case '&':
					return '&amp;';
				case '<':
					return '&lt;';
				case '>':
					return '&gt;';
				case '"':
					return '&quot;';
				default:
					return '&#39;';
			}
		});
	}

	$effect(() => {
		const value = inspectingComponents ? 'none' : 'auto';
		for (const record of addedComponents.values()) {
			record.el.style.pointerEvents = value;
		}
	});

	function createAddedClone(
		id: string,
		kind: string,
		snap: LayoutSnapshot,
		options?: { label?: string; propsJson?: string }
	): HTMLElement {
		const existing = addedComponents.get(id);
		if (existing) {
			applyLayoutSnapshot(existing.el, snap);
			const propsChanged =
				existing.label !== options?.label || existing.propsJson !== options?.propsJson;
			if (existing.kind !== kind || propsChanged) {
				unmountAdded(existing);
				existing.kind = kind;
				existing.label = options?.label;
				existing.propsJson = options?.propsJson;
				const fallback = existing.el.querySelector<HTMLElement>('[data-dryui-added-fallback]');
				if (fallback) {
					fallback.textContent = options?.label?.trim() || kind;
					fallback.style.display = '';
				}
				delete existing.el.dataset.dryuiAddedRendered;
				existing.el.style.background = 'hsl(25 100% 55% / 0.16)';
				existing.el.style.border = '2px dashed hsl(25 100% 55%)';
				existing.el.style.padding = '4px 8px';
				existing.el.style.borderRadius = '8px';
				existing.el.style.placeItems = 'center';
				void tryRenderInto(existing);
			}
			return existing.el;
		}
		const el = makeAddedElement(id, kind, snap);
		layoutStageTarget().appendChild(el);
		const record: AddedRecord = {
			el,
			kind,
			initialSnap: snap,
			label: options?.label,
			propsJson: options?.propsJson,
			mounted: null
		};
		addedComponents.set(id, record);
		void tryRenderInto(record);
		return el;
	}

	function destroyAddedClone(id: string) {
		const record = addedComponents.get(id);
		if (!record) return;
		if (selectedComponentEl === record.el) selectedComponentEl = null;
		unmountAdded(record);
		record.el.remove();
		addedComponents.delete(id);
	}

	function snapshotAllClones(): Map<HTMLElement, LayoutSnapshot> {
		const map = new Map<HTMLElement, LayoutSnapshot>();
		for (const [el, clone] of layoutClones) map.set(el, snapshotClone(clone));
		return map;
	}

	function snapshotAllAdded(): AddedSnapshot[] {
		const result: AddedSnapshot[] = [];
		for (const [id, record] of addedComponents) {
			result.push({
				id,
				kind: record.kind,
				snap: snapshotClone(record.el),
				label: record.label,
				propsJson: record.propsJson
			});
		}
		return result;
	}

	function findGridShells(): HTMLElement[] {
		return Array.from(document.querySelectorAll<HTMLElement>('[data-area-grid-shell]')).filter(
			(el) => !el.closest('[data-dryui-feedback]')
		);
	}

	function readGridOverrides(shell: HTMLElement): GridOverrideMap {
		const map: GridOverrideMap = new Map();
		for (const prop of GRID_TEMPLATE_PROPS) {
			const value = shell.style.getPropertyValue(prop);
			if (value) map.set(prop, value);
		}
		return map;
	}

	function applyGridOverrides(shell: HTMLElement, overrides: GridOverrideMap) {
		for (const prop of GRID_TEMPLATE_PROPS) {
			const next = overrides.get(prop);
			if (next === undefined) shell.style.removeProperty(prop);
			else shell.style.setProperty(prop, next);
		}
	}

	function ensureGridInitialSnapshot(shell: HTMLElement) {
		if (gridOverrideInitialSnaps.has(shell)) return;
		gridOverrideInitialSnaps.set(shell, readGridOverrides(shell));
	}

	function snapshotAllGridOverrides(): Map<HTMLElement, GridOverrideMap> {
		const map = new Map<HTMLElement, GridOverrideMap>();
		for (const shell of gridOverrideInitialSnaps.keys()) {
			map.set(shell, readGridOverrides(shell));
		}
		return map;
	}

	function captureGridOverridesIfChanged() {
		for (const shell of findGridShells()) {
			ensureGridInitialSnapshot(shell);
		}
	}

	function gridOverridesEqual(a: GridOverrideMap, b: GridOverrideMap): boolean {
		if (a.size !== b.size) return false;
		for (const [key, value] of a) if (b.get(key) !== value) return false;
		return true;
	}

	function hasModifiedGridOverrides(): boolean {
		for (const [shell, initial] of gridOverrideInitialSnaps) {
			if (!gridOverridesEqual(initial, readGridOverrides(shell))) return true;
		}
		return false;
	}

	function resetAllGridOverrides() {
		for (const [shell, initial] of gridOverrideInitialSnaps) {
			applyGridOverrides(shell, initial);
		}
		gridOverrideInitialSnaps.clear();
		for (const [el, text] of labelTextInitialSnaps) {
			el.textContent = text;
		}
		labelTextInitialSnaps.clear();
	}

	function ensureLabelInitialSnapshot(el: HTMLElement) {
		if (labelTextInitialSnaps.has(el)) return;
		labelTextInitialSnaps.set(el, el.textContent ?? '');
	}

	function snapshotAllLabelTexts(): Map<HTMLElement, string> {
		const map = new Map<HTMLElement, string>();
		for (const el of labelTextInitialSnaps.keys()) {
			map.set(el, el.textContent ?? '');
		}
		return map;
	}

	function hasModifiedLabelTexts(): boolean {
		for (const [el, initial] of labelTextInitialSnaps) {
			if ((el.textContent ?? '') !== initial) return true;
		}
		return false;
	}

	function commitHistory() {
		captureGridOverridesIfChanged();
		const frame: HistoryFrame = {
			drawings: [...drawings],
			cloneSnapshots: snapshotAllClones(),
			added: snapshotAllAdded(),
			removed: [...removedElements.keys()],
			gridOverrides: snapshotAllGridOverrides(),
			labelTexts: snapshotAllLabelTexts(),
			boxes: layoutBoxes.map((b) => ({ ...b }))
		};
		const next = [...historyFrames.slice(0, frameIndex + 1), frame];
		historyFrames = next;
		frameIndex = next.length - 1;
		layoutVersion++;
	}

	function applyHistoryFrame(frame: HistoryFrame) {
		drawings = [...frame.drawings];
		let layoutChanged = false;
		for (const [el, clone] of layoutClones) {
			const snap = frame.cloneSnapshots.get(el) ?? cloneInitialSnaps.get(el);
			if (snap) {
				applyLayoutSnapshot(clone, snap);
				layoutChanged = true;
			}
		}
		const wantedIds = new Set(frame.added.map((a) => a.id));
		for (const id of [...addedComponents.keys()]) {
			if (!wantedIds.has(id)) {
				destroyAddedClone(id);
				layoutChanged = true;
			}
		}
		for (const entry of frame.added) {
			createAddedClone(entry.id, entry.kind, entry.snap, {
				label: entry.label,
				propsJson: entry.propsJson
			});
			layoutChanged = true;
		}
		const wantedRemoved = new Set(frame.removed);
		for (const el of [...removedElements.keys()]) {
			if (!wantedRemoved.has(el)) {
				restoreLayoutElement(el);
				layoutChanged = true;
			}
		}
		for (const el of frame.removed) {
			if (!removedElements.has(el)) {
				removeLayoutElement(el);
				layoutChanged = true;
			}
		}
		for (const shell of gridOverrideInitialSnaps.keys()) {
			const target = frame.gridOverrides.get(shell) ?? gridOverrideInitialSnaps.get(shell)!;
			applyGridOverrides(shell, target);
			layoutChanged = true;
		}
		for (const [el, initial] of labelTextInitialSnaps) {
			const target = frame.labelTexts.get(el) ?? initial;
			if ((el.textContent ?? '') !== target) el.textContent = target;
			layoutChanged = true;
		}
		layoutBoxes = frame.boxes.map((b) => ({ ...b }));
		if (layoutChanged) notifyLayoutChange();
		layoutVersion++;
		saveVersion++;
	}

	function stepHistory(direction: -1 | 1) {
		if (direction === -1 ? !canUndo : !canRedo) return;
		frameIndex = frameIndex + direction;
		applyHistoryFrame(historyFrames[frameIndex]!);
	}

	function resetHistory(initialDrawings: Drawing[]) {
		historyFrames = [emptyHistoryFrame(initialDrawings)];
		frameIndex = 0;
		layoutVersion++;
	}

	const undo = () => stepHistory(-1);
	const redo = () => stepHistory(1);

	const hasLayoutFeedback = $derived.by(() => {
		void layoutVersion;
		void frameIndex;
		void historyFrames.length;
		return (
			addedComponents.size > 0 ||
			removedElements.size > 0 ||
			hasModifiedLayoutClone() ||
			hasModifiedGridOverrides() ||
			hasModifiedLabelTexts() ||
			layoutBoxes.length > 0
		);
	});

	function applyLayoutBoxes(next: LayoutBox[], commit: boolean) {
		layoutBoxes = next;
		if (commit) commitHistory();
		else layoutVersion++;
	}

	function makeLayoutClone(original: HTMLElement): HTMLElement {
		const rect = original.getBoundingClientRect();
		const clone = original.cloneNode(true) as HTMLElement;
		if (clone.id) clone.id = '';
		for (const inner of clone.querySelectorAll('[id]')) inner.removeAttribute('id');
		clone.dataset[LAYOUT_DATASET.clone] = '';
		Object.assign(clone.style, {
			position: 'fixed',
			left: `${rect.left}px`,
			top: `${rect.top}px`,
			width: `${rect.width}px`,
			height: `${rect.height}px`,
			margin: '0',
			zIndex: '0',
			pointerEvents: 'none',
			transform: '',
			transformOrigin: '50% 50%'
		});
		layoutStageTarget().appendChild(clone);
		return clone;
	}

	$effect(() => {
		const original = selectedComponentEl;
		if (!inspectingComponents || !original) return;
		if (original.dataset[LAYOUT_DATASET.addedId]) return;
		ensureLayoutClone(original);
	});

	$effect(() => {
		if (active) return;
		if (untrack(() => hasFeedback)) return;
		untrack(() => {
			destroyAllLayoutClones();
			resetHistory(drawings);
		});
	});

	$effect(() => {
		if (inspectingComponents) return;
		if (untrack(() => hasLayoutFeedback)) return;
		untrack(() => {
			for (const original of [...layoutClones.keys()]) destroyLayoutClone(original);
		});
	});

	$effect(() => {
		if (!inspectingLayout) return;
		untrack(() => {
			for (const shell of findGridShells()) ensureGridInitialSnapshot(shell);
		});
	});

	onDestroy(destroyAllLayoutClones);

	function resetSelectedComponent() {
		const original = selectedComponentEl;
		if (!original) return;
		const clone = layoutClones.get(original);
		const initial = cloneInitialSnaps.get(original);
		if (clone && initial) {
			applyLayoutSnapshot(clone, initial);
			commitHistory();
			notifyLayoutChange();
			return;
		}
		const addedId = original.dataset[LAYOUT_DATASET.addedId];
		if (!addedId) return;
		const record = addedComponents.get(addedId);
		if (!record) return;
		applyLayoutSnapshot(original, record.initialSnap);
		commitHistory();
		notifyLayoutChange();
	}

	function startPlacingComponent(kind: string) {
		const trimmed = kind.trim();
		if (!trimmed) return;
		placingComponent = trimmed;
		if (selectedComponentEl) selectedComponentEl = null;
	}

	function cancelPlacingComponent() {
		placingComponent = null;
	}

	function placeComponentAt(x: number, y: number) {
		const kind = placingComponent;
		if (!kind) return;
		const id = crypto.randomUUID();
		// Position is anchored on a fallback bbox to keep the click point inside the
		// viewport. Width/height start empty so the placeholder (and its rendered
		// content) shrink-wrap their natural size; user drag-resize later sets
		// explicit pixel values that override.
		const anchorWidth = 200;
		const anchorHeight = 80;
		const left = Math.max(0, Math.min(window.innerWidth - anchorWidth, x - anchorWidth / 2));
		const top = Math.max(0, Math.min(window.innerHeight - anchorHeight, y - anchorHeight / 2));
		const snap: LayoutSnapshot = {
			left: `${left}px`,
			top: `${top}px`,
			width: '',
			height: '',
			transform: '',
			rotation: undefined
		};
		const el = createAddedClone(id, kind, snap);
		placingComponent = null;
		selectedComponentEl = el;
		commitHistory();
		notifyLayoutChange();
	}

	function resolveInspectorClone(el: HTMLElement): HTMLElement | null {
		const clone = layoutClones.get(el);
		if (clone) return clone;
		if (el.dataset[LAYOUT_DATASET.addedId]) return el;
		return null;
	}

	const selectedAddedRecord = $derived.by(() => {
		const el = selectedComponentEl;
		if (!el) return null;
		const id = el.dataset[LAYOUT_DATASET.addedId];
		if (!id) return null;
		return addedComponents.get(id) ?? null;
	});

	function removeSelectedElement() {
		const el = selectedComponentEl;
		if (!el) return;
		const id = el.dataset[LAYOUT_DATASET.addedId];
		if (id) {
			destroyAddedClone(id);
		} else {
			removeLayoutElement(el);
		}
		commitHistory();
		notifyLayoutChange();
	}

	function applyAddedProps(label: string, propsJson: string) {
		const el = selectedComponentEl;
		if (!el) return;
		const id = el.dataset[LAYOUT_DATASET.addedId];
		if (!id) return;
		const record = addedComponents.get(id);
		if (!record) return;
		const nextLabel = label.trim() || undefined;
		const nextProps = propsJson.trim() || undefined;
		if (record.label === nextLabel && record.propsJson === nextProps) return;
		record.label = nextLabel;
		record.propsJson = nextProps;
		unmountAdded(record);
		const fallback = record.el.querySelector<HTMLElement>('[data-dryui-added-fallback]');
		if (fallback) {
			fallback.textContent = nextLabel || record.kind;
			fallback.style.display = '';
		}
		delete record.el.dataset.dryuiAddedRendered;
		record.el.style.background = 'hsl(25 100% 55% / 0.16)';
		record.el.style.border = '2px dashed hsl(25 100% 55%)';
		record.el.style.padding = '4px 8px';
		record.el.style.borderRadius = '8px';
		record.el.style.placeItems = 'center';
		void tryRenderInto(record);
		commitHistory();
	}
	let drawings: Drawing[] = $state([]);
	let currentStroke: Stroke | null = $state(null);
	let currentArrow: Arrow | null = $state(null);
	let textInput: { position: Point; value: string; space: DrawingSpace } | null = $state(null);
	let textInputWrapEl: HTMLDivElement | undefined;
	let erasing = $state(false);
	let moving: { drawingId: string; lastPoint: Point; space: DrawingSpace } | null = $state(null);
	let justCommitted = false;
	let movedDuringDrag = false;
	let erasedDuringDrag = false;
	let saveVersion = $state(0);
	let submitStatus: SubmitStatus = $state('idle');
	let sent = $state(false);
	let toasts: FeedbackToast[] = $state([]);
	let toastLayerEl: HTMLDivElement | undefined = $state();
	let layoutStageEl: HTMLDivElement | undefined = $state();
	let toolbarHiddenForCapture = $state(false);
	let scrollRootEl: HTMLElement | null = $state(null);
	let viewportLeft = $state(0);
	let viewportTop = $state(0);
	let viewportWidth = $state(0);
	let viewportHeight = $state(0);
	let scrollX = $state(0);
	let scrollY = $state(0);
	let layerHostEl: HTMLElement | null = $state(null);
	let layerOriginLeft = $state(0);
	let layerOriginTop = $state(0);
	let currentPageUrl = $state(canonicalPageUrl());
	const toastTimers: Record<string, ReturnType<typeof setTimeout>> = Object.create(null);

	const ERASE_RADIUS = 12;
	const ARROW_HEAD_SIZE = 12;
	const TEXT_FONT_SIZE = 16;
	const SCROLLABLE_OVERFLOW = new Set(['auto', 'scroll', 'overlay']);
	const SUCCESS_TOAST_DURATION_MS = 4000;
	const ERROR_TOAST_DURATION_MS = 6000;

	interface FeedbackToast {
		id: string;
		variant: 'success' | 'error';
		title: string;
		description: string;
	}

	function outlinedStrokeWidth(width: number): number {
		return width + STROKE_OUTLINE_WIDTH;
	}

	function outlinedTextWidth(fontSize: number): number {
		return Math.max(3, fontSize * TEXT_OUTLINE_RATIO);
	}

	function normalizeDrawing(drawing: Drawing): Drawing {
		return { ...drawing, color };
	}

	function drawingSpace(drawing: Pick<Drawing, 'space'>): DrawingSpace {
		return drawing.space ?? 'scroll';
	}

	function isLayerHost(node: Element | null): node is HTMLDialogElement {
		return node instanceof HTMLDialogElement && node.open;
	}

	function isFeedbackDialog(node: HTMLDialogElement): boolean {
		return node.closest('[data-dryui-feedback]') !== null;
	}

	function resolveLayerHost(preferred?: HTMLElement | null): HTMLElement | null {
		const preferredHost = preferred ?? null;
		if (isLayerHost(preferredHost) && !isFeedbackDialog(preferredHost)) {
			return preferredHost;
		}

		const dialogs = Array.from(document.querySelectorAll<HTMLDialogElement>('dialog[open]')).filter(
			(dialog) => !isFeedbackDialog(dialog)
		);
		if (dialogs.length > 0) return dialogs.at(-1) ?? null;

		return null;
	}

	function syncLayerHost(preferred?: HTMLElement | null) {
		if (typeof document === 'undefined') return;
		layerHostEl = resolveLayerHost(preferred);
		updateLayerMetrics();
	}

	function updateLayerMetrics() {
		if (!layerHostEl) {
			if (layerOriginLeft !== 0) layerOriginLeft = 0;
			if (layerOriginTop !== 0) layerOriginTop = 0;
			return;
		}

		const rect = layerHostEl.getBoundingClientRect();
		const newLeft = rect.left + layerHostEl.clientLeft;
		const newTop = rect.top + layerHostEl.clientTop;
		if (newLeft !== layerOriginLeft) layerOriginLeft = newLeft;
		if (newTop !== layerOriginTop) layerOriginTop = newTop;
	}

	function toggle() {
		active = !active;
		if (!active) {
			currentStroke = null;
			currentArrow = null;
			commitText();
			erasing = false;
			moving = null;
		}
	}

	function setTool(t: Tool) {
		if (textInput) commitText();
		tool = t;
	}

	// --- Text ---

	function commitText() {
		const willAddText = !!(textInput && textInput.value.trim());
		if (textInput && willAddText) {
			drawings = [
				...drawings,
				{
					id: crypto.randomUUID(),
					kind: 'text',
					position: textInput.position,
					text: textInput.value.trim(),
					color,
					space: textInput.space,
					fontSize: TEXT_FONT_SIZE
				}
			];
		}
		textInput = null;
		justCommitted = true;
		saveVersion++;
		setTimeout(() => (justCommitted = false), 0);
		if (willAddText) commitHistory();
	}

	function handleTextKeyDown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			commitText();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			textInput = null;
		}
	}

	function handleTextInputFocusOut(event: FocusEvent) {
		const currentTarget = event.currentTarget as HTMLElement | null;
		if (currentTarget?.contains(event.relatedTarget as Node | null)) return;
		commitText();
	}

	function resolveScrollRoot(): HTMLElement | null {
		if (typeof document === 'undefined') return null;
		if (typeof scrollRoot === 'string') return document.querySelector<HTMLElement>(scrollRoot);
		if (typeof HTMLElement !== 'undefined' && scrollRoot instanceof HTMLElement) return scrollRoot;
		return null;
	}

	function updateScrollMetrics() {
		const target = resolveScrollRoot();
		scrollRootEl = target;

		let newLeft: number, newTop: number, newWidth: number, newHeight: number;
		let newScrollX: number, newScrollY: number;

		if (target) {
			const rect = target.getBoundingClientRect();
			newLeft = rect.left;
			newTop = rect.top;
			newWidth = rect.width;
			newHeight = rect.height;
			newScrollX = target.scrollLeft;
			newScrollY = target.scrollTop;
		} else {
			newLeft = 0;
			newTop = 0;
			newWidth = window.innerWidth;
			newHeight = window.innerHeight;
			newScrollX = window.scrollX;
			newScrollY = window.scrollY;
		}

		if (newLeft !== viewportLeft) viewportLeft = newLeft;
		if (newTop !== viewportTop) viewportTop = newTop;
		if (newWidth !== viewportWidth) viewportWidth = newWidth;
		if (newHeight !== viewportHeight) viewportHeight = newHeight;
		if (newScrollX !== scrollX) scrollX = newScrollX;
		if (newScrollY !== scrollY) scrollY = newScrollY;
	}

	function isInsideScrollViewport(point: { clientX: number; clientY: number }): boolean {
		if (!scrollRootEl) return true;

		return (
			point.clientX >= viewportLeft &&
			point.clientX <= viewportLeft + viewportWidth &&
			point.clientY >= viewportTop &&
			point.clientY <= viewportTop + viewportHeight
		);
	}

	function resolvePointerSpace(e: PointerEvent): DrawingSpace {
		if (!scrollRootEl || isInsideScrollViewport(e)) return 'scroll';
		return 'viewport';
	}

	function pointFromPointer(e: PointerEvent, space: DrawingSpace = resolvePointerSpace(e)): Point {
		if (space === 'viewport') {
			return { x: e.clientX, y: e.clientY };
		}

		return {
			x: e.clientX - viewportLeft + scrollX,
			y: e.clientY - viewportTop + scrollY
		};
	}

	function screenPoint(point: Point, space: DrawingSpace): Point {
		if (space === 'viewport') return point;
		return {
			x: viewportLeft - scrollX + point.x,
			y: viewportTop - scrollY + point.y
		};
	}

	function drawingTransform(space: DrawingSpace): string | undefined {
		if (space === 'viewport') return undefined;
		return `translate(${viewportLeft - scrollX} ${viewportTop - scrollY})`;
	}

	const scrollTransform = $derived(drawingTransform('scroll'));

	function removeToast(id: string) {
		toasts = toasts.filter((toast) => toast.id !== id);

		const timer = toastTimers[id];
		if (!timer) return;
		clearTimeout(timer);
		delete toastTimers[id];
	}

	function showToast(
		variant: FeedbackToast['variant'],
		title: string,
		description: string,
		duration: number
	) {
		const id = crypto.randomUUID();
		toasts = [...toasts, { id, variant, title, description }];
		toastTimers[id] = setTimeout(() => {
			removeToast(id);
		}, duration);
	}

	function textInputStyle(position: Point, space: DrawingSpace): string {
		const { x, y } = screenPoint(position, space);
		return `left: ${x}px; top: ${y - 10}px;`;
	}

	function feedbackRootStyle(): string | undefined {
		if (!layerHostEl) return undefined;
		return `left: ${-layerOriginLeft}px; top: ${-layerOriginTop}px;`;
	}

	function waitForNextPaint(): Promise<void> {
		return new Promise((resolve) => requestAnimationFrame(() => resolve()));
	}

	function normalizeWheelDelta(delta: number, deltaMode: number, pageSize: number): number {
		if (deltaMode === WheelEvent.DOM_DELTA_LINE) return delta * 16;
		if (deltaMode === WheelEvent.DOM_DELTA_PAGE) return delta * pageSize;
		return delta;
	}

	function findScrollableAncestor(start: Element | null): HTMLElement | null {
		let el = start instanceof HTMLElement ? start : (start?.parentElement ?? null);

		while (el) {
			const style = getComputedStyle(el);
			const canScrollY =
				SCROLLABLE_OVERFLOW.has(style.overflowY) && el.scrollHeight > el.clientHeight + 1;
			const canScrollX =
				SCROLLABLE_OVERFLOW.has(style.overflowX) && el.scrollWidth > el.clientWidth + 1;

			if (canScrollX || canScrollY) return el;
			el = el.parentElement;
		}

		return document.scrollingElement instanceof HTMLElement ? document.scrollingElement : null;
	}

	function resolveWheelTarget(e: WheelEvent): HTMLElement | null {
		if (scrollRootEl && isInsideScrollViewport(e)) return scrollRootEl;

		const overlay = e.currentTarget as SVGSVGElement | null;
		const previousPointerEvents = overlay?.style.pointerEvents ?? '';

		if (overlay) overlay.style.pointerEvents = 'none';
		const underlying = document.elementFromPoint(e.clientX, e.clientY);
		if (overlay) overlay.style.pointerEvents = previousPointerEvents;

		return findScrollableAncestor(underlying);
	}

	function handleWheel(e: WheelEvent) {
		const target = resolveWheelTarget(e);
		if (!target) return;

		const dx = normalizeWheelDelta(e.deltaX, e.deltaMode, target.clientWidth);
		const dy = normalizeWheelDelta(e.deltaY, e.deltaMode, target.clientHeight);

		if (dx === 0 && dy === 0) return;

		target.scrollLeft += dx;
		target.scrollTop += dy;
		e.preventDefault();
	}

	// --- Freehand path ---

	function pointsToPath(points: Point[]): string {
		if (points.length === 0) return '';
		if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;
		if (points.length === 2)
			return `M ${points[0]!.x} ${points[0]!.y} L ${points[1]!.x} ${points[1]!.y}`;

		const tension = 0.3;
		let d = `M ${points[0]!.x} ${points[0]!.y}`;

		for (let i = 0; i < points.length - 1; i++) {
			const p0 = points[Math.max(0, i - 1)]!;
			const p1 = points[i]!;
			const p2 = points[i + 1]!;
			const p3 = points[Math.min(points.length - 1, i + 2)]!;

			const cp1x = p1.x + (p2.x - p0.x) * tension;
			const cp1y = p1.y + (p2.y - p0.y) * tension;
			const cp2x = p2.x - (p3.x - p1.x) * tension;
			const cp2y = p2.y - (p3.y - p1.y) * tension;

			d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
		}

		return d;
	}

	// --- Arrow head path ---

	function arrowHeadPath(start: Point, end: Point): string {
		const dx = end.x - start.x;
		const dy = end.y - start.y;
		const len = Math.hypot(dx, dy);
		if (len === 0) return '';

		const ux = dx / len;
		const uy = dy / len;

		const tipX = end.x;
		const tipY = end.y;
		const leftX = tipX - ux * ARROW_HEAD_SIZE + uy * ARROW_HEAD_SIZE * 0.5;
		const leftY = tipY - uy * ARROW_HEAD_SIZE - ux * ARROW_HEAD_SIZE * 0.5;
		const rightX = tipX - ux * ARROW_HEAD_SIZE - uy * ARROW_HEAD_SIZE * 0.5;
		const rightY = tipY - uy * ARROW_HEAD_SIZE + ux * ARROW_HEAD_SIZE * 0.5;

		return `M ${leftX} ${leftY} L ${tipX} ${tipY} L ${rightX} ${rightY}`;
	}

	// --- Eraser ---

	function distToSegment(p: Point, a: Point, b: Point): number {
		const dx = b.x - a.x;
		const dy = b.y - a.y;
		const lenSq = dx * dx + dy * dy;
		if (lenSq === 0) return Math.hypot(p.x - a.x, p.y - a.y);
		const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / lenSq));
		return Math.hypot(p.x - (a.x + t * dx), p.y - (a.y + t * dy));
	}

	function drawingNearPoint(drawing: Drawing, px: number, py: number): boolean {
		const threshold =
			ERASE_RADIUS + (drawing.kind === 'text' ? drawing.fontSize : drawing.width) / 2;
		const space = drawingSpace(drawing);

		if (drawing.kind === 'freehand') {
			const pt = { x: px, y: py };
			for (let i = 0; i < drawing.points.length - 1; i++) {
				const start = screenPoint(drawing.points[i]!, space);
				const end = screenPoint(drawing.points[i + 1]!, space);
				if (distToSegment(pt, start, end) < threshold) return true;
			}
		} else if (drawing.kind === 'arrow') {
			const start = screenPoint(drawing.start, space);
			const end = screenPoint(drawing.end, space);
			if (distToSegment({ x: px, y: py }, start, end) < threshold) return true;
		} else {
			const position = screenPoint(drawing.position, space);
			const tx = position.x;
			const ty = position.y;
			const approxWidth = drawing.text.length * drawing.fontSize * 0.6;
			if (
				px >= tx - 4 &&
				px <= tx + approxWidth + 4 &&
				py >= ty - drawing.fontSize &&
				py <= ty + 4
			) {
				return true;
			}
		}
		return false;
	}

	function eraseAt(x: number, y: number) {
		const before = drawings.length;
		drawings = drawings.filter((d) => !drawingNearPoint(d, x, y));
		if (drawings.length !== before) saveVersion++;
	}

	// --- Move ---

	function findDrawingAt(x: number, y: number): Drawing | null {
		for (let i = drawings.length - 1; i >= 0; i--) {
			const d = drawings[i]!;
			if (drawingNearPoint(d, x, y)) return d;
		}
		return null;
	}

	function offsetDrawing(drawing: Drawing, dx: number, dy: number): Drawing {
		if (drawing.kind === 'freehand') {
			return { ...drawing, points: drawing.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) };
		} else if (drawing.kind === 'arrow') {
			return {
				...drawing,
				start: { x: drawing.start.x + dx, y: drawing.start.y + dy },
				end: { x: drawing.end.x + dx, y: drawing.end.y + dy }
			};
		} else {
			return {
				...drawing,
				position: { x: drawing.position.x + dx, y: drawing.position.y + dy }
			};
		}
	}

	// --- Pointer handlers ---

	function handlePointerDown(e: PointerEvent) {
		if (!annotationActive) return;
		const space = resolvePointerSpace(e);
		const point = pointFromPointer(e, space);

		if (tool === 'text') {
			e.preventDefault();
			if (textInput) {
				commitText();
				return;
			}
			if (justCommitted) return;

			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit && hit.kind === 'text') {
				textInput = {
					position: hit.position,
					value: hit.text,
					space: drawingSpace(hit)
				};
				drawings = drawings.filter((d) => d.id !== hit.id);
			} else {
				textInput = { position: point, value: '', space };
			}
			return;
		}

		e.preventDefault();
		(e.currentTarget as SVGSVGElement).setPointerCapture(e.pointerId);

		if (tool === 'pencil') {
			currentStroke = {
				id: crypto.randomUUID(),
				kind: 'freehand',
				points: [point],
				color,
				space,
				width: strokeWidth
			};
		} else if (tool === 'arrow') {
			currentArrow = {
				id: crypto.randomUUID(),
				kind: 'arrow',
				start: point,
				end: point,
				color,
				space,
				width: strokeWidth
			};
		} else if (tool === 'move') {
			const hit = findDrawingAt(e.clientX, e.clientY);
			if (hit) {
				const moveSpace = drawingSpace(hit);
				moving = {
					drawingId: hit.id,
					lastPoint: pointFromPointer(e, moveSpace),
					space: moveSpace
				};
				movedDuringDrag = false;
			}
		} else {
			erasing = true;
			erasedDuringDrag = false;
			const beforeLen = drawings.length;
			eraseAt(e.clientX, e.clientY);
			if (drawings.length !== beforeLen) erasedDuringDrag = true;
		}
	}

	function handlePointerMove(e: PointerEvent) {
		if (tool === 'pencil' && currentStroke) {
			e.preventDefault();
			const point = pointFromPointer(e, drawingSpace(currentStroke));
			currentStroke.points = [...currentStroke.points, point];
		} else if (tool === 'arrow' && currentArrow) {
			e.preventDefault();
			const point = pointFromPointer(e, drawingSpace(currentArrow));
			currentArrow.end = point;
		} else if (tool === 'move' && moving) {
			e.preventDefault();
			const point = pointFromPointer(e, moving.space);
			const dx = point.x - moving.lastPoint.x;
			const dy = point.y - moving.lastPoint.y;
			if (dx === 0 && dy === 0) return;
			drawings = drawings.map((d) => (d.id === moving!.drawingId ? offsetDrawing(d, dx, dy) : d));
			moving.lastPoint = point;
			movedDuringDrag = true;
		} else if (tool === 'eraser' && erasing) {
			e.preventDefault();
			const beforeLen = drawings.length;
			eraseAt(e.clientX, e.clientY);
			if (drawings.length !== beforeLen) erasedDuringDrag = true;
		}
	}

	function handlePointerUp() {
		let touched = false;
		if (tool === 'pencil' && currentStroke) {
			if (currentStroke.points.length > 1) {
				drawings = [...drawings, currentStroke];
				saveVersion++;
				touched = true;
			}
			currentStroke = null;
		} else if (tool === 'arrow' && currentArrow) {
			const dx = currentArrow.end.x - currentArrow.start.x;
			const dy = currentArrow.end.y - currentArrow.start.y;
			if (Math.hypot(dx, dy) > 5) {
				drawings = [...drawings, currentArrow];
				saveVersion++;
				touched = true;
			}
			currentArrow = null;
		} else if (tool === 'move' && moving) {
			moving = null;
			if (movedDuringDrag) {
				saveVersion++;
				touched = true;
			}
			movedDuringDrag = false;
		} else if (tool === 'eraser') {
			erasing = false;
			if (erasedDuringDrag) touched = true;
			erasedDuringDrag = false;
		}
		if (touched) commitHistory();
	}

	const hasDrawings = $derived(drawings.length > 0);
	const hasFeedback = $derived(hasDrawings || hasLayoutFeedback);
	const showOverlay = $derived(annotationActive || hasDrawings);
	const cursorClass = $derived(
		annotationActive
			? tool === 'eraser'
				? 'eraser-cursor'
				: tool === 'arrow'
					? 'arrow-cursor'
					: tool === 'text'
						? 'text-cursor'
						: tool === 'move'
							? 'move-cursor'
							: ''
			: ''
	);

	// --- Screenshot + Submit ---

	interface Screenshots {
		webp: string;
		png: string;
	}

	function stripDataUrlPrefix(dataUrl: string): string {
		const comma = dataUrl.indexOf(',');
		return comma === -1 ? dataUrl : dataUrl.slice(comma + 1);
	}

	interface AddedComponentSnapshot {
		id: string;
		kind: string;
		label?: string;
		props?: Record<string, unknown>;
		rect: { x: number; y: number; width: number; height: number };
	}

	interface RemovedElementSnapshot {
		tag: string;
		id?: string;
		selector?: string;
		rect: { x: number; y: number; width: number; height: number };
	}

	function snapshotAddedComponents(): AddedComponentSnapshot[] {
		const out: AddedComponentSnapshot[] = [];
		for (const [id, record] of addedComponents) {
			const rect = record.el.getBoundingClientRect();
			if (rect.width < 1 || rect.height < 1) continue;
			const props = parsePropsJson(record.propsJson);
			out.push({
				id,
				kind: record.kind,
				label: record.label?.trim() || undefined,
				props: Object.keys(props).length > 0 ? props : undefined,
				rect: { x: rect.left, y: rect.top, width: rect.width, height: rect.height }
			});
		}
		return out;
	}

	function snapshotRemovedElements(): RemovedElementSnapshot[] {
		const out: RemovedElementSnapshot[] = [];
		for (const record of removedElements.values()) {
			const descriptor = record.descriptor ?? { tag: 'unknown' };
			out.push({
				tag: descriptor.tag,
				...(descriptor.id ? { id: descriptor.id } : {}),
				...(descriptor.selector ? { selector: descriptor.selector } : {}),
				rect: record.rect
			});
		}
		return out;
	}

	function formatPropsForChip(props: Record<string, unknown>): string {
		const pairs = Object.entries(props)
			.filter(([, v]) => v !== undefined && v !== null && v !== '')
			.map(([k, v]) => {
				if (typeof v === 'string') return `${k}="${v}"`;
				if (typeof v === 'boolean' || typeof v === 'number') return `${k}={${v}}`;
				return `${k}={${JSON.stringify(v)}}`;
			});
		return pairs.length ? ' · ' + pairs.join(' ') : '';
	}

	function mountCaptureAnnotations(): () => void {
		const nodes: HTMLElement[] = [];
		const accent = 'hsl(25 100% 55%)';
		const danger = 'hsl(0 75% 55%)';

		for (const record of removedElements.values()) {
			const { rect } = record;
			if (rect.width < 1 || rect.height < 1) continue;
			const outline = document.createElement('div');
			outline.dataset.dryuiCaptureAnnotation = 'removed-outline';
			Object.assign(outline.style, {
				position: 'fixed',
				left: `${rect.x}px`,
				top: `${rect.y}px`,
				width: `${rect.width}px`,
				height: `${rect.height}px`,
				border: `2px dashed ${danger}`,
				borderRadius: '4px',
				background: 'hsl(0 75% 55% / 0.08)',
				pointerEvents: 'none',
				zIndex: '2147483646',
				boxSizing: 'border-box'
			});
			document.body.appendChild(outline);
			nodes.push(outline);

			const chipText = `removed: ${record.descriptor?.selector || record.descriptor?.tag || 'element'}`;
			const chip = document.createElement('div');
			chip.dataset.dryuiCaptureAnnotation = 'removed-chip';
			chip.textContent = chipText;
			const fitsAbove = rect.y >= 24;
			Object.assign(chip.style, {
				position: 'fixed',
				left: `${Math.max(4, rect.x)}px`,
				top: fitsAbove ? `${rect.y - 22}px` : `${rect.y + rect.height + 4}px`,
				maxWidth: `${Math.max(180, Math.min(window.innerWidth - rect.x - 8, rect.width + 80))}px`,
				padding: '3px 7px',
				borderRadius: '4px',
				background: danger,
				color: 'white',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: '11px',
				fontWeight: '700',
				lineHeight: '16px',
				letterSpacing: '0.01em',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				pointerEvents: 'none',
				zIndex: '2147483647',
				boxShadow: '0 2px 6px hsl(0 0% 0% / 0.4)'
			});
			document.body.appendChild(chip);
			nodes.push(chip);
		}

		for (const record of addedComponents.values()) {
			const rect = record.el.getBoundingClientRect();
			if (rect.width < 1 || rect.height < 1) continue;

			const outline = document.createElement('div');
			outline.dataset.dryuiCaptureAnnotation = 'outline';
			Object.assign(outline.style, {
				position: 'fixed',
				left: `${rect.left}px`,
				top: `${rect.top}px`,
				width: `${rect.width}px`,
				height: `${rect.height}px`,
				border: `2px solid ${accent}`,
				borderRadius: '4px',
				pointerEvents: 'none',
				zIndex: '2147483646',
				boxSizing: 'border-box'
			});
			document.body.appendChild(outline);
			nodes.push(outline);

			const props = parsePropsJson(record.propsJson);
			const labelText = record.label?.trim() || record.kind;
			const propsText = formatPropsForChip(props);
			const chip = document.createElement('div');
			chip.dataset.dryuiCaptureAnnotation = 'chip';
			chip.textContent = `<${labelText}>${propsText}`;

			const fitsAbove = rect.top >= 24;
			Object.assign(chip.style, {
				position: 'fixed',
				left: `${Math.max(4, rect.left)}px`,
				top: fitsAbove ? `${rect.top - 22}px` : `${rect.bottom + 4}px`,
				maxWidth: `${Math.max(180, Math.min(window.innerWidth - rect.left - 8, rect.width + 80))}px`,
				padding: '3px 7px',
				borderRadius: '4px',
				background: accent,
				color: 'black',
				fontFamily: 'system-ui, -apple-system, sans-serif',
				fontSize: '11px',
				fontWeight: '700',
				lineHeight: '16px',
				letterSpacing: '0.01em',
				whiteSpace: 'nowrap',
				overflow: 'hidden',
				textOverflow: 'ellipsis',
				pointerEvents: 'none',
				zIndex: '2147483647',
				boxShadow: '0 2px 6px hsl(0 0% 0% / 0.4)'
			});
			document.body.appendChild(chip);
			nodes.push(chip);
		}
		return () => {
			for (const n of nodes) n.remove();
		};
	}

	async function captureScreenshot(): Promise<{
		images: Screenshots;
		components: AddedComponentSnapshot[];
		removed: RemovedElementSnapshot[];
	}> {
		let stream: MediaStream | null = null;
		const video = document.createElement('video');
		let cleanupAnnotations: (() => void) | null = null;
		const components = snapshotAddedComponents();
		const removed = snapshotRemovedElements();

		const w = window.innerWidth;
		const h = window.innerHeight;

		try {
			if (!navigator.mediaDevices?.getDisplayMedia) {
				throw new Error('Browser screen capture is unavailable in this context.');
			}

			// Capture the current tab via Screen Capture API
			submitStatus = 'waiting-for-capture';
			toolbarHiddenForCapture = true;
			cleanupAnnotations = mountCaptureAnnotations();
			await waitForNextPaint();
			await waitForNextPaint();

			stream = await navigator.mediaDevices.getDisplayMedia({
				video: { displaySurface: 'browser' },
				preferCurrentTab: true
			} as DisplayMediaStreamOptions);

			submitStatus = 'capturing';

			video.srcObject = stream;
			video.muted = true;
			await video.play();

			// Wait one frame for the video to render
			await waitForNextPaint();

			const canvas = document.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			const ctx = canvas.getContext('2d');
			if (!ctx) throw new Error('Could not prepare screenshot capture.');

			// Draw the page capture
			ctx.drawImage(video, 0, 0, w, h);

			// Emit both WebP (compact, 0.8 quality) and PNG (lossless) so agents
			// that cannot decode WebP still have a readable copy.
			const webp = stripDataUrlPrefix(canvas.toDataURL('image/webp', 0.8));
			const png = stripDataUrlPrefix(canvas.toDataURL('image/png'));
			canvas.width = 0;
			canvas.height = 0;
			return { images: { webp, png }, components, removed };
		} finally {
			stream?.getTracks().forEach((track) => track.stop());
			video.srcObject = null;
			cleanupAnnotations?.();
			toolbarHiddenForCapture = false;
		}
	}

	function anchorPointFor(drawing: Drawing): Point | null {
		if (drawing.kind === 'freehand') return drawing.points[0] ?? null;
		if (drawing.kind === 'arrow') return drawing.end;
		return drawing.position;
	}

	function toViewportPoint(point: Point, space: DrawingSpace): Point {
		if (space === 'viewport') return point;
		return {
			x: point.x - scrollX + viewportLeft,
			y: point.y - scrollY + viewportTop
		};
	}

	function buildDrawingHints(items: Drawing[]): DrawingHint[] {
		const viewportW = window.innerWidth;
		const viewportH = window.innerHeight;

		// Temporarily disable pointer events on every descendant of the feedback
		// root so elementFromPoint resolves to the underlying page content instead
		// of our drawing canvas. The root itself sets pointer-events: none but its
		// children override that to auto, so we switch each descendant back off.
		const overlayChildren = Array.from(
			document.querySelectorAll<HTMLElement | SVGElement>('[data-dryui-feedback] *')
		);
		const previousPointerEvents = overlayChildren.map((el) => el.style.pointerEvents);
		for (const el of overlayChildren) el.style.pointerEvents = 'none';

		try {
			return items.map((drawing) => {
				const anchor = anchorPointFor(drawing);
				const space = drawingSpace(drawing);
				const viewportPoint = anchor
					? toViewportPoint(anchor, space)
					: { x: viewportW / 2, y: viewportH / 2 };

				const position = describePosition(viewportPoint.x, viewportPoint.y, viewportW, viewportH);

				let element: DrawingHint['element'];
				if (anchor) {
					const hit = document.elementFromPoint(viewportPoint.x, viewportPoint.y);
					const descriptor = describeElement(hit);
					if (descriptor) element = descriptor;
				}

				return {
					...position,
					...(element ? { element } : {})
				};
			});
		} finally {
			overlayChildren.forEach((el, index) => {
				el.style.pointerEvents = previousPointerEvents[index] ?? '';
			});
		}
	}

	async function readSubmissionId(response: Response): Promise<string | null> {
		try {
			const data = await response.json();
			if (typeof data === 'object' && data && 'id' in data && typeof data.id === 'string') {
				return data.id;
			}
		} catch {
			// Server didn't return JSON; opening the dashboard without focus is still useful.
		}
		return null;
	}

	function openDashboardTab(submissionId: string | null): void {
		if (!serverUrl || typeof window === 'undefined') return;
		const target = new URL('/ui/', serverUrl);
		if (submissionId) target.searchParams.set('focus', submissionId);
		window.open(target.toString(), DASHBOARD_TAB_NAME);
	}

	async function readSubmissionError(response: Response): Promise<string> {
		try {
			const data = await response.json();
			if (
				typeof data === 'object' &&
				data &&
				'error' in data &&
				typeof data.error === 'string' &&
				data.error.trim()
			) {
				return data.error.trim();
			}
		} catch {
			// Fall back to the HTTP metadata below when the body is not JSON.
		}

		if (response.statusText) {
			return `${response.status} ${response.statusText}`;
		}

		return `Request failed with status ${response.status}`;
	}

	function submissionErrorDescription(error: unknown): string {
		if (error instanceof DOMException) {
			if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
				return 'Screen capture was cancelled. Choose this browser tab when prompted to send feedback.';
			}

			if (error.name === 'NotFoundError') {
				return 'No capturable browser tab was available. Try again from the tab you want to annotate.';
			}
		}

		if (error instanceof Error && error.message.trim()) return error.message;
		return 'Please try again.';
	}

	function canonicalPageUrl(): string {
		if (typeof window === 'undefined') return '/';
		const url = new URL(window.location.href);
		url.searchParams.delete(FEEDBACK_QUERY_PARAM);
		url.hash = '';
		return url.toString();
	}

	function saveDrawings(pageUrl: string, version: number, drawingSnapshot: Drawing[]): void {
		if (!serverUrl || !pageUrl) return;
		lastSavedVersion = version;
		fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl)}`, {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(drawingSnapshot)
		}).catch(() => {});
	}

	function flushPendingDrawings(): void {
		if (!serverUrl || saveVersion === lastSavedVersion) return;
		clearTimeout(saveTimer);
		saveDrawings(currentPageUrl, saveVersion, drawings);
	}

	function syncCurrentPageUrl(): void {
		const nextPageUrl = canonicalPageUrl();
		if (nextPageUrl === currentPageUrl) return;
		flushPendingDrawings();
		currentPageUrl = nextPageUrl;
		drawings = [];
		lastSavedVersion = saveVersion;
		destroyAllLayoutClones();
		resetHistory(drawings);
	}

	async function handleSubmit() {
		if (!serverUrl || submitStatus !== 'idle' || sent) return;
		if (!hasFeedback) {
			showToast('error', 'No feedback', 'Add feedback first.', ERROR_TOAST_DURATION_MS);
			return;
		}
		try {
			const { images, components, removed } = await captureScreenshot();
			submitStatus = 'uploading';
			// Snapshot viewport + scroll after capture so the numbers line up with
			// the frame agents will read. buildDrawingHints reads the same window
			// metrics on purpose.
			const viewport = { width: window.innerWidth, height: window.innerHeight };
			const scroll = { x: scrollX, y: scrollY };
			const hints = buildDrawingHints(drawings);
			const layoutBoxesPayload = layoutBoxes.map((b) => ({
				id: b.id,
				label: b.label,
				pageX: Math.round(b.pageX),
				pageY: Math.round(b.pageY),
				width: Math.round(b.width),
				height: Math.round(b.height)
			}));
			const response = await fetch(`${serverUrl}/submissions`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					url: currentPageUrl,
					image: images,
					drawings,
					hints,
					viewport,
					scroll,
					...(components.length > 0 ? { components } : {}),
					...(removed.length > 0 ? { removed } : {}),
					...(layoutBoxesPayload.length > 0 ? { layoutBoxes: layoutBoxesPayload } : {})
				})
			});

			if (!response.ok) {
				throw new Error(await readSubmissionError(response));
			}

			const submissionId = await readSubmissionId(response);
			openDashboardTab(submissionId);

			submitStatus = 'idle';
			sent = true;
			showToast(
				'success',
				'Feedback sent',
				'Pick which agent to launch in the dashboard tab.',
				SUCCESS_TOAST_DURATION_MS
			);
			setTimeout(() => {
				sent = false;
				drawings = [];
				saveVersion++;
				active = false;
				inspectingComponents = false;
				inspectingLayout = false;
				selectedComponentEl = null;
				layoutBoxes = [];
				destroyAllLayoutClones();
				resetHistory([]);
			}, 1500);
		} catch (e) {
			console.error('Failed to submit feedback:', e);
			submitStatus = 'idle';
			sent = false;
			showToast('error', 'Feedback failed', submissionErrorDescription(e), ERROR_TOAST_DURATION_MS);
		}
	}

	// --- Persistence ---

	let lastSavedVersion = 0;
	let saveTimer: ReturnType<typeof setTimeout> | undefined;

	onMount(() => {
		syncCurrentPageUrl();

		const pushState = history.pushState;
		const replaceState = history.replaceState;
		const notifyLocationChange = () => window.dispatchEvent(new Event(LOCATION_CHANGE_EVENT));
		const handleLocationChange = () => syncCurrentPageUrl();
		const pushStateWithFeedbackNavigation: History['pushState'] = function (
			this: History,
			data: unknown,
			unused: string,
			url?: string | URL | null
		) {
			const result = pushState.call(this, data, unused, url);
			notifyLocationChange();
			return result;
		};
		const replaceStateWithFeedbackNavigation: History['replaceState'] = function (
			this: History,
			data: unknown,
			unused: string,
			url?: string | URL | null
		) {
			const result = replaceState.call(this, data, unused, url);
			notifyLocationChange();
			return result;
		};

		history.pushState = pushStateWithFeedbackNavigation;
		history.replaceState = replaceStateWithFeedbackNavigation;
		window.addEventListener('popstate', handleLocationChange);
		window.addEventListener('hashchange', handleLocationChange);
		window.addEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);

		return () => {
			if (history.pushState === pushStateWithFeedbackNavigation) history.pushState = pushState;
			if (history.replaceState === replaceStateWithFeedbackNavigation) {
				history.replaceState = replaceState;
			}
			window.removeEventListener('popstate', handleLocationChange);
			window.removeEventListener('hashchange', handleLocationChange);
			window.removeEventListener(LOCATION_CHANGE_EVENT, handleLocationChange);
		};
	});

	$effect(() => {
		if (typeof document === 'undefined') return;

		syncLayerHost();

		function handleLayerToggle(event: Event) {
			const newState = event instanceof ToggleEvent ? event.newState : undefined;
			const target = event.target;
			const preferredTarget = newState === 'open' && target instanceof HTMLElement ? target : null;
			syncLayerHost(preferredTarget);
		}

		const observer = new MutationObserver((records) => {
			for (const record of records) {
				if (record.target instanceof HTMLDialogElement && record.attributeName === 'open') {
					syncLayerHost(record.target.open ? record.target : null);
					return;
				}
			}
		});

		document.addEventListener('toggle', handleLayerToggle, true);
		document.addEventListener('close', handleLayerToggle, true);
		document.addEventListener('cancel', handleLayerToggle, true);
		observer.observe(document.body, {
			subtree: true,
			attributes: true,
			attributeFilter: ['open']
		});

		return () => {
			document.removeEventListener('toggle', handleLayerToggle, true);
			document.removeEventListener('close', handleLayerToggle, true);
			document.removeEventListener('cancel', handleLayerToggle, true);
			observer.disconnect();
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		updateScrollMetrics();
		updateLayerMetrics();

		const target = resolveScrollRoot();
		const host = layerHostEl;
		const updateAll = () => {
			updateScrollMetrics();
			updateLayerMetrics();
		};

		target?.addEventListener('scroll', updateScrollMetrics, { passive: true });
		window.addEventListener('scroll', updateScrollMetrics, { passive: true });
		window.addEventListener('resize', updateAll, { passive: true });

		const resizeObserver =
			typeof ResizeObserver !== 'undefined' && (target || host)
				? new ResizeObserver(updateAll)
				: null;
		if (target && resizeObserver) resizeObserver.observe(target);
		if (host && resizeObserver) resizeObserver.observe(host);

		return () => {
			target?.removeEventListener('scroll', updateScrollMetrics);
			window.removeEventListener('scroll', updateScrollMetrics);
			window.removeEventListener('resize', updateAll);
			resizeObserver?.disconnect();
		};
	});

	$effect(() => {
		const pageUrl = currentPageUrl;
		if (!serverUrl || !pageUrl) return;
		const versionAtRequest = untrack(() => saveVersion);
		const controller = new AbortController();
		fetch(`${serverUrl}/drawings?url=${encodeURIComponent(pageUrl)}`, {
			signal: controller.signal
		})
			.then((r) => r.json())
			.then((data: Drawing[]) => {
				if (saveVersion !== versionAtRequest) return;
				drawings = Array.isArray(data) ? data.map(normalizeDrawing) : [];
				lastSavedVersion = saveVersion;
				resetHistory(drawings);
			})
			.catch((error) => {
				if (error?.name === 'AbortError') return;
				lastSavedVersion = saveVersion;
			});
		return () => controller.abort();
	});

	$effect(() => {
		const v = saveVersion;
		const pageUrl = currentPageUrl;
		const drawingSnapshot = drawings;
		if (!serverUrl || !pageUrl || v === lastSavedVersion) return;

		clearTimeout(saveTimer);
		saveTimer = setTimeout(() => {
			saveDrawings(pageUrl, v, drawingSnapshot);
		}, 500);

		return () => clearTimeout(saveTimer);
	});

	$effect(() => {
		const node = toastLayerEl;
		if (!node) return;

		if (toasts.length === 0) {
			tryHidePopover(node);
			return;
		}

		if (layerHostEl && !layerHostEl.isConnected) return;

		const frame = requestAnimationFrame(() => {
			if (node.isConnected) tryShowPopover(node);
		});

		// Hide on cleanup so host-change re-promotion reopens in the top layer.
		return () => {
			cancelAnimationFrame(frame);
			tryHidePopover(node);
		};
	});

	$effect(() => {
		return () => {
			for (const timer of Object.values(toastTimers)) clearTimeout(timer);
			for (const id of Object.keys(toastTimers)) delete toastTimers[id];
		};
	});

	function handleHistoryKey(e: KeyboardEvent) {
		if (textInput) return;
		const target = e.target;
		if (target instanceof HTMLElement) {
			const tag = target.tagName;
			if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) return;
		}
		const meta = e.metaKey || e.ctrlKey;
		if (!meta || e.key.toLowerCase() !== 'z') return;
		const wantsRedo = e.shiftKey;
		if (wantsRedo ? !canRedo : !canUndo) return;
		e.preventDefault();
		e.stopPropagation();
		if (wantsRedo) redo();
		else undo();
	}

	$effect(() => {
		if (!canUndo && !canRedo) return;
		window.addEventListener('keydown', handleHistoryKey, true);
		return () => window.removeEventListener('keydown', handleHistoryKey, true);
	});

	$effect(() => {
		if (!placingComponent) return;
		function handleKey(e: KeyboardEvent) {
			if (e.key !== 'Escape') return;
			e.preventDefault();
			e.stopPropagation();
			cancelPlacingComponent();
		}
		window.addEventListener('keydown', handleKey, true);
		return () => window.removeEventListener('keydown', handleKey, true);
	});
</script>

{#if !feedbackDisabled}
	<Hotkey keys={shortcut} handler={toggle} />

	<Portal target={layerHostEl ?? 'body'}>
		<div
			class="feedback-root {className ?? ''}"
			data-dryui-feedback
			data-dismiss-ignore
			data-layer-hosted={layerHostEl ? '' : undefined}
			style={feedbackRootStyle()}
		>
			<div {@attach captureLayoutStage} class="layout-stage" aria-hidden="true"></div>

			{#if showOverlay}
				<svg
					class="drawing-canvas {cursorClass}"
					data-active={annotationActive || undefined}
					role="application"
					aria-label="Feedback drawing canvas"
					onpointerdown={handlePointerDown}
					onpointermove={handlePointerMove}
					onpointerup={handlePointerUp}
					onpointercancel={handlePointerUp}
					onwheel={handleWheel}
				>
					<defs>
						<filter id="annotation-shadow" x="-50%" y="-50%" width="200%" height="200%">
							<feDropShadow
								dx="0"
								dy="1.5"
								stdDeviation="1.5"
								flood-color="black"
								flood-opacity="0.35"
							/>
						</filter>
					</defs>

					{#each drawings as drawing (drawing.id)}
						{@const transform = drawingSpace(drawing) === 'scroll' ? scrollTransform : undefined}
						{#if drawing.kind === 'freehand'}
							<g filter="url(#annotation-shadow)" {transform}>
								<path
									d={pointsToPath(drawing.points)}
									stroke={ANNOTATION_OUTLINE}
									stroke-width={outlinedStrokeWidth(drawing.width)}
									stroke-linecap="round"
									stroke-linejoin="round"
									fill="none"
								/>
								<path
									d={pointsToPath(drawing.points)}
									stroke={drawing.color}
									stroke-width={drawing.width}
									stroke-linecap="round"
									stroke-linejoin="round"
									fill="none"
								/>
							</g>
						{:else if drawing.kind === 'arrow'}
							<g filter="url(#annotation-shadow)" {transform}>
								<line
									x1={drawing.start.x}
									y1={drawing.start.y}
									x2={drawing.end.x}
									y2={drawing.end.y}
									stroke={ANNOTATION_OUTLINE}
									stroke-width={outlinedStrokeWidth(drawing.width)}
									stroke-linecap="round"
								/>
								<path
									d={arrowHeadPath(drawing.start, drawing.end)}
									stroke={ANNOTATION_OUTLINE}
									stroke-width={outlinedStrokeWidth(drawing.width)}
									stroke-linecap="round"
									stroke-linejoin="round"
									fill="none"
								/>
								<line
									x1={drawing.start.x}
									y1={drawing.start.y}
									x2={drawing.end.x}
									y2={drawing.end.y}
									stroke={drawing.color}
									stroke-width={drawing.width}
									stroke-linecap="round"
								/>
								<path
									d={arrowHeadPath(drawing.start, drawing.end)}
									stroke={drawing.color}
									stroke-width={drawing.width}
									stroke-linecap="round"
									stroke-linejoin="round"
									fill="none"
								/>
							</g>
						{:else}
							<text
								x={drawing.position.x}
								y={drawing.position.y}
								{transform}
								filter="url(#annotation-shadow)"
								fill={drawing.color}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedTextWidth(drawing.fontSize)}
								paint-order="stroke fill"
								stroke-linejoin="round"
								font-size={drawing.fontSize}
								font-family="system-ui, -apple-system, sans-serif"
								font-weight="600">{drawing.text}</text
							>
						{/if}
					{/each}

					{#if currentStroke}
						<g
							filter="url(#annotation-shadow)"
							transform={drawingTransform(drawingSpace(currentStroke))}
						>
							<path
								d={pointsToPath(currentStroke.points)}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(currentStroke.width)}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
							<path
								d={pointsToPath(currentStroke.points)}
								stroke={currentStroke.color}
								stroke-width={currentStroke.width}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
						</g>
					{/if}

					{#if currentArrow}
						<g
							filter="url(#annotation-shadow)"
							transform={drawingTransform(drawingSpace(currentArrow))}
						>
							<line
								x1={currentArrow.start.x}
								y1={currentArrow.start.y}
								x2={currentArrow.end.x}
								y2={currentArrow.end.y}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(currentArrow.width)}
								stroke-linecap="round"
							/>
							<path
								d={arrowHeadPath(currentArrow.start, currentArrow.end)}
								stroke={ANNOTATION_OUTLINE}
								stroke-width={outlinedStrokeWidth(currentArrow.width)}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
							<line
								x1={currentArrow.start.x}
								y1={currentArrow.start.y}
								x2={currentArrow.end.x}
								y2={currentArrow.end.y}
								stroke={currentArrow.color}
								stroke-width={currentArrow.width}
								stroke-linecap="round"
							/>
							<path
								d={arrowHeadPath(currentArrow.start, currentArrow.end)}
								stroke={currentArrow.color}
								stroke-width={currentArrow.width}
								stroke-linecap="round"
								stroke-linejoin="round"
								fill="none"
							/>
						</g>
					{/if}
				</svg>
			{/if}

			{#if textInput}
				<div
					class="text-input-wrap"
					{@attach captureTextInputWrap}
					style={textInputStyle(textInput.position, textInput.space)}
					onfocusout={handleTextInputFocusOut}
				>
					<Input
						type="text"
						size="sm"
						data-feedback-text-input
						aria-label="Annotation text"
						bind:value={textInput.value}
						onkeydown={handleTextKeyDown}
						placeholder="Type annotation..."
					/>
					<Button
						variant="solid"
						size="sm"
						color={null}
						onclick={commitText}
						aria-label="Confirm annotation"
					>
						<Check size={14} />
					</Button>
				</div>
			{/if}

			<Toolbar
				{active}
				{tool}
				{mode}
				hidden={toolbarHiddenForCapture}
				{submitStatus}
				{sent}
				hasSelection={selectedComponentEl !== null}
				placing={placingComponent}
				addedKind={selectedAddedRecord?.kind ?? null}
				addedLabel={selectedAddedRecord?.label ?? ''}
				addedPropsJson={selectedAddedRecord?.propsJson ?? ''}
				{layoutTool}
				{canUndo}
				{canRedo}
				ontoggle={toggle}
				ontoolchange={setTool}
				onsubmit={handleSubmit}
				onmodechange={setMode}
				onlayouttool={setLayoutTool}
				oncomponentsreset={resetSelectedComponent}
				onundo={undo}
				onredo={redo}
				ondeselect={() => selectComponent(null)}
				onaddcomponent={startPlacingComponent}
				oncancelplacement={cancelPlacingComponent}
				onapplyprops={applyAddedProps}
				onremoveselected={removeSelectedElement}
			/>

			{#if inspectingComponents}
				<ComponentsInspector
					selectedElement={selectedComponentEl}
					getClone={resolveInspectorClone}
					onselect={selectComponent}
					onclose={stopInspectingComponents}
					oncommit={commitHistory}
				/>
			{/if}

			{#if inspectingLayout}
				<LayoutInspector
					tool={layoutTool}
					boxes={layoutBoxes}
					capturing={toolbarHiddenForCapture}
					onclose={stopInspectingLayout}
					ontool={setLayoutTool}
					oncommit={commitHistory}
					oncapture={ensureGridInitialSnapshot}
					oncapturelabel={ensureLabelInitialSnapshot}
					onboxesapply={(next) => applyLayoutBoxes(next, false)}
					onboxescommit={(next) => applyLayoutBoxes(next, true)}
				/>
			{:else if layoutBoxes.length > 0}
				<LayoutBoxesOverlay boxes={layoutBoxes} />
			{/if}

			{#if placingComponent}
				<div
					class="placement-overlay"
					role="presentation"
					onpointerdown={(e) => placeComponentAt(e.clientX, e.clientY)}
				>
					<span class="placement-hint">
						<span class="placement-hint-dot" aria-hidden="true"></span>
						<span>Click to place</span>
						<strong>{placingComponent}</strong>
					</span>
				</div>
			{/if}
		</div>

		<div
			bind:this={toastLayerEl}
			popover="manual"
			role="region"
			aria-label="Feedback notifications"
			data-dryui-feedback-toast-layer
			data-dry-stagger
			data-position="top-right"
			class="feedback-toast-provider"
		>
			{#each toasts as toast (toast.id)}
				<Toast.Root id={toast.id} variant={toast.variant}>
					<div class="feedback-toast-copy">
						<Toast.Title>{toast.title}</Toast.Title>
						<Toast.Description>{toast.description}</Toast.Description>
					</div>
				</Toast.Root>
			{/each}
		</div>
	</Portal>
{/if}

<style>
	.feedback-root {
		--dry-feedback-edge-block: max(24px, env(safe-area-inset-bottom));
		--dry-feedback-edge-inline: max(24px, env(safe-area-inset-right));

		container: dryui-feedback-root / inline-size;
		position: fixed;
		inset: 0;
		inline-size: 100vw;
		block-size: 100vh;
		z-index: 9998;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		overflow: visible;
		pointer-events: none;
	}

	.feedback-root[data-layer-hosted] {
		inset: auto;
	}

	.layout-stage {
		position: fixed;
		inset: 0;
		z-index: 9998;
		pointer-events: none;
	}

	[data-dryui-feedback] :global {
		* {
			pointer-events: auto;
		}
	}

	.feedback-root .layout-stage,
	.feedback-root .layout-stage :global(*) {
		pointer-events: none;
	}

	.drawing-canvas {
		position: absolute;
		inset: 0;
		z-index: 9999;
		inline-size: 100%;
		block-size: 100%;
		pointer-events: none;
	}

	.drawing-canvas[data-active] {
		pointer-events: all;
		touch-action: none;
		cursor:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg transform='translate(0.6%200.8)' opacity='0.35' stroke='%23000' stroke-width='5'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='4'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3Cg stroke='%23ff7b1a' stroke-width='2.4'%3E%3Cpath d='M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z'/%3E%3Cpath d='m15 5 4 4'/%3E%3C/g%3E%3C/svg%3E")
				2 30,
			crosshair;
	}

	.drawing-canvas.arrow-cursor[data-active] {
		cursor: crosshair;
	}

	.drawing-canvas.text-cursor[data-active] {
		cursor: text;
	}

	.drawing-canvas.move-cursor[data-active] {
		cursor: grab;
	}

	.drawing-canvas.eraser-cursor[data-active] {
		cursor:
			url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke-linecap='round' stroke-linejoin='round'%3E%3Cg transform='translate(0.6%200.8)' opacity='0.35' stroke='%23000' stroke-width='5'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3Cg stroke='white' stroke-width='4'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3Cg stroke='%23ff7b1a' stroke-width='2.4'%3E%3Cpath d='M21 21H8a2 2 0 0 1-1.42-.587l-3.994-3.999a2 2 0 0 1 0-2.828l10-10a2 2 0 0 1 2.829 0l5.999 6a2 2 0 0 1 0 2.828L12.834 21'/%3E%3Cpath d='m5.082 11.09 8.828 8.828'/%3E%3C/g%3E%3C/svg%3E")
				4 28,
			crosshair;
	}

	.text-input-wrap {
		--dry-btn-accent: hsl(25 100% 55%);
		--dry-btn-accent-active: hsl(25 100% 50%);
		--dry-btn-accent-hover: hsl(25 100% 62%);
		--dry-btn-active-transform: none;
		--dry-btn-border: transparent;
		--dry-btn-color: black;
		--dry-btn-min-height: 0;
		--dry-btn-on-accent: black;
		--dry-btn-padding-x: 8px;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 0;
		--dry-form-control-border-hover: transparent;
		--dry-form-control-color-placeholder: hsl(0 0% 20%);
		--dry-input-bg: hsl(25 100% 55%);
		--dry-input-border: transparent;
		--dry-input-color: black;
		--dry-input-font-size: 16px;
		--dry-input-padding-x: 8px;
		--dry-input-padding-y: 4px;
		--dry-input-radius: 0;
		--dry-shadow-raised: none;
		--dry-shadow-sm: none;
		position: absolute;
		z-index: 10001;
		display: grid;
		grid-template-columns: minmax(180px, 1fr) auto;
		column-gap: 2px;
		border: 2px solid white;
		border-radius: 6px;
		background: white;
		font-weight: 600;
		box-shadow:
			0 0 0 1px black,
			0 8px 20px hsl(0 0% 0% / 0.3);
		backdrop-filter: blur(4px);
		overflow: hidden;
	}

	.placement-overlay {
		position: fixed;
		inset: 0;
		z-index: 10001;
		display: grid;
		place-items: start center;
		padding-block-start: 24vh;
		background: hsl(25 100% 55% / 0.04);
		cursor: crosshair;
		pointer-events: auto;
		touch-action: none;
	}

	.placement-hint {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		padding: 8px 14px;
		border-radius: 999px;
		background: hsl(225 15% 15% / 0.95);
		backdrop-filter: blur(8px);
		color: hsl(220 10% 92%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.02em;
		box-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
	}

	.placement-hint strong {
		color: hsl(25 100% 80%);
		font-weight: 700;
	}

	.placement-hint-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: hsl(25 100% 55%);
		box-shadow: 0 0 8px hsl(25 100% 55% / 0.6);
	}

	.feedback-toast-provider {
		--dry-layer-overlay: 10002;
		--dry-space-1: 4px;
		--dry-space-2: 8px;
		--dry-space-3: 12px;
		--dry-space-4: 16px;
		--dry-space-8: 32px;
		--dry-space-12: 48px;
		--dry-radius-lg: 16px;
		--dry-shadow-lg: 0 18px 36px hsl(0 0% 0% / 0.34);
		--dry-duration-normal: 180ms;
		--dry-ease-out: cubic-bezier(0.16, 1, 0.3, 1);
		--dry-ease-in: cubic-bezier(0.7, 0, 0.84, 0);
		--dry-font-sans: 'Inter', 'Helvetica Neue', 'Segoe UI', system-ui, sans-serif;
		--dry-type-small-size: 0.875rem;
		--dry-type-small-leading: 1.35;
		--dry-type-tiny-size: 0.75rem;
		--dry-type-tiny-leading: 1.45;
		--dry-color-bg-overlay: hsl(228 18% 12% / 0.98);
		--dry-color-text-strong: hsl(0 0% 100%);
		--dry-color-text-weak: hsl(220 14% 84%);
		--dry-color-stroke-weak: hsl(220 13% 34%);
		--dry-color-fill-success: hsl(145 65% 46%);
		--dry-color-fill-success-weak: hsl(145 50% 18% / 0.96);
		--dry-color-stroke-success: hsl(145 52% 38%);
		--dry-color-fill-error: hsl(6 84% 58%);
		--dry-color-fill-error-weak: hsl(6 58% 18% / 0.96);
		--dry-color-stroke-error: hsl(6 58% 40%);

		position: fixed;
		inset: var(--dry-space-4) var(--dry-space-4) auto auto;
		z-index: var(--dry-layer-overlay);
		display: grid;
		grid-template-columns: minmax(0, min(420px, calc(100vw - var(--dry-space-8))));
		gap: var(--dry-space-3);
		padding: 0;
		margin: 0;
		border: none;
		background: transparent;
		color: inherit;
		overflow: visible;
		container-type: inline-size;
		pointer-events: none;
	}

	.feedback-toast-provider:not(:popover-open) {
		display: none;
	}

	.feedback-toast-copy {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 4px;
	}

	@container dryui-feedback-root (max-width: 36rem) {
		.placement-overlay {
			place-items: start stretch;
			padding-inline: var(--dry-space-3);
		}

		.placement-hint {
			grid-auto-flow: row;
			justify-items: center;
			text-align: center;
			border-radius: var(--dry-radius-lg);
		}

		.feedback-toast-provider {
			inset: max(var(--dry-space-2), env(safe-area-inset-top))
				max(var(--dry-space-2), env(safe-area-inset-right)) auto
				max(var(--dry-space-2), env(safe-area-inset-left));
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
