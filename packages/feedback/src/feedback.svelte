<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Hotkey } from '@dryui/primitives/hotkey';
	import { Button, Portal, Slider, Text } from '@dryui/ui';
	import type {
		Annotation,
		ConnectionStatus,
		DesignPlacement,
		FeedbackLayoutMode,
		FeedbackProps,
		FeedbackSettings,
		RearrangeState,
		Rect,
		ThreadMessage,
		WireframeState
	} from './types.js';
	import type { CanvasPurpose, LayoutModeComponentType } from './layout-mode/index.js';
	import {
		getAccessibilityInfo,
		getElementClasses,
		getForensicComputedStyles,
		getFullElementPath,
		getNearbyElements,
		getNearbyText,
		identifyElement
	} from './utils/element-id.js';
	import {
		getPopupPosition,
		hasMeaningfulArea,
		intersectsRect,
		normalizeText,
		rectFromPoints,
		toRect,
		type Point,
		unionRects,
		uniqueLabels
	} from './utils/selection.js';
	import { closestCrossingShadow, deepElementFromPoint } from './utils/shadow-dom.js';
	import { detectDryUIComponent } from './utils/dryui-detection.js';
	import { detectSvelteMetadata } from './utils/svelte-detection.js';
	import {
		clearDesignPlacementsForUrl,
		clearRearrangeStateForUrl,
		clearSessionIdForUrl,
		clearWireframeStateForUrl,
		loadAllAnnotations,
		loadAnnotationsForUrl,
		loadDesignPlacementsForUrl,
		loadRearrangeStateForUrl,
		loadSessionIdForUrl,
		loadSettings,
		loadToolbarHidden,
		loadWireframeStateForUrl,
		saveAnnotationsForUrl,
		saveAnnotationsWithSyncMarker,
		saveDesignPlacementsForUrl,
		saveRearrangeStateForUrl,
		saveSessionIdForUrl,
		saveSettings,
		saveToolbarHidden,
		saveWireframeStateForUrl
	} from './utils/storage.js';
	import { generateOutput } from './utils/output.js';
	import { freezeAnimations, unfreezeAnimations } from './utils/freeze.js';
	import {
		createSession,
		deleteAnnotation as deleteAnnotationOnServer,
		getSession,
		requestAction,
		replyToAnnotation as replyToAnnotationOnServer,
		syncAnnotation as syncAnnotationToServer,
		updateAnnotation as updateAnnotationOnServer
	} from './utils/sync.js';
	import {
		DEFAULT_SIZES,
		DesignMode,
		DesignPalette,
		RearrangeOverlay,
		detectPageSections
	} from './layout-mode/index.js';
	import ComponentActions from './layout-mode/component-actions.svelte';
	import ComponentPicker from './layout-mode/component-picker.svelte';
	import RouteCreator from './layout-mode/route-creator.svelte';
	import { createHistory } from './layout-mode/history.js';
	import { generateSketchBrief, generateEditBrief } from './layout-mode/output.js';
	import type { ComponentAction, CanvasWidth } from './layout-mode/types.js';
	import { DEFAULT_SETTINGS } from './constants.js';
	import AnnotationMarker from './components/annotation-marker.svelte';
	import AnnotationPopup from './components/annotation-popup.svelte';
	import HighlightOverlay from './components/highlight-overlay.svelte';
	import FeedbackToolbar from './components/toolbar.svelte';

	interface PendingDraft {
		elementLabel: string;
		position: { x: number; y: number };
		data: Omit<Annotation, 'id' | 'timestamp' | 'comment' | 'kind' | 'color'> & Partial<Annotation>;
	}

	type CopyState = 'idle' | 'copied';
	type SubmitState = 'idle' | 'sending' | 'sent' | 'failed';

	interface MultiSelectTarget {
		element: Element;
		label: string;
		path: string;
		rect: Rect;
	}

	interface MovedSectionEntry {
		el: HTMLElement;
		originalStyles: {
			transform: string;
			transformOrigin: string;
			opacity: string;
			position: string;
			zIndex: string;
			display: string;
			transition: string;
		};
		ancestors: Array<{
			el: HTMLElement;
			overflow: string;
			overflowX: string;
			overflowY: string;
		}>;
	}

	interface RemoteAnnotationContext {
		x?: number;
		y?: number;
		isFixed?: boolean;
		boundingBox?: Rect;
		selectedText?: string;
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
	}

	interface RemoteAnnotationPayload {
		id?: string;
		element?: string | null;
		elementPath?: string;
		element_path?: string | null;
		comment?: string;
		status?: Annotation['status'];
		intent?: Annotation['intent'];
		severity?: Annotation['severity'];
		timestamp?: number;
		created_at?: number;
		kind?: Annotation['kind'];
		color?: Annotation['color'];
		context_json?: string | null;
		x?: number;
		y?: number;
		isFixed?: boolean;
		boundingBox?: Rect;
		selectedText?: string;
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
		thread?: Annotation['thread'];
		resolvedAt?: string;
		resolved_at?: number | string | null;
		resolvedBy?: Annotation['resolvedBy'];
		resolved_by?: string | null;
		resolutionNote?: string;
		resolution_note?: string | null;
		sessionId?: string;
		url?: string;
	}

	const DRAG_THRESHOLD_PX = 8;
	const POPUP_WIDTH_PX = 340;
	const MAX_AREA_TARGETS = 12;
	const CONNECTION_POLL_MS = 10_000;
	const BLOCKED_INTERACTION_SELECTOR = [
		'a',
		'button',
		'input',
		'select',
		'summary',
		'textarea',
		'[onclick]',
		'[role="button"]',
		'[role="link"]',
		'[tabindex]'
	].join(', ');
	const HIDDEN_ANNOTATION_STATUSES = new Set(['dismissed']);
	const INTERACTIVE_TAGS = new Set([
		'a',
		'article',
		'button',
		'img',
		'input',
		'label',
		'option',
		'section',
		'select',
		'summary',
		'svg',
		'textarea'
	]);
	const EMPTY_REARRANGE_STATE = (): RearrangeState => ({
		sections: [],
		originalOrder: [],
		detectedAt: Date.now()
	});

	function isRenderableAnnotation(annotation: Annotation): boolean {
		return !annotation.status || !HIDDEN_ANNOTATION_STATUSES.has(annotation.status);
	}

	let {
		annotations: externalAnnotations,
		onAnnotationAdd,
		onAnnotationUpdate,
		onAnnotationReply,
		onAnnotationDelete,
		onAnnotationsClear,
		onCopy,
		onSubmit,
		onSessionCreated,
		copyToClipboard = true,
		defaultDetail = 'standard',
		defaultColor = DEFAULT_SETTINGS.annotationColor,
		defaultTheme = 'dark',
		enableDesignMode = true,
		enableRearrange = true,
		enableSvelteDetection = true,
		endpoint,
		sessionId: providedSessionId,
		webhookUrl,
		shortcut = 'meta+m',
		class: className
	}: FeedbackProps = $props();

	const pathname = typeof window !== 'undefined' ? window.location.pathname : '/';
	const storageUrl = typeof window !== 'undefined' ? window.location.href : pathname;
	const initialSettings = (() => {
		const stored = loadSettings();
		return {
			...stored,
			outputDetail: stored.outputDetail ?? defaultDetail,
			annotationColor: stored.annotationColor ?? defaultColor,
			theme: stored.theme ?? defaultTheme
		} satisfies FeedbackSettings;
	})();

	let active = $state(false);
	let localAnnotations = $state<Annotation[]>(
		loadAnnotationsForUrl(storageUrl).filter(isRenderableAnnotation)
	);
	let hoverRect = $state<Rect | null>(null);
	let hoverLabel = $state<string | undefined>(undefined);
	let markerHoverRect = $state<Rect | null>(null);
	let markerHoverLabel = $state<string | undefined>(undefined);
	let pendingDraft = $state<PendingDraft | null>(null);
	let pendingPosition = $state<{ x: number; y: number }>({ x: 0, y: 0 });
	let popupColor = $state<Annotation['color']>(initialSettings.annotationColor);
	let editingAnnotation = $state<Annotation | null>(null);
	let settings = $state<FeedbackSettings>(initialSettings);
	let pointerDown = $state<Point | null>(null);
	let dragRect = $state<Rect | null>(null);
	let pendingMultiSelectTargets = $state<MultiSelectTarget[]>([]);
	let suppressClick = $state(false);
	let toolbarHidden = $state(loadToolbarHidden());
	let paused = $state(false);
	let showMarkers = $state(true);
	let layoutMode = $state<FeedbackLayoutMode>('idle');
	let paletteOpen = $state(false);
	let overlayInteracting = $state(false);
	let activeComponent = $state<LayoutModeComponentType | null>(null);
	let designPlacements = $state<DesignPlacement[]>(loadDesignPlacementsForUrl(storageUrl));
	let rearrangeState = $state<RearrangeState | null>(loadRearrangeStateForUrl(storageUrl));
	let copyState = $state<CopyState>('idle');
	let submitState = $state<SubmitState>('idle');
	let designSelectedIds = $state<string[]>([]);
	let rearrangeSelectedIds = $state<string[]>([]);
	let designSelectionCount = $state(0);
	let rearrangeSelectionCount = $state(0);
	let designDeselectSignal = $state(0);
	let rearrangeDeselectSignal = $state(0);
	let designClearSignal = $state(0);
	let rearrangeClearSignal = $state(0);
	let canvasOpacity = $state(0.92);

	function applyCanvasOpacity(node: HTMLElement, opacity: number) {
		node.style.setProperty('opacity', String(opacity));
		return {
			update(o: number) {
				node.style.setProperty('opacity', String(o));
			}
		};
	}
	let componentPickerOpen = $state(false);
	let routeCreatorOpen = $state(false);
	let componentActionsTarget = $state<{
		name: string;
		selector: string;
		props: Record<string, string>;
		position: { x: number; y: number };
	} | null>(null);
	let pendingComponentActions = $state<ComponentAction[]>([]);
	let canvasWidth = $state<CanvasWidth>(1280);
	let newPageRoute = $state<string | null>(null);
	let newPageRecipe = $state<string | null>(null);
	const layoutHistory = createHistory();

	const initialWireframeState = loadWireframeStateForUrl(storageUrl);
	let canvasPurpose = $state<CanvasPurpose>(
		initialWireframeState ? initialWireframeState.purpose : 'replace-current'
	);
	let wireframePrompt = $state(initialWireframeState?.prompt ?? '');
	let exploreStash = $state<WireframeState>({
		rearrange: loadRearrangeStateForUrl(storageUrl),
		placements: loadDesignPlacementsForUrl(storageUrl),
		purpose: 'replace-current',
		prompt: ''
	});
	let currentSessionId = $state<string | null>(null);
	let connectionStatus = $state<ConnectionStatus>('disconnected');
	let sessionBootstrapRequested = false;
	let previousConnectionStatus: ConnectionStatus | null = null;
	const placementShadowIds = new Map<string, string>();
	const placementShadowSnapshots = new Map<string, string>();
	const rearrangeShadowIds = new Map<string, string>();
	const rearrangeShadowSnapshots = new Map<string, string>();
	const movedSections = new Map<string, MovedSectionEntry>();
	let crossDesignDragStart: Map<string, { x: number; y: number }> | null = null;
	let crossRearrangeDragStart: Map<string, { x: number; y: number }> | null = null;

	const useExternal = $derived(externalAnnotations !== undefined);
	const annotations = $derived(
		(useExternal ? externalAnnotations! : localAnnotations).filter(isRenderableAnnotation)
	);
	const outputDetail = $derived(settings.outputDetail ?? defaultDetail);
	const annotationColor = $derived(settings.annotationColor ?? defaultColor);
	const svelteDetectionEnabled = $derived(enableSvelteDetection && settings.svelteDetection);
	const layoutActive = $derived(layoutMode !== 'idle');
	const rearrangeActive = $derived(layoutMode === 'rearrange');
	const annotatingPage = $derived(active && layoutMode === 'idle');
	const showPopup = $derived(pendingDraft !== null || editingAnnotation !== null);
	const blankCanvas = $derived(canvasPurpose === 'new-page');
	const submitTargetUrl = $derived((settings.webhookUrl || webhookUrl || '').trim());
	const shouldShowMarkers = $derived(active && showMarkers && layoutMode === 'idle');
	const activeHighlightRect = $derived(markerHoverRect ?? hoverRect);
	const activeHighlightLabel = $derived(markerHoverLabel ?? hoverLabel);
	const hasLayoutOutput = $derived(
		designPlacements.length > 0 || (rearrangeState?.sections.length ?? 0) > 0
	);
	const hasOutput = $derived(annotations.length > 0 || hasLayoutOutput);
	const copyLabel = $derived(layoutActive && blankCanvas ? 'Copy layout' : undefined);
	const popupElement = $derived(
		editingAnnotation ? editingAnnotation.element : pendingDraft ? pendingDraft.elementLabel : ''
	);
	const popupInitialValue = $derived(editingAnnotation?.comment ?? '');
	const popupSelectedText = $derived(
		editingAnnotation?.selectedText ?? pendingDraft?.data.selectedText ?? undefined
	);
	const popupComputedStyles = $derived(
		editingAnnotation?.computedStyles ?? pendingDraft?.data.computedStyles ?? undefined
	);
	const canSubmit = $derived(
		onSubmit !== undefined || Boolean(endpoint) || submitTargetUrl.length > 0
	);

	function persistAnnotations(updated: Annotation[]) {
		if (!useExternal) {
			localAnnotations = updated;
			saveAnnotationsForUrl(storageUrl, updated);
		}
	}

	function pageUrl(path = pathname): string {
		if (typeof window === 'undefined') return path;
		return new URL(path, window.location.origin).toString();
	}

	function isCurrentPagePath(path: string): boolean {
		if (path === pathname) return true;
		if (typeof window === 'undefined') return false;

		try {
			return new URL(path, window.location.origin).pathname === pathname;
		} catch {
			return false;
		}
	}

	function displayPath(): string {
		if (typeof window === 'undefined') return pathname;
		return `${window.location.pathname}${window.location.search}${window.location.hash}`;
	}

	function setCopyState(next: CopyState) {
		copyState = next;
		if (next === 'idle' || typeof window === 'undefined') return;

		window.setTimeout(() => {
			if (copyState === next) {
				copyState = 'idle';
			}
		}, 2000);
	}

	function setSubmitState(next: SubmitState) {
		submitState = next;
		if (next === 'idle' || next === 'sending' || typeof window === 'undefined') return;

		window.setTimeout(() => {
			if (submitState === next) {
				submitState = 'idle';
			}
		}, 2500);
	}

	function isValidHttpUrl(value: string): boolean {
		if (!value) return false;
		try {
			const parsed = new URL(value);
			return parsed.protocol === 'http:' || parsed.protocol === 'https:';
		} catch {
			return false;
		}
	}

	function isRecord(value: unknown): value is Record<string, unknown> {
		return typeof value === 'object' && value !== null;
	}

	function isRect(value: unknown): value is Rect {
		return (
			isRecord(value) &&
			typeof value['x'] === 'number' &&
			typeof value['y'] === 'number' &&
			typeof value['width'] === 'number' &&
			typeof value['height'] === 'number'
		);
	}

	function toResolvedAt(
		value: RemoteAnnotationPayload['resolvedAt'] | RemoteAnnotationPayload['resolved_at']
	): string | undefined {
		if (typeof value === 'string' && value.trim().length > 0) {
			return value;
		}

		if (typeof value === 'number' && Number.isFinite(value)) {
			return new Date(value).toISOString();
		}

		return undefined;
	}

	function toResolvedBy(value: unknown): Annotation['resolvedBy'] | undefined {
		return value === 'human' || value === 'agent' ? value : undefined;
	}

	function parseRemoteAnnotationContext(payload: RemoteAnnotationPayload): RemoteAnnotationContext {
		const context: RemoteAnnotationContext = {};

		if (typeof payload.context_json === 'string' && payload.context_json.length > 0) {
			try {
				const parsed = JSON.parse(payload.context_json) as unknown;
				if (isRecord(parsed)) {
					if (typeof parsed['x'] === 'number') context.x = parsed['x'];
					if (typeof parsed['y'] === 'number') context.y = parsed['y'];
					if (typeof parsed['isFixed'] === 'boolean') context.isFixed = parsed['isFixed'];
					if (isRect(parsed['boundingBox'])) context.boundingBox = parsed['boundingBox'];
					if (typeof parsed['selectedText'] === 'string')
						context.selectedText = parsed['selectedText'];
					if (typeof parsed['nearbyText'] === 'string') context.nearbyText = parsed['nearbyText'];
					if (typeof parsed['cssClasses'] === 'string') context.cssClasses = parsed['cssClasses'];
					if (typeof parsed['nearbyElements'] === 'string')
						context.nearbyElements = parsed['nearbyElements'];
					if (typeof parsed['computedStyles'] === 'string')
						context.computedStyles = parsed['computedStyles'];
					if (typeof parsed['accessibility'] === 'string')
						context.accessibility = parsed['accessibility'];
					if (typeof parsed['fullPath'] === 'string') context.fullPath = parsed['fullPath'];
					if (typeof parsed['reactComponents'] === 'string')
						context.reactComponents = parsed['reactComponents'];
					if (typeof parsed['svelteComponent'] === 'string')
						context.svelteComponent = parsed['svelteComponent'];
					if (typeof parsed['svelteComponents'] === 'string')
						context.svelteComponents = parsed['svelteComponents'];
					if (typeof parsed['sourceFile'] === 'string') context.sourceFile = parsed['sourceFile'];
					if (typeof parsed['dryuiComponent'] === 'string')
						context.dryuiComponent = parsed['dryuiComponent'];
				}
			} catch {
				// Ignore malformed context payloads.
			}
		}

		if (typeof payload.x === 'number') context.x = payload.x;
		if (typeof payload.y === 'number') context.y = payload.y;
		if (typeof payload.isFixed === 'boolean') context.isFixed = payload.isFixed;
		if (payload.boundingBox) context.boundingBox = payload.boundingBox;
		if (payload.selectedText !== undefined) context.selectedText = payload.selectedText;
		if (payload.nearbyText !== undefined) context.nearbyText = payload.nearbyText;
		if (payload.cssClasses !== undefined) context.cssClasses = payload.cssClasses;
		if (payload.nearbyElements !== undefined) context.nearbyElements = payload.nearbyElements;
		if (payload.computedStyles !== undefined) context.computedStyles = payload.computedStyles;
		if (payload.accessibility !== undefined) context.accessibility = payload.accessibility;
		if (payload.fullPath !== undefined) context.fullPath = payload.fullPath;
		if (payload.reactComponents !== undefined) context.reactComponents = payload.reactComponents;
		if (payload.svelteComponent !== undefined) context.svelteComponent = payload.svelteComponent;
		if (payload.svelteComponents !== undefined) context.svelteComponents = payload.svelteComponents;
		if (payload.sourceFile !== undefined) context.sourceFile = payload.sourceFile;
		if (payload.dryuiComponent !== undefined) context.dryuiComponent = payload.dryuiComponent;

		return context;
	}

	function normalizeRemoteAnnotation(
		payload: RemoteAnnotationPayload | Annotation,
		existing?: Annotation
	): Annotation | null {
		const id = payload.id ?? existing?.id;
		if (!id) return null;

		const context = parseRemoteAnnotationContext(payload);
		const resolvedAt =
			toResolvedAt(
				payload.resolvedAt ?? ('resolved_at' in payload ? payload.resolved_at : undefined)
			) ?? existing?.resolvedAt;
		const resolvedBy =
			toResolvedBy(
				payload.resolvedBy ?? ('resolved_by' in payload ? payload.resolved_by : undefined)
			) ?? existing?.resolvedBy;
		const resolutionNote =
			payload.resolutionNote ??
			('resolution_note' in payload ? payload.resolution_note : undefined) ??
			existing?.resolutionNote;
		const thread = payload.thread ?? existing?.thread;
		const timestamp =
			payload.timestamp ??
			('created_at' in payload ? payload.created_at : undefined) ??
			existing?.timestamp ??
			Date.now();
		const elementPath =
			payload.elementPath ??
			('element_path' in payload ? payload.element_path : undefined) ??
			existing?.elementPath ??
			'';

		const annotation: Annotation = {
			id,
			x: context.x ?? existing?.x ?? 50,
			y: context.y ?? existing?.y ?? 0,
			isFixed: context.isFixed ?? existing?.isFixed ?? false,
			timestamp,
			element: payload.element ?? existing?.element ?? '',
			elementPath,
			comment: payload.comment ?? existing?.comment ?? '',
			kind: payload.kind ?? existing?.kind ?? 'feedback',
			color: payload.color ?? existing?.color ?? DEFAULT_SETTINGS.annotationColor
		};

		if (payload.status ?? existing?.status) annotation.status = payload.status ?? existing?.status;
		if (payload.intent ?? existing?.intent) annotation.intent = payload.intent ?? existing?.intent;
		if (payload.severity ?? existing?.severity)
			annotation.severity = payload.severity ?? existing?.severity;
		if (context.boundingBox ?? existing?.boundingBox) {
			annotation.boundingBox = context.boundingBox ?? existing?.boundingBox;
		}
		if (context.selectedText ?? existing?.selectedText) {
			annotation.selectedText = context.selectedText ?? existing?.selectedText;
		}
		if (context.nearbyText ?? existing?.nearbyText) {
			annotation.nearbyText = context.nearbyText ?? existing?.nearbyText;
		}
		if (context.cssClasses ?? existing?.cssClasses) {
			annotation.cssClasses = context.cssClasses ?? existing?.cssClasses;
		}
		if (context.nearbyElements ?? existing?.nearbyElements) {
			annotation.nearbyElements = context.nearbyElements ?? existing?.nearbyElements;
		}
		if (context.computedStyles ?? existing?.computedStyles) {
			annotation.computedStyles = context.computedStyles ?? existing?.computedStyles;
		}
		if (context.accessibility ?? existing?.accessibility) {
			annotation.accessibility = context.accessibility ?? existing?.accessibility;
		}
		if (context.fullPath ?? existing?.fullPath) {
			annotation.fullPath = context.fullPath ?? existing?.fullPath;
		}
		if (context.reactComponents ?? existing?.reactComponents) {
			annotation.reactComponents = context.reactComponents ?? existing?.reactComponents;
		}
		if (context.svelteComponent ?? existing?.svelteComponent) {
			annotation.svelteComponent = context.svelteComponent ?? existing?.svelteComponent;
		}
		if (context.svelteComponents ?? existing?.svelteComponents) {
			annotation.svelteComponents = context.svelteComponents ?? existing?.svelteComponents;
		} else if (annotation.svelteComponent) {
			annotation.svelteComponents = annotation.svelteComponent;
		}
		if (context.sourceFile ?? existing?.sourceFile) {
			annotation.sourceFile = context.sourceFile ?? existing?.sourceFile;
		}
		if (context.dryuiComponent ?? existing?.dryuiComponent) {
			annotation.dryuiComponent = context.dryuiComponent ?? existing?.dryuiComponent;
		}
		if (thread !== undefined) annotation.thread = thread;
		if (resolvedAt) annotation.resolvedAt = resolvedAt;
		if (resolvedBy) annotation.resolvedBy = resolvedBy;
		if (resolutionNote) annotation.resolutionNote = resolutionNote;
		if (payload.sessionId ?? existing?.sessionId) {
			annotation.sessionId = payload.sessionId ?? existing?.sessionId;
		}
		if (payload.url ?? existing?.url) {
			annotation.url = payload.url ?? existing?.url;
		}
		if (existing?._syncedTo) annotation._syncedTo = existing._syncedTo;

		return annotation;
	}

	function normalizeRemoteAnnotations(
		items: ReadonlyArray<RemoteAnnotationPayload | Annotation>
	): Annotation[] {
		return items
			.map((item) => normalizeRemoteAnnotation(item))
			.filter((item): item is Annotation => item !== null);
	}

	function parseRemoteEventData(data: string): RemoteAnnotationPayload[] {
		try {
			const parsed = JSON.parse(data) as unknown;

			if (Array.isArray(parsed)) {
				return parsed.filter(isRecord) as RemoteAnnotationPayload[];
			}

			if (!isRecord(parsed)) {
				return [];
			}

			if (Array.isArray(parsed['payload'])) {
				return parsed['payload'].filter(isRecord) as RemoteAnnotationPayload[];
			}

			if (isRecord(parsed['payload'])) {
				return [parsed['payload'] as RemoteAnnotationPayload];
			}

			return [parsed as RemoteAnnotationPayload];
		} catch {
			return [];
		}
	}

	function markAnnotationSynced(annotation: Annotation, sessionId: string): Annotation {
		return {
			...annotation,
			_syncedTo: sessionId
		};
	}

	function replaceLocalAnnotation(existingId: string, nextAnnotation: Annotation) {
		if (useExternal) return;
		const updated = annotations.map((annotation) =>
			annotation.id === existingId ? nextAnnotation : annotation
		);
		persistAnnotations(updated);
	}

	function updateExistingAnnotation(current: Annotation, patch: Partial<Annotation>): Annotation {
		const updated = { ...current, ...patch };
		const nextAnnotations = annotations.map((annotation) =>
			annotation.id === current.id ? updated : annotation
		);

		persistAnnotations(nextAnnotations);
		onAnnotationUpdate?.(updated);

		if (endpoint) {
			void updateAnnotationOnServer(endpoint, updated.id, patch).catch(() => {
				connectionStatus = 'disconnected';
			});
		}

		void fireWebhook('annotation.update', { annotation: updated });
		return updated;
	}

	function deleteExistingAnnotation(annotation: Annotation) {
		const nextAnnotations = annotations.filter((entry) => entry.id !== annotation.id);
		persistAnnotations(nextAnnotations);
		onAnnotationDelete?.(annotation);

		if (endpoint) {
			void deleteAnnotationOnServer(endpoint, annotation.id).catch(() => {
				connectionStatus = 'disconnected';
			});
		}

		void fireWebhook('annotation.delete', { annotation });
	}

	async function fireWebhook(
		event: string,
		payload: Record<string, unknown>,
		force: boolean = false
	): Promise<boolean> {
		if (!isValidHttpUrl(submitTargetUrl) || (!settings.webhooksEnabled && !force)) {
			return false;
		}

		try {
			const response = await fetch(submitTargetUrl, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					event,
					timestamp: Date.now(),
					url: pageUrl(),
					...payload
				})
			});
			return response.ok;
		} catch {
			return false;
		}
	}

	async function ensureSession(forceCreate: boolean = false): Promise<string | null> {
		if (!endpoint) return null;

		const storedSessionId = loadSessionIdForUrl(storageUrl);
		const targetSessionId = forceCreate
			? null
			: (currentSessionId ?? providedSessionId ?? storedSessionId);

		if (targetSessionId) {
			try {
				const session = await getSession(endpoint, targetSessionId);
				currentSessionId = session.id;
				connectionStatus = 'connected';
				saveSessionIdForUrl(storageUrl, session.id);
				return session.id;
			} catch {
				clearSessionIdForUrl(storageUrl);
			}
		}

		try {
			connectionStatus = 'connecting';
			const session = await createSession(endpoint, pageUrl());
			currentSessionId = session.id;
			connectionStatus = 'connected';
			saveSessionIdForUrl(storageUrl, session.id);
			onSessionCreated?.(session.id);
			return session.id;
		} catch {
			connectionStatus = 'disconnected';
			return null;
		}
	}

	async function syncExistingLocalAnnotations() {
		if (!endpoint || useExternal) return;

		const sessionId = await ensureSession();
		if (!sessionId) return;

		try {
			const session = await getSession(endpoint, sessionId);
			const serverAnnotations = normalizeRemoteAnnotations(session.annotations);
			const serverIds = new Set(serverAnnotations.map((annotation) => annotation.id));
			const localToMerge = loadAnnotationsForUrl<Annotation>(storageUrl).filter(
				(annotation) => !serverIds.has(annotation.id) && isRenderableAnnotation(annotation)
			);

			if (localToMerge.length === 0) {
				persistAnnotations(
					serverAnnotations.map((annotation) => markAnnotationSynced(annotation, sessionId))
				);
				return;
			}

			const synced = await Promise.allSettled(
				localToMerge.map((annotation) =>
					syncAnnotationToServer(endpoint, sessionId, {
						...annotation,
						sessionId,
						url: pageUrl()
					})
				)
			);

			const merged = [
				...serverAnnotations,
				...synced.map((result, index) =>
					result.status === 'fulfilled'
						? (normalizeRemoteAnnotation(result.value, localToMerge[index]) ?? localToMerge[index]!)
						: localToMerge[index]!
				)
			]
				.filter(isRenderableAnnotation)
				.map((annotation) => markAnnotationSynced(annotation, sessionId));

			persistAnnotations(merged);
			saveAnnotationsWithSyncMarker(storageUrl, merged, sessionId);
		} catch {
			connectionStatus = 'disconnected';
		}
	}

	async function initializeSession() {
		if (!endpoint) return;

		connectionStatus = 'connecting';
		const joinedSessionId = providedSessionId ?? loadSessionIdForUrl(storageUrl);

		if (joinedSessionId) {
			try {
				const session = await getSession(endpoint, joinedSessionId);
				const serverAnnotations = normalizeRemoteAnnotations(session.annotations);
				currentSessionId = session.id;
				connectionStatus = 'connected';
				saveSessionIdForUrl(storageUrl, session.id);

				if (!useExternal) {
					const localToMerge = loadAnnotationsForUrl<Annotation>(storageUrl).filter(
						(annotation) =>
							!serverAnnotations.some((serverAnnotation) => serverAnnotation.id === annotation.id)
					);

					if (localToMerge.length > 0) {
						const synced = await Promise.allSettled(
							localToMerge.map((annotation) =>
								syncAnnotationToServer(endpoint, session.id, {
									...annotation,
									sessionId: session.id,
									url: pageUrl()
								})
							)
						);

						const merged = [
							...serverAnnotations,
							...synced.map((result, index) =>
								result.status === 'fulfilled'
									? (normalizeRemoteAnnotation(result.value, localToMerge[index]) ??
										localToMerge[index]!)
									: localToMerge[index]!
							)
						]
							.filter(isRenderableAnnotation)
							.map((annotation) => markAnnotationSynced(annotation, session.id));

						persistAnnotations(merged);
						saveAnnotationsWithSyncMarker(storageUrl, merged, session.id);
					} else {
						const syncedAnnotations = serverAnnotations
							.filter(isRenderableAnnotation)
							.map((annotation) => markAnnotationSynced(annotation, session.id));
						persistAnnotations(syncedAnnotations);
						saveAnnotationsWithSyncMarker(storageUrl, syncedAnnotations, session.id);
					}
				}

				return;
			} catch {
				clearSessionIdForUrl(storageUrl);
			}
		}

		const sessionId = await ensureSession(true);
		if (!sessionId || useExternal) return;

		const allAnnotations = loadAllAnnotations<Annotation>();
		for (const [pagePath, pageAnnotations] of allAnnotations) {
			const unsynced = pageAnnotations.filter(
				(annotation) => annotation._syncedTo !== sessionId && isRenderableAnnotation(annotation)
			);
			if (unsynced.length === 0) continue;

			const targetSessionId = isCurrentPagePath(pagePath)
				? sessionId
				: await createSession(endpoint, pageUrl(pagePath))
						.then((session) => session.id)
						.catch(() => null);

			if (!targetSessionId) continue;

			const synced = await Promise.allSettled(
				unsynced.map((annotation) =>
					syncAnnotationToServer(endpoint, targetSessionId, {
						...annotation,
						sessionId: targetSessionId,
						url: pageUrl(pagePath)
					})
				)
			);

			const nextAnnotations = synced
				.map((result, index) => (result.status === 'fulfilled' ? result.value : unsynced[index]!))
				.filter(isRenderableAnnotation);

			saveAnnotationsWithSyncMarker(pagePath, nextAnnotations, targetSessionId);
			if (isCurrentPagePath(pagePath)) {
				persistAnnotations(
					nextAnnotations.map((annotation) => markAnnotationSynced(annotation, targetSessionId))
				);
			}
		}
	}

	function buildPlacementShadowComment(placement: DesignPlacement): string {
		const text = placement.text ? ` — "${placement.text}"` : '';
		const note = placement.note ? ` Note: ${placement.note}.` : '';
		return `Place ${placement.type} at (${Math.round(placement.x)}, ${Math.round(placement.y)}), ${Math.round(placement.width)}x${Math.round(placement.height)}px${text}.${note}`.trim();
	}

	function buildPlacementShadowAnnotation(
		placement: DesignPlacement,
		sessionId: string
	): Annotation {
		return {
			id: placement.id,
			x: (placement.x / window.innerWidth) * 100,
			y: placement.y,
			isFixed: false,
			timestamp: placement.timestamp,
			comment: buildPlacementShadowComment(placement),
			element: `[design:${placement.type}]`,
			elementPath: '[placement]',
			kind: 'placement',
			color: annotationColor,
			intent: 'change',
			severity: 'important',
			status: 'pending',
			sessionId,
			url: pageUrl(),
			placement
		};
	}

	function buildRearrangeShadowComment(state: RearrangeState['sections'][number]): string {
		const { originalRect, currentRect } = state;
		const note = state.note ? ` Note: ${state.note}.` : '';
		return `Move ${state.label} section (${state.tagName}) — from (${Math.round(originalRect.x)}, ${Math.round(originalRect.y)}) ${Math.round(originalRect.width)}x${Math.round(originalRect.height)} to (${Math.round(currentRect.x)}, ${Math.round(currentRect.y)}) ${Math.round(currentRect.width)}x${Math.round(currentRect.height)}.${note}`.trim();
	}

	function buildRearrangeShadowAnnotation(
		section: RearrangeState['sections'][number],
		sessionId: string
	): Annotation {
		return {
			id: section.id,
			x: (section.currentRect.x / window.innerWidth) * 100,
			y: section.currentRect.y,
			isFixed: section.isFixed ?? false,
			timestamp: Date.now(),
			comment: buildRearrangeShadowComment(section),
			element: section.selector,
			elementPath: '[rearrange]',
			kind: 'rearrange',
			color: annotationColor,
			intent: 'change',
			severity: 'important',
			status: 'pending',
			sessionId,
			url: pageUrl(),
			rearrange: {
				selector: section.selector,
				label: section.label,
				tagName: section.tagName,
				originalRect: section.originalRect,
				currentRect: section.currentRect
			}
		};
	}

	function placementSnapshot(placement: DesignPlacement): string {
		return JSON.stringify({
			type: placement.type,
			x: Math.round(placement.x),
			y: Math.round(placement.y),
			width: Math.round(placement.width),
			height: Math.round(placement.height),
			text: placement.text ?? null,
			note: placement.note ?? null
		});
	}

	function rearrangeSnapshot(section: RearrangeState['sections'][number]): string {
		return JSON.stringify({
			x: Math.round(section.currentRect.x),
			y: Math.round(section.currentRect.y),
			width: Math.round(section.currentRect.width),
			height: Math.round(section.currentRect.height),
			note: section.note ?? null
		});
	}

	async function deleteRemoteAnnotation(id: string) {
		if (!endpoint) return;

		try {
			await deleteAnnotationOnServer(endpoint, id);
		} catch {
			connectionStatus = 'disconnected';
		}
	}

	async function clearRemoteShadowAnnotations() {
		const ids = [
			...Array.from(placementShadowIds.values()),
			...Array.from(rearrangeShadowIds.values())
		].filter(Boolean);

		placementShadowIds.clear();
		placementShadowSnapshots.clear();
		rearrangeShadowIds.clear();
		rearrangeShadowSnapshots.clear();

		await Promise.allSettled(ids.map((id) => deleteRemoteAnnotation(id)));
	}

	function restoreMovedSection(id: string) {
		const entry = movedSections.get(id);
		if (!entry) return;

		const { el, originalStyles, ancestors } = entry;
		el.style.transition =
			'transform 0.4s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.4s cubic-bezier(0.22, 1, 0.36, 1)';
		el.style.transform = originalStyles.transform;
		el.style.transformOrigin = originalStyles.transformOrigin;
		el.style.opacity = originalStyles.opacity;
		el.style.position = originalStyles.position;
		el.style.zIndex = originalStyles.zIndex;
		movedSections.delete(id);

		window.setTimeout(() => {
			el.style.transition = originalStyles.transition;
			el.style.display = originalStyles.display;
			for (const ancestor of ancestors) {
				ancestor.el.style.overflow = ancestor.overflow;
				ancestor.el.style.overflowX = ancestor.overflowX;
				ancestor.el.style.overflowY = ancestor.overflowY;
			}
		}, 450);
	}

	function currentWireframeState(): WireframeState {
		return {
			rearrange: rearrangeState,
			placements: designPlacements,
			purpose: canvasPurpose,
			prompt: wireframePrompt
		};
	}

	function setToolbarHidden(next: boolean) {
		toolbarHidden = next;
		saveToolbarHidden(next);
	}

	function hideToolbarUntilRestart() {
		setToolbarHidden(true);
		active = false;
		handlePopupCancel();
		closeLayoutMode();
		clearPointerState();
	}

	function handleSettingsChange(next: FeedbackSettings) {
		settings = next;
		saveSettings(next);
	}

	function persistLayoutState() {
		if (blankCanvas) {
			const hasWireframeContent =
				designPlacements.length > 0 ||
				(rearrangeState?.sections.length ?? 0) > 0 ||
				wireframePrompt.trim().length > 0;

			if (hasWireframeContent) {
				saveWireframeStateForUrl(storageUrl, currentWireframeState());
			} else {
				clearWireframeStateForUrl(storageUrl);
			}
			return;
		}

		if (designPlacements.length > 0) {
			saveDesignPlacementsForUrl(storageUrl, designPlacements);
		} else {
			clearDesignPlacementsForUrl(storageUrl);
		}

		if (rearrangeState && rearrangeState.sections.length > 0) {
			saveRearrangeStateForUrl(storageUrl, rearrangeState);
		} else {
			clearRearrangeStateForUrl(storageUrl);
		}
	}

	function setDesignPlacements(next: DesignPlacement[]) {
		designPlacements = next;
		persistLayoutState();
	}

	function setRearrangeLayout(next: RearrangeState | null) {
		rearrangeState = next;
		persistLayoutState();
	}

	function togglePause() {
		paused = !paused;
		if (paused) {
			freezeAnimations();
			return;
		}
		unfreezeAnimations();
	}

	function toggleMarkers() {
		if (annotations.length === 0 || layoutMode !== 'idle') return;
		showMarkers = !showMarkers;
	}

	function resetLayoutSelections() {
		resetCrossDragState();
		designSelectedIds = [];
		rearrangeSelectedIds = [];
		designSelectionCount = 0;
		rearrangeSelectionCount = 0;
		designDeselectSignal += 1;
		rearrangeDeselectSignal += 1;
	}

	function setLayoutMode(next: FeedbackLayoutMode) {
		if (next === layoutMode) return;

		if (next === 'rearrange') {
			ensureRearrangeState();
		}

		layoutMode = next;
		if (next === 'idle') {
			paletteOpen = false;
			overlayInteracting = false;
			activeComponent = null;
			resetLayoutSelections();
			return;
		}

		paletteOpen = true;
		overlayInteracting = false;
		activeComponent = null;
		resetLayoutSelections();
	}

	function closeLayoutMode() {
		setLayoutMode('idle');
	}

	function handleCanvasPurposeChange(next: CanvasPurpose) {
		if (next === canvasPurpose) return;

		resetLayoutSelections();

		if (next === 'new-page') {
			exploreStash = {
				rearrange: rearrangeState,
				placements: designPlacements,
				purpose: 'replace-current',
				prompt: ''
			};

			const stored = loadWireframeStateForUrl(storageUrl);
			designPlacements = stored?.placements ?? [];
			rearrangeState = stored?.rearrange ?? EMPTY_REARRANGE_STATE();
			wireframePrompt = stored?.prompt ?? '';
			canvasPurpose = 'new-page';
			activeComponent = null;
			persistLayoutState();
			return;
		}

		saveWireframeStateForUrl(storageUrl, currentWireframeState());
		designPlacements = exploreStash.placements;
		rearrangeState = exploreStash.rearrange;
		wireframePrompt = exploreStash.prompt;
		canvasPurpose = 'replace-current';
		activeComponent = null;
		persistLayoutState();
	}

	function ensureRearrangeState(): RearrangeState {
		if (rearrangeState) return rearrangeState;

		const nextState = EMPTY_REARRANGE_STATE();
		setRearrangeLayout(nextState);
		return nextState;
	}

	function clearLayoutContent() {
		resetCrossDragState();
		designPlacements = [];
		activeComponent = null;
		designSelectedIds = [];
		rearrangeSelectedIds = [];
		designSelectionCount = 0;
		rearrangeSelectionCount = 0;
		designClearSignal += 1;
		rearrangeClearSignal += 1;
		designDeselectSignal += 1;
		rearrangeDeselectSignal += 1;

		if (blankCanvas) {
			rearrangeState = EMPTY_REARRANGE_STATE();
			wireframePrompt = '';
			clearWireframeStateForUrl(storageUrl);
			return;
		}

		rearrangeState = null;
		clearDesignPlacementsForUrl(storageUrl);
		clearRearrangeStateForUrl(storageUrl);
	}

	function clearAllFeedback() {
		const clearedAnnotations = [...annotations];
		persistAnnotations([]);
		clearLayoutContent();
		if (endpoint) {
			clearedAnnotations.forEach((annotation) => {
				void deleteAnnotationOnServer(endpoint, annotation.id).catch(() => {
					connectionStatus = 'disconnected';
				});
			});
			void clearRemoteShadowAnnotations();
		}
		void fireWebhook('annotations.clear', { annotations: clearedAnnotations });
		onAnnotationsClear?.(clearedAnnotations);
	}

	function buildOutput(mode: 'copy' | 'submit' = 'copy'): string {
		return generateOutput(
			mode === 'copy' && blankCanvas ? [] : annotations,
			displayPath(),
			outputDetail,
			{
				designPlacements,
				rearrangeState,
				blankCanvas,
				wireframePurpose: wireframePrompt || undefined
			}
		);
	}

	function clearDesignPreviewTransforms() {
		for (const id of designSelectedIds) {
			const el = document.querySelector(`[data-placement-id="${id}"]`);
			if (el instanceof HTMLElement) {
				el.style.transform = '';
			}
		}
	}

	function clearRearrangePreviewTransforms() {
		for (const id of rearrangeSelectedIds) {
			const el = document.querySelector(`[data-rearrange-section="${id}"]`);
			if (el instanceof HTMLElement) {
				el.style.transform = '';
			}
		}
	}

	function resetCrossDragState() {
		clearDesignPreviewTransforms();
		clearRearrangePreviewTransforms();
		crossDesignDragStart = null;
		crossRearrangeDragStart = null;
	}

	function previewRearrangeSelection(dx: number, dy: number) {
		if (rearrangeSelectedIds.length === 0 || !rearrangeState) return;

		if (!crossDesignDragStart) {
			crossDesignDragStart = new Map();
			for (const section of rearrangeState.sections) {
				if (rearrangeSelectedIds.includes(section.id)) {
					crossDesignDragStart.set(section.id, {
						x: section.currentRect.x,
						y: section.currentRect.y
					});
				}
			}
		}

		for (const id of rearrangeSelectedIds) {
			const el = document.querySelector(`[data-rearrange-section="${id}"]`);
			if (el instanceof HTMLElement) {
				el.style.transform = `translate(${dx}px, ${dy}px)`;
			}
		}
	}

	function commitRearrangeSelection(dx: number, dy: number, committed: boolean) {
		const starts = crossDesignDragStart;
		clearRearrangePreviewTransforms();
		crossDesignDragStart = null;

		if (!committed || !starts || !rearrangeState) return;

		setRearrangeLayout({
			...rearrangeState,
			sections: rearrangeState.sections.map((section) => {
				const start = starts.get(section.id);
				if (!start) return section;
				return {
					...section,
					currentRect: {
						...section.currentRect,
						x: Math.max(0, start.x + dx),
						y: Math.max(0, start.y + dy)
					}
				};
			})
		});
	}

	function previewDesignSelection(dx: number, dy: number) {
		if (designSelectedIds.length === 0) return;

		if (!crossRearrangeDragStart) {
			crossRearrangeDragStart = new Map();
			for (const placement of designPlacements) {
				if (designSelectedIds.includes(placement.id)) {
					crossRearrangeDragStart.set(placement.id, {
						x: placement.x,
						y: placement.y
					});
				}
			}
		}

		for (const id of designSelectedIds) {
			const el = document.querySelector(`[data-placement-id="${id}"]`);
			if (el instanceof HTMLElement) {
				el.style.transform = `translate(${dx}px, ${dy}px)`;
			}
		}
	}

	function commitDesignSelection(dx: number, dy: number, committed: boolean) {
		const starts = crossRearrangeDragStart;
		clearDesignPreviewTransforms();
		crossRearrangeDragStart = null;

		if (!committed || !starts) return;

		setDesignPlacements(
			designPlacements.map((placement) => {
				const start = starts.get(placement.id);
				if (!start) return placement;
				return {
					...placement,
					x: Math.max(0, start.x + dx),
					y: Math.max(0, start.y + dy)
				};
			})
		);
	}

	function handleDetectSections() {
		const existing = rearrangeState?.sections ?? [];
		const existingSelectors = new Set(existing.map((section) => section.selector));
		const newSections = detectPageSections().filter(
			(section) => !existingSelectors.has(section.selector)
		);

		setRearrangeLayout({
			sections: [...existing, ...newSections],
			originalOrder: [
				...(rearrangeState?.originalOrder ?? []),
				...newSections.map((section) => section.id)
			],
			detectedAt: Date.now()
		});
	}

	function handlePaletteDragStart(type: LayoutModeComponentType, event: MouseEvent) {
		if (event.button !== 0) return;

		event.preventDefault();
		const size = DEFAULT_SIZES[type];
		let preview: HTMLDivElement | null = null;
		let didDrag = false;
		const startX = event.clientX;
		const startY = event.clientY;
		const toolbar = (event.target as HTMLElement).closest('[data-feedback-toolbar]');
		const toolbarTop = toolbar?.getBoundingClientRect().top ?? window.innerHeight;

		const handleMove = (moveEvent: MouseEvent) => {
			const deltaX = moveEvent.clientX - startX;
			const deltaY = moveEvent.clientY - startY;

			if (!didDrag && (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4)) {
				didDrag = true;
				preview = document.createElement('div');
				const accent = blankCanvas ? '#f97316' : 'var(--dry-color-fill-brand, #7c3aed)';
				preview.style.position = 'fixed';
				preview.style.borderRadius = '12px';
				preview.style.border = `1px solid ${accent}`;
				preview.style.background = `color-mix(in srgb, ${accent} 8%, transparent)`;
				preview.style.pointerEvents = 'none';
				preview.style.zIndex = '1006';
				preview.style.display = 'flex';
				preview.style.alignItems = 'center';
				preview.style.justifyContent = 'center';
				preview.style.padding = '8px';
				preview.style.color = 'var(--dry-color-text-strong, #111)';
				preview.style.fontSize = '12px';
				preview.style.fontWeight = '600';
				preview.dataset.layoutDragPreview = type;
				document.body.appendChild(preview);
			}

			if (!preview) return;

			const dist = Math.max(0, toolbarTop - moveEvent.clientY);
			const progress = Math.min(1, dist / 180);
			const eased = 1 - Math.pow(1 - progress, 2);

			const minWidth = 28;
			const minHeight = 20;
			const maxWidth = Math.min(140, size.width * 0.18);
			const maxHeight = Math.min(90, size.height * 0.18);
			const width = minWidth + (maxWidth - minWidth) * eased;
			const height = minHeight + (maxHeight - minHeight) * eased;

			preview.style.width = `${width}px`;
			preview.style.height = `${height}px`;
			preview.style.left = `${moveEvent.clientX - width / 2}px`;
			preview.style.top = `${moveEvent.clientY - height / 2}px`;
			preview.style.opacity = `${0.5 + 0.5 * eased}`;
			preview.textContent = eased > 0.25 ? type : '';
		};

		const handleUp = (moveEvent: MouseEvent) => {
			window.removeEventListener('mousemove', handleMove);
			window.removeEventListener('mouseup', handleUp);
			preview?.remove();

			if (!didDrag) return;

			const placement: DesignPlacement = {
				id: `dp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
				type,
				x: Math.max(0, moveEvent.clientX - size.width / 2),
				y: Math.max(0, moveEvent.clientY - size.height / 2) + window.scrollY,
				width: size.width,
				height: size.height,
				scrollY: window.scrollY,
				timestamp: Date.now()
			};

			setDesignPlacements([...designPlacements, placement]);
			activeComponent = null;
			designSelectedIds = [];
			designSelectionCount = 0;
			rearrangeSelectedIds = [];
			rearrangeSelectionCount = 0;
			rearrangeDeselectSignal += 1;
		};

		window.addEventListener('mousemove', handleMove);
		window.addEventListener('mouseup', handleUp);
	}

	function toggleLayoutMode() {
		if (!enableDesignMode) return;
		if (layoutMode !== 'idle') {
			closeLayoutMode();
			return;
		}

		setLayoutMode('design');
	}

	function handleToolbarLayoutToggle() {
		if (showPopup || pendingMultiSelectTargets.length > 0) {
			handlePopupCancel();
		}
		toggleLayoutMode();
	}

	function handleWireframePromptChange(next: string) {
		wireframePrompt = next;
		persistLayoutState();
	}

	function toggleRearrangeMode() {
		if (!enableRearrange) return;
		if (layoutMode === 'rearrange') {
			setLayoutMode(enableDesignMode ? 'design' : 'idle');
			return;
		}

		setLayoutMode('rearrange');
	}

	$effect(() => {
		if (providedSessionId && providedSessionId !== currentSessionId) {
			currentSessionId = providedSessionId;
		}

		if (!endpoint) {
			connectionStatus = 'disconnected';
			return;
		}
	});

	$effect(() => {
		if (!endpoint || sessionBootstrapRequested) return;
		connectionStatus = currentSessionId ? 'connected' : 'connecting';
		sessionBootstrapRequested = true;
		void initializeSession();
	});

	$effect(() => {
		if (!endpoint) {
			connectionStatus = 'disconnected';
			return;
		}

		let cancelled = false;

		async function checkHealth() {
			try {
				const response = await fetch(`${endpoint}/health`);
				if (cancelled) return;
				connectionStatus = response.ok ? 'connected' : 'disconnected';
			} catch {
				if (cancelled) return;
				connectionStatus = 'disconnected';
			}
		}

		void checkHealth();
		const interval = window.setInterval(() => {
			void checkHealth();
		}, CONNECTION_POLL_MS);

		return () => {
			cancelled = true;
			window.clearInterval(interval);
		};
	});

	$effect(() => {
		if (!endpoint || !currentSessionId || typeof EventSource === 'undefined') return;

		const source = new EventSource(`${endpoint}/sessions/${currentSessionId}/events`);
		const handleEvent = (event: MessageEvent<string>) => {
			const payloads = parseRemoteEventData(event.data);
			if (payloads.length === 0) return;

			let nextAnnotations = [...annotations];
			let changed = false;

			for (const payload of payloads) {
				const existing = nextAnnotations.find((annotation) => annotation.id === payload.id);
				const normalized = normalizeRemoteAnnotation(payload, existing);
				if (!normalized) continue;

				if (
					normalized.kind === 'placement' &&
					normalized.status &&
					!isRenderableAnnotation(normalized)
				) {
					placementShadowIds.delete(normalized.id);
					placementShadowSnapshots.delete(normalized.id);
					setDesignPlacements(
						designPlacements.filter((placement) => placement.id !== normalized.id)
					);
					continue;
				}

				if (
					normalized.kind === 'rearrange' &&
					normalized.status &&
					!isRenderableAnnotation(normalized)
				) {
					rearrangeShadowIds.delete(normalized.id);
					rearrangeShadowSnapshots.delete(normalized.id);
					if (rearrangeState) {
						setRearrangeLayout({
							...rearrangeState,
							sections: rearrangeState.sections.filter((section) => section.id !== normalized.id)
						});
					}
					continue;
				}

				if (normalized.status && !isRenderableAnnotation(normalized)) {
					nextAnnotations = nextAnnotations.filter((annotation) => annotation.id !== normalized.id);
					changed = true;
					if (editingAnnotation?.id === normalized.id) {
						editingAnnotation = null;
					}
					continue;
				}

				const synced = currentSessionId
					? markAnnotationSynced(normalized, currentSessionId)
					: normalized;
				const index = nextAnnotations.findIndex((annotation) => annotation.id === synced.id);
				if (index === -1) {
					nextAnnotations = [...nextAnnotations, synced];
				} else {
					nextAnnotations[index] = synced;
				}
				if (editingAnnotation?.id === synced.id) {
					editingAnnotation = synced;
				}
				changed = true;
			}

			if (changed) {
				persistAnnotations(nextAnnotations);
			}
		};

		const lifecycleEvents = [
			'annotation:created',
			'annotation.created',
			'annotation:updated',
			'annotation.updated',
			'annotation:acknowledged',
			'annotation:resolved',
			'annotation:dismissed',
			'annotation:batch'
		];

		for (const eventName of lifecycleEvents) {
			source.addEventListener(eventName, handleEvent as EventListener);
		}
		source.onerror = () => {
			connectionStatus = 'disconnected';
		};

		return () => {
			for (const eventName of lifecycleEvents) {
				source.removeEventListener(eventName, handleEvent as EventListener);
			}
			source.close();
		};
	});

	$effect(() => {
		if (!endpoint) {
			previousConnectionStatus = connectionStatus;
			return;
		}

		const shouldResync =
			previousConnectionStatus === 'disconnected' && connectionStatus === 'connected';
		previousConnectionStatus = connectionStatus;

		if (shouldResync) {
			void syncExistingLocalAnnotations();
		}
	});

	$effect(() => {
		if (!endpoint) return;

		let cancelled = false;

		void (async () => {
			const sessionId = await ensureSession();
			if (!sessionId || cancelled) return;

			const currentIds = new Set(designPlacements.map((placement) => placement.id));
			for (const placement of designPlacements) {
				const snapshot = placementSnapshot(placement);
				if (
					placementShadowSnapshots.get(placement.id) === snapshot &&
					placementShadowIds.get(placement.id)
				) {
					continue;
				}

				const existingAnnotationId = placementShadowIds.get(placement.id);
				const nextAnnotation = buildPlacementShadowAnnotation(placement, sessionId);
				placementShadowSnapshots.set(placement.id, snapshot);

				if (existingAnnotationId) {
					void updateAnnotationOnServer(endpoint, existingAnnotationId, {
						comment: nextAnnotation.comment,
						placement: nextAnnotation.placement,
						x: nextAnnotation.x,
						y: nextAnnotation.y
					}).catch(() => {
						connectionStatus = 'disconnected';
					});
					continue;
				}

				placementShadowIds.set(placement.id, '');
				void syncAnnotationToServer(endpoint, sessionId, nextAnnotation)
					.then((serverAnnotation) => {
						if (cancelled) return;
						placementShadowIds.set(placement.id, serverAnnotation.id);
					})
					.catch(() => {
						if (cancelled) return;
						connectionStatus = 'disconnected';
						placementShadowIds.delete(placement.id);
						placementShadowSnapshots.delete(placement.id);
					});
			}

			for (const [placementId, annotationId] of placementShadowIds) {
				if (currentIds.has(placementId)) continue;
				placementShadowIds.delete(placementId);
				placementShadowSnapshots.delete(placementId);
				if (annotationId) {
					void deleteRemoteAnnotation(annotationId);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (!endpoint) return;

		let cancelled = false;

		void (async () => {
			const sessionId = await ensureSession();
			if (!sessionId || cancelled) return;

			const movedSectionsState =
				rearrangeState?.sections.filter((section) => {
					const original = section.originalRect;
					const current = section.currentRect;
					return (
						Math.abs(original.x - current.x) > 1 ||
						Math.abs(original.y - current.y) > 1 ||
						Math.abs(original.width - current.width) > 1 ||
						Math.abs(original.height - current.height) > 1
					);
				}) ?? [];

			const currentIds = new Set(movedSectionsState.map((section) => section.id));
			for (const section of movedSectionsState) {
				const snapshot = rearrangeSnapshot(section);
				if (
					rearrangeShadowSnapshots.get(section.id) === snapshot &&
					rearrangeShadowIds.get(section.id)
				) {
					continue;
				}

				const existingAnnotationId = rearrangeShadowIds.get(section.id);
				const nextAnnotation = buildRearrangeShadowAnnotation(section, sessionId);
				rearrangeShadowSnapshots.set(section.id, snapshot);

				if (existingAnnotationId) {
					void updateAnnotationOnServer(endpoint, existingAnnotationId, {
						comment: nextAnnotation.comment,
						rearrange: nextAnnotation.rearrange,
						x: nextAnnotation.x,
						y: nextAnnotation.y
					}).catch(() => {
						connectionStatus = 'disconnected';
					});
					continue;
				}

				rearrangeShadowIds.set(section.id, '');
				void syncAnnotationToServer(endpoint, sessionId, nextAnnotation)
					.then((serverAnnotation) => {
						if (cancelled) return;
						rearrangeShadowIds.set(section.id, serverAnnotation.id);
					})
					.catch(() => {
						if (cancelled) return;
						connectionStatus = 'disconnected';
						rearrangeShadowIds.delete(section.id);
						rearrangeShadowSnapshots.delete(section.id);
					});
			}

			for (const [sectionId, annotationId] of rearrangeShadowIds) {
				if (currentIds.has(sectionId)) continue;
				rearrangeShadowIds.delete(sectionId);
				rearrangeShadowSnapshots.delete(sectionId);
				if (annotationId) {
					void deleteRemoteAnnotation(annotationId);
				}
			}
		})();

		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		if (typeof window === 'undefined') return;

		const activeIds = new Set<string>();
		const activeSections = layoutActive ? (rearrangeState?.sections ?? []) : [];

		for (const section of activeSections) {
			activeIds.add(section.id);

			try {
				const el = document.querySelector(section.selector);
				if (!(el instanceof HTMLElement)) continue;

				const dx = section.currentRect.x - section.originalRect.x;
				const dy = section.currentRect.y - section.originalRect.y;
				const scaleX =
					section.originalRect.width > 0
						? section.currentRect.width / section.originalRect.width
						: 1;
				const scaleY =
					section.originalRect.height > 0
						? section.currentRect.height / section.originalRect.height
						: 1;
				const transform = `translate(${dx}px, ${dy}px) scale(${scaleX}, ${scaleY})`;

				if (!movedSections.has(section.id)) {
					const ancestors: MovedSectionEntry['ancestors'] = [];
					let parent = el.parentElement;
					while (parent && parent !== document.body) {
						const computed = window.getComputedStyle(parent);
						if (
							computed.overflow !== 'visible' ||
							computed.overflowX !== 'visible' ||
							computed.overflowY !== 'visible'
						) {
							ancestors.push({
								el: parent,
								overflow: parent.style.overflow,
								overflowX: parent.style.overflowX,
								overflowY: parent.style.overflowY
							});
							parent.style.overflow = 'visible';
							parent.style.overflowX = 'visible';
							parent.style.overflowY = 'visible';
						}
						parent = parent.parentElement;
					}

					const computed = window.getComputedStyle(el);
					if (computed.display === 'inline') {
						el.style.display = 'inline-block';
					}

					movedSections.set(section.id, {
						el,
						originalStyles: {
							transform: el.style.transform,
							transformOrigin: el.style.transformOrigin,
							opacity: el.style.opacity,
							position: el.style.position,
							zIndex: el.style.zIndex,
							display: el.style.display,
							transition: el.style.transition
						},
						ancestors
					});
					el.style.transformOrigin = 'top left';
					el.style.zIndex = '9999';
				}

				el.style.transition = overlayInteracting
					? 'none'
					: 'transform 0.2s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1)';
				el.style.transform = transform;
			} catch {
				// Ignore invalid selectors from captured sections.
			}
		}

		for (const id of Array.from(movedSections.keys())) {
			if (!activeIds.has(id)) {
				restoreMovedSection(id);
			}
		}
	});

	onDestroy(() => {
		resetCrossDragState();
		for (const id of Array.from(movedSections.keys())) {
			restoreMovedSection(id);
		}
		unfreezeAnimations();
	});

	function generateId(): string {
		return `fb-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
	}

	function isFeedbackElement(value: EventTarget | null): boolean {
		return value instanceof Element && Boolean(value.closest('[data-dryui-feedback]'));
	}

	function isPrimaryButton(event: MouseEvent): boolean {
		return event.button === 0;
	}

	function isMultiSelectModifier(event: MouseEvent): boolean {
		return (event.metaKey || event.ctrlKey) && !event.altKey;
	}

	function isElementFixed(el: Element): boolean {
		let current: Element | null = el;
		while (current instanceof HTMLElement) {
			const style = window.getComputedStyle(current);
			if (style.position === 'fixed' || style.position === 'sticky') {
				return true;
			}
			current = current.parentElement;
		}
		return false;
	}

	function clearPointerState() {
		pointerDown = null;
		dragRect = null;
	}

	function clearMarkerHighlight() {
		markerHoverRect = null;
		markerHoverLabel = undefined;
	}

	function resetHighlights() {
		hoverRect = null;
		hoverLabel = undefined;
		clearMarkerHighlight();
	}

	function clearSelection() {
		window.getSelection()?.removeAllRanges();
	}

	function clearMultiSelect() {
		pendingMultiSelectTargets = [];
	}

	function stopCapturedEvent(event: Event) {
		event.preventDefault();
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	function isBlockedInteractionTarget(target: EventTarget | null): boolean {
		return (
			target instanceof Element &&
			closestCrossingShadow(target, BLOCKED_INTERACTION_SELECTOR) !== null
		);
	}

	function captureElementContext(el: Element): Partial<Annotation> {
		const svelteMetadata = svelteDetectionEnabled ? detectSvelteMetadata(el) : null;

		return {
			accessibility: getAccessibilityInfo(el) || undefined,
			computedStyles: getForensicComputedStyles(el) || undefined,
			cssClasses: getElementClasses(el) || undefined,
			dryuiComponent: detectDryUIComponent(el),
			fullPath: getFullElementPath(el) || undefined,
			nearbyElements: getNearbyElements(el) || undefined,
			nearbyText: getNearbyText(el) || undefined,
			sourceFile: svelteMetadata?.sourceFile,
			svelteComponent: svelteMetadata?.svelteComponent,
			svelteComponents: svelteMetadata?.svelteComponent
		};
	}

	function getAnnotationHighlightRect(annotation: Annotation): Rect | null {
		if (annotation.elementBoundingBoxes?.length) {
			return unionRects(annotation.elementBoundingBoxes);
		}

		return annotation.boundingBox ?? null;
	}

	function armClickSuppression() {
		suppressClick = true;
		window.setTimeout(() => {
			suppressClick = false;
		}, 0);
	}

	function openPendingDraft(draft: PendingDraft, preserveHighlight: boolean = false) {
		pendingDraft = draft;
		pendingPosition = draft.position;
		popupColor = annotationColor;
		if (!preserveHighlight) {
			resetHighlights();
		}
	}

	function buildDraftFromElement(el: Element, rect: Rect, selectedText?: string): PendingDraft {
		const { name, path } = identifyElement(el);
		const fixed = isElementFixed(el);
		const label = selectedText ? `Selected text in ${name}` : name;

		return {
			elementLabel: label,
			position: getPopupPosition(rect, window.innerWidth, POPUP_WIDTH_PX),
			data: {
				x: ((rect.x + rect.width / 2) / window.innerWidth) * 100,
				y: fixed ? rect.y : rect.y + window.scrollY,
				isFixed: fixed,
				element: label,
				elementPath: path,
				selectedText,
				boundingBox: rect,
				...captureElementContext(el)
			}
		};
	}

	function createElementDraft(el: Element): PendingDraft {
		return buildDraftFromElement(el, toRect(el.getBoundingClientRect()));
	}

	function createSelectionDraft(): PendingDraft | null {
		const selection = window.getSelection();
		if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

		const selectedText = normalizeText(selection.toString());
		if (!selectedText) return null;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		if (rect.width === 0 && rect.height === 0) return null;

		const container =
			range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE
				? (range.commonAncestorContainer as Element)
				: range.commonAncestorContainer.parentElement;
		if (!container || isFeedbackElement(container)) return null;

		return buildDraftFromElement(container, toRect(rect), selectedText);
	}

	function isSelectableAreaTarget(value: unknown): value is HTMLElement | SVGElement {
		const el = value instanceof HTMLElement || value instanceof SVGElement ? value : null;
		if (!el || isFeedbackElement(el)) return false;

		const rect = el.getBoundingClientRect();
		if (rect.width < 4 || rect.height < 4) return false;

		if (el instanceof HTMLElement) {
			const style = window.getComputedStyle(el);
			if (style.display === 'none' || style.visibility === 'hidden') return false;
		}

		const tag = el.tagName.toLowerCase();
		if (INTERACTIVE_TAGS.has(tag)) return true;
		if (el.children.length === 0) return normalizeText(el.textContent ?? '').length > 0;
		return normalizeText(el.textContent ?? '').length > 0 && el.children.length <= 2;
	}

	function collectAreaTargets(selectionRect: Rect): Element[] {
		const candidates = Array.from(document.body.querySelectorAll('*')).filter((el) => {
			if (!isSelectableAreaTarget(el)) return false;
			return intersectsRect(selectionRect, toRect(el.getBoundingClientRect()));
		});

		const deepest = candidates.filter(
			(candidate) => !candidates.some((other) => other !== candidate && candidate.contains(other))
		);
		return deepest.slice(0, MAX_AREA_TARGETS);
	}

	function createAggregateDraft(
		candidates: Element[],
		selectionRect: Rect,
		groupPath: string
	): PendingDraft {
		const primary = candidates[0];
		const primaryFixed = primary ? isElementFixed(primary) : false;
		const labels = uniqueLabels(candidates.map((el) => identifyElement(el).name));
		const label =
			candidates.length === 0
				? 'Selected area'
				: candidates.length === 1
					? (labels[0] ?? 'Selected area')
					: `${candidates.length} selected elements`;

		return {
			elementLabel: label,
			position: getPopupPosition(selectionRect, window.innerWidth, POPUP_WIDTH_PX),
			data: {
				x: ((selectionRect.x + selectionRect.width / 2) / window.innerWidth) * 100,
				y: primaryFixed ? selectionRect.y : selectionRect.y + window.scrollY,
				isFixed: primaryFixed,
				element: label,
				elementPath: candidates.length === 1 && primary ? identifyElement(primary).path : groupPath,
				boundingBox: selectionRect,
				...(primary ? captureElementContext(primary) : {}),
				nearbyText:
					candidates
						.map((el) => getNearbyText(el))
						.filter(Boolean)
						.slice(0, 5)
						.join(', ') || undefined,
				nearbyElements: labels.join(', ') || undefined
			}
		};
	}

	function createAreaDraft(selectionRect: Rect): PendingDraft {
		return createAggregateDraft(collectAreaTargets(selectionRect), selectionRect, 'selection area');
	}

	function createMultiSelectDraft(targets: MultiSelectTarget[], selectionRect: Rect): PendingDraft {
		return createAggregateDraft(
			targets.map(({ element }) => element),
			selectionRect,
			'multi selection'
		);
	}

	function syncMultiSelectTargets(targets: MultiSelectTarget[]) {
		pendingMultiSelectTargets = targets;

		const selectionRect = unionRects(targets.map(({ rect }) => rect));
		if (!selectionRect) {
			pendingDraft = null;
			resetHighlights();
			return;
		}

		hoverRect = selectionRect;
		hoverLabel = targets.length === 1 ? targets[0]?.label : `${targets.length} selected elements`;

		if (targets.length > 1) {
			openPendingDraft(createMultiSelectDraft(targets, selectionRect), true);
			return;
		}

		pendingDraft = null;
	}

	function toggleMultiSelectTarget(el: Element) {
		const { name, path } = identifyElement(el);
		const existing = pendingMultiSelectTargets.findIndex((target) => target.element === el);

		if (existing >= 0) {
			syncMultiSelectTargets(pendingMultiSelectTargets.filter((target) => target.path !== path));
			return;
		}

		syncMultiSelectTargets([
			...pendingMultiSelectTargets,
			{
				element: el,
				label: name,
				path,
				rect: toRect(el.getBoundingClientRect())
			}
		]);
	}

	function handleCapturedClick(event: MouseEvent) {
		if (isFeedbackElement(event.target)) return;

		if (
			isMultiSelectModifier(event) &&
			!editingAnnotation &&
			(!pendingDraft || pendingMultiSelectTargets.length > 0)
		) {
			const el =
				event.target instanceof Element && !isFeedbackElement(event.target)
					? event.target
					: deepElementFromPoint(event.clientX, event.clientY);
			if (!(el instanceof Element) || isFeedbackElement(el)) return;

			clearSelection();
			toggleMultiSelectTarget(el);
			event.preventDefault();
			event.stopPropagation();
			event.stopImmediatePropagation();
			suppressClick = false;
			return;
		}

		if (!suppressClick && !settings.blockInteractions && !showPopup) return;
		stopCapturedEvent(event);
		suppressClick = false;
	}

	function handleCapturedPointerDown(event: PointerEvent) {
		if (!settings.blockInteractions || isFeedbackElement(event.target)) return;
		if (!isBlockedInteractionTarget(event.target)) return;
		event.stopPropagation();
		event.stopImmediatePropagation();
	}

	function handleCapturedSubmit(event: Event) {
		if (!settings.blockInteractions || isFeedbackElement(event.target)) return;
		stopCapturedEvent(event);
	}

	function handleMouseMove(event: MouseEvent) {
		if (!active || layoutActive || rearrangeActive || pendingDraft || editingAnnotation) return;
		if (pendingMultiSelectTargets.length > 0) return;

		if (pointerDown) {
			const nextRect = rectFromPoints(pointerDown, { x: event.clientX, y: event.clientY });
			dragRect = hasMeaningfulArea(nextRect, DRAG_THRESHOLD_PX) ? nextRect : null;
			hoverRect = dragRect;
			hoverLabel = dragRect ? 'Selected area' : undefined;
			return;
		}

		const el = deepElementFromPoint(event.clientX, event.clientY);
		if (!(el instanceof Element) || isFeedbackElement(el)) {
			resetHighlights();
			return;
		}

		const rect = el.getBoundingClientRect();
		hoverRect = { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
		hoverLabel = identifyElement(el).name;
	}

	function handleMouseDown(event: MouseEvent) {
		if (!active || layoutActive || rearrangeActive || editingAnnotation || !isPrimaryButton(event))
			return;
		if (pendingDraft && (!isMultiSelectModifier(event) || pendingMultiSelectTargets.length === 0))
			return;
		if (isFeedbackElement(event.target)) return;
		const blockedInteraction =
			settings.blockInteractions && isBlockedInteractionTarget(event.target);

		if (!isMultiSelectModifier(event) && pendingMultiSelectTargets.length > 0) {
			clearMultiSelect();
			resetHighlights();
		}

		pointerDown = { x: event.clientX, y: event.clientY };
		dragRect = null;
		if (pendingMultiSelectTargets.length === 0) {
			resetHighlights();
		}

		if (blockedInteraction) {
			stopCapturedEvent(event);
		}
	}

	function handleMouseUp(event: MouseEvent) {
		if (
			!active ||
			layoutActive ||
			rearrangeActive ||
			editingAnnotation ||
			!pointerDown ||
			!isPrimaryButton(event)
		)
			return;
		if (pendingDraft && (!isMultiSelectModifier(event) || pendingMultiSelectTargets.length === 0))
			return;
		const blockedInteraction =
			settings.blockInteractions && isBlockedInteractionTarget(event.target);
		if (isFeedbackElement(event.target)) {
			clearPointerState();
			return;
		}

		if (isMultiSelectModifier(event)) {
			clearPointerState();
			clearSelection();
			if (blockedInteraction) {
				stopCapturedEvent(event);
			}
			return;
		}

		const selectionDraft = createSelectionDraft();
		if (selectionDraft) {
			clearMultiSelect();
			openPendingDraft(selectionDraft);
			clearPointerState();
			clearSelection();
			armClickSuppression();
			if (blockedInteraction) {
				stopCapturedEvent(event);
			}
			return;
		}

		if (dragRect && hasMeaningfulArea(dragRect, DRAG_THRESHOLD_PX)) {
			clearMultiSelect();
			openPendingDraft(createAreaDraft(dragRect));
			clearPointerState();
			armClickSuppression();
			if (blockedInteraction) {
				stopCapturedEvent(event);
			}
			return;
		}

		const el = deepElementFromPoint(event.clientX, event.clientY);
		clearPointerState();
		if (!(el instanceof Element) || isFeedbackElement(el)) {
			if (blockedInteraction) {
				stopCapturedEvent(event);
			}
			return;
		}

		const dryuiResult = detectDryUIComponent(el);
		if (dryuiResult) {
			const parts = dryuiResult.split(' ');
			const componentName = parts[0] ?? dryuiResult;
			const props: Record<string, string> = {};
			for (const part of parts.slice(1)) {
				const eqIdx = part.indexOf('=');
				if (eqIdx > 0) {
					props[part.slice(0, eqIdx)] = part.slice(eqIdx + 1);
				} else {
					props[part] = '';
				}
			}
			componentActionsTarget = {
				name: componentName,
				selector: getFullElementPath(el),
				props,
				position: { x: event.clientX, y: event.clientY }
			};
			armClickSuppression();
			if (blockedInteraction) {
				stopCapturedEvent(event);
			}
			return;
		}

		clearMultiSelect();
		openPendingDraft(createElementDraft(el));
		armClickSuppression();
		if (blockedInteraction) {
			stopCapturedEvent(event);
		}
	}

	function handlePopupSubmit(comment: string, meta?: { resolutionNote?: string }) {
		if (!pendingDraft && !editingAnnotation) return;

		if (editingAnnotation) {
			updateExistingAnnotation(editingAnnotation, {
				color: popupColor,
				comment,
				resolutionNote: meta?.resolutionNote
			});
			editingAnnotation = null;
			return;
		}

		const annotation: Annotation = {
			...pendingDraft!.data,
			id: generateId(),
			timestamp: Date.now(),
			comment,
			kind: 'feedback',
			color: popupColor,
			...(endpoint
				? {
						sessionId: currentSessionId ?? undefined,
						status: 'pending' as const,
						url: pageUrl()
					}
				: {})
		};

		persistAnnotations([...annotations, annotation]);
		onAnnotationAdd?.(annotation);
		void fireWebhook('annotation.add', { annotation });
		if (endpoint) {
			void (async () => {
				const sessionId = await ensureSession();
				if (!sessionId) return;

				try {
					const serverAnnotation = await syncAnnotationToServer(endpoint, sessionId, {
						...annotation,
						sessionId,
						url: pageUrl()
					});
					const normalized = normalizeRemoteAnnotation(serverAnnotation, annotation);
					if (!normalized) return;
					replaceLocalAnnotation(annotation.id, markAnnotationSynced(normalized, sessionId));
				} catch {
					connectionStatus = 'disconnected';
				}
			})();
		}
		pendingDraft = null;
		clearMultiSelect();
		resetHighlights();
		clearSelection();
	}

	function handlePopupCancel() {
		pendingDraft = null;
		editingAnnotation = null;
		popupColor = annotationColor;
		clearMultiSelect();
		resetHighlights();
		clearSelection();
	}

	function handlePopupDelete() {
		const current = editingAnnotation;
		if (!current) return;
		deleteExistingAnnotation(current);
		editingAnnotation = null;
	}

	function handlePopupAcknowledge(meta?: { resolutionNote?: string }) {
		const current = editingAnnotation;
		if (!current) return;

		updateExistingAnnotation(current, {
			status: 'acknowledged',
			resolutionNote: meta?.resolutionNote ?? current.resolutionNote
		});
		editingAnnotation = null;
	}

	function handlePopupResolve(meta?: { resolutionNote?: string }) {
		const current = editingAnnotation;
		if (!current) return;

		updateExistingAnnotation(current, {
			status: 'resolved',
			resolvedAt: new Date().toISOString(),
			resolvedBy: 'human',
			resolutionNote: meta?.resolutionNote ?? current.resolutionNote
		});
		editingAnnotation = null;
	}

	function handlePopupDismiss(meta?: { resolutionNote?: string }) {
		const current = editingAnnotation;
		if (!current) return;

		updateExistingAnnotation(current, {
			status: 'dismissed',
			resolvedAt: new Date().toISOString(),
			resolvedBy: 'human',
			resolutionNote: meta?.resolutionNote ?? current.resolutionNote
		});
		editingAnnotation = null;
	}

	function handlePopupReply(content: string) {
		const current = editingAnnotation;
		if (!current) return;

		const message: ThreadMessage = {
			id: crypto.randomUUID(),
			role: 'human',
			content,
			timestamp: Date.now()
		};
		const updated: Annotation = {
			...current,
			thread: [...(current.thread ?? []), message]
		};
		const nextAnnotations = annotations.map((annotation) =>
			annotation.id === current.id ? updated : annotation
		);

		persistAnnotations(nextAnnotations);
		editingAnnotation = updated;
		onAnnotationUpdate?.(updated);
		onAnnotationReply?.(updated, message);

		if (endpoint) {
			void replyToAnnotationOnServer(endpoint, updated.id, message)
				.then((serverAnnotation) => {
					const normalized = normalizeRemoteAnnotation(serverAnnotation, updated);
					if (!normalized) return;
					const synced = currentSessionId
						? markAnnotationSynced(normalized, currentSessionId)
						: normalized;
					replaceLocalAnnotation(updated.id, synced);
					if (editingAnnotation?.id === synced.id) {
						editingAnnotation = synced;
					}
				})
				.catch(() => {
					connectionStatus = 'disconnected';
				});
		}

		void fireWebhook('thread.message', { annotation: updated, message });
	}

	function handleMarkerEnter(annotation: Annotation) {
		const rect = getAnnotationHighlightRect(annotation);
		if (!rect) return;
		markerHoverRect = rect;
		markerHoverLabel = annotation.element;
	}

	function handleMarkerLeave() {
		clearMarkerHighlight();
	}

	function handleMarkerClick(annotation: Annotation) {
		clearMarkerHighlight();
		if (settings.markerClickBehavior === 'delete') {
			deleteExistingAnnotation(annotation);
			return;
		}

		editingAnnotation = annotation;
		popupColor = annotation.color;
		pendingPosition = {
			x: Math.min(
				(annotation.x / 100) * window.innerWidth + 30,
				window.innerWidth - POPUP_WIDTH_PX
			),
			y: annotation.isFixed ? annotation.y : annotation.y - window.scrollY
		};
	}

	function handleCopy() {
		if (!hasOutput) return;

		const output = buildOutput('copy');
		if (!output) return;

		if (copyToClipboard && typeof navigator !== 'undefined') {
			navigator.clipboard.writeText(output).catch(() => {});
		}
		onCopy?.(output);
		setCopyState('copied');
		if (settings.autoClearAfterCopy) {
			window.setTimeout(() => {
				clearAllFeedback();
			}, 500);
		}
	}

	async function handleSubmit() {
		if (!hasOutput || submitState === 'sending') return;

		const output = buildOutput('submit');
		if (!output) return;

		setSubmitState('sending');
		onSubmit?.(output, annotations);

		let delivered = onSubmit !== undefined;
		if (endpoint) {
			const sessionId = await ensureSession();
			if (sessionId) {
				try {
					await requestAction(endpoint, sessionId, output);
					delivered = true;
				} catch {
					connectionStatus = 'disconnected';
				}
			}
		}

		const webhookDelivered = await fireWebhook('submit', { output, annotations }, true);
		delivered = delivered || webhookDelivered;
		setSubmitState(delivered ? 'sent' : 'failed');

		if (settings.autoClearAfterCopy && delivered) {
			window.setTimeout(() => {
				clearAllFeedback();
			}, 500);
		}
	}

	function handleClear() {
		clearAllFeedback();
	}

	function handleToggleActive() {
		if (toolbarHidden) return;

		active = !active;
		if (!active) {
			closeLayoutMode();
			clearMultiSelect();
			resetHighlights();
			clearPointerState();
			pendingDraft = null;
			editingAnnotation = null;
			clearSelection();
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			if (layoutMode !== 'idle') {
				event.preventDefault();
				if (activeComponent) {
					activeComponent = null;
					return;
				}
				closeLayoutMode();
				return;
			}

			if (showPopup || pendingMultiSelectTargets.length > 0) {
				event.preventDefault();
				handlePopupCancel();
				return;
			}

			event.preventDefault();
			handleToggleActive();
			return;
		}

		const target = event.target as HTMLElement | null;
		const isTyping =
			target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;

		if ((event.metaKey || event.ctrlKey) && event.key === 'z' && !event.shiftKey && layoutActive) {
			event.preventDefault();
			const prev = layoutHistory.undo();
			if (prev) designPlacements = prev;
			return;
		}

		if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'z' && layoutActive) {
			event.preventDefault();
			const next = layoutHistory.redo();
			if (next) designPlacements = next;
			return;
		}

		if (isTyping || event.metaKey || event.ctrlKey) return;

		if (event.key === '/' && layoutActive && !isTyping) {
			event.preventDefault();
			componentPickerOpen = true;
			return;
		}

		if (event.key === 'p' || event.key === 'P') {
			event.preventDefault();
			togglePause();
			return;
		}

		if (event.key === 'l' || event.key === 'L') {
			event.preventDefault();
			if (showPopup || pendingMultiSelectTargets.length > 0) {
				handlePopupCancel();
			}
			toggleLayoutMode();
			return;
		}

		if (event.key === 'r' || event.key === 'R') {
			event.preventDefault();
			if (showPopup || pendingMultiSelectTargets.length > 0) {
				handlePopupCancel();
			}
			toggleRearrangeMode();
			return;
		}

		if ((event.key === 'h' || event.key === 'H') && layoutMode === 'idle') {
			event.preventDefault();
			toggleMarkers();
			return;
		}

		if (event.key === 'c' || event.key === 'C') {
			if (!hasOutput) return;
			event.preventDefault();
			handleCopy();
			return;
		}

		if (event.key === 'x' || event.key === 'X') {
			if (!hasOutput) return;
			event.preventDefault();
			handleClear();
			return;
		}

		if (event.key === 's' || event.key === 'S') {
			if (!canSubmit || !hasOutput || submitState === 'sending') return;
			event.preventDefault();
			void handleSubmit();
		}
	}
</script>

{#if !toolbarHidden}
	<Hotkey keys={shortcut} handler={handleToggleActive} />
{/if}

<svelte:window onkeydown={active ? handleKeyDown : undefined} />

<svelte:document
	onpointerdowncapture={annotatingPage ? handleCapturedPointerDown : undefined}
	onmousedowncapture={annotatingPage ? handleMouseDown : undefined}
	onmousemove={annotatingPage ? handleMouseMove : undefined}
	onmouseupcapture={annotatingPage ? handleMouseUp : undefined}
	onclickcapture={annotatingPage ? handleCapturedClick : undefined}
	onsubmitcapture={annotatingPage ? handleCapturedSubmit : undefined}
/>

<Portal>
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div
		class={className}
		data-dryui-feedback
		data-feedback-shortcut={shortcut}
		data-feedback-svelte-detection={svelteDetectionEnabled ? 'enabled' : 'disabled'}
		data-feedback-theme={settings.theme}
		onclick={(e) => e.stopPropagation()}
		onmousedown={(e) => e.stopPropagation()}
	>
		{#if annotatingPage}
			<HighlightOverlay rect={activeHighlightRect} label={activeHighlightLabel} />
		{/if}

		{#if layoutActive}
			<DesignPalette
				bind:open={paletteOpen}
				bind:value={activeComponent}
				purpose={canvasPurpose}
				{wireframePrompt}
				wireframe={blankCanvas}
				placementCount={designPlacements.length}
				sectionCount={rearrangeState?.sections.length ?? 0}
				onSelect={(type) => {
					activeComponent = type;
				}}
				onDetectSections={handleDetectSections}
				onPurposeChange={handleCanvasPurposeChange}
				onWireframePromptChange={handleWireframePromptChange}
				onDragStart={handlePaletteDragStart}
				onClear={clearLayoutContent}
			/>
		{/if}

		{#if layoutActive}
			<DesignMode
				placements={designPlacements}
				bind:activeComponent
				wireframe={blankCanvas}
				passthrough={rearrangeActive && activeComponent === null}
				extraSnapRects={rearrangeState?.sections.map((section) => section.currentRect)}
				clearSignal={designClearSignal}
				deselectSignal={designDeselectSignal}
				{canvasWidth}
				onChange={(next) => {
					setDesignPlacements(next);
				}}
				onInteractionChange={(next) => {
					overlayInteracting = next;
				}}
				onSelectionChange={(selected, isShift) => {
					resetCrossDragState();
					designSelectedIds = Array.from(selected);
					designSelectionCount = selected.size;
					if (!isShift && selected.size > 0) {
						rearrangeSelectedIds = [];
						rearrangeSelectionCount = 0;
						rearrangeDeselectSignal += 1;
					}
				}}
				onDragMove={(dx, dy) => {
					previewRearrangeSelection(dx, dy);
				}}
				onDragEnd={(dx, dy, committed) => {
					commitRearrangeSelection(dx, dy, committed);
				}}
				onCanvasWidthChange={(w) => {
					canvasWidth = w;
				}}
				onHistoryPush={() => {
					layoutHistory.push(designPlacements);
				}}
			/>
		{/if}

		{#if layoutActive && blankCanvas}
			<div
				data-wireframe-canvas
				class="wireframe-canvas"
				use:applyCanvasOpacity={canvasOpacity}
			></div>

			<div data-wireframe-notice class="wireframe-notice">
				<div class="vstack-sm">
					<div class="hstack-sm">
						<Text as="span" size="sm">Toggle opacity</Text>
						<Slider
							bind:value={canvasOpacity}
							min={0}
							max={1}
							step={0.01}
							aria-label="Wireframe canvas opacity"
						/>
					</div>
					<div class="hstack-sm">
						<Text as="span" size="md">Wireframe mode</Text>
						<Button variant="ghost" size="sm" onclick={clearLayoutContent}>Start over</Button>
					</div>
					<Text as="div" size="sm" color="secondary">
						Drag components onto the canvas. Copied output will only include the wireframed layout.
					</Text>
				</div>
			</div>
		{/if}

		{#if rearrangeActive && rearrangeState}
			<RearrangeOverlay
				{rearrangeState}
				{blankCanvas}
				extraSnapRects={designPlacements.map((placement) => ({
					x: placement.x,
					y: placement.y,
					width: placement.width,
					height: placement.height
				}))}
				clearSignal={rearrangeClearSignal}
				deselectSignal={rearrangeDeselectSignal}
				onChange={(next) => {
					setRearrangeLayout(next);
				}}
				onInteractionChange={(next) => {
					overlayInteracting = next;
				}}
				onSelectionChange={(selected, isShift) => {
					resetCrossDragState();
					rearrangeSelectedIds = Array.from(selected);
					rearrangeSelectionCount = selected.size;
					if (!isShift && selected.size > 0) {
						designSelectedIds = [];
						designSelectionCount = 0;
						designDeselectSignal += 1;
					}
				}}
				onDragMove={(dx, dy) => {
					previewDesignSelection(dx, dy);
				}}
				onDragEnd={(dx, dy, committed) => {
					commitDesignSelection(dx, dy, committed);
				}}
			/>
		{/if}

		{#if shouldShowMarkers}
			{#each annotations as annotation, i (annotation.id)}
				<AnnotationMarker
					{annotation}
					index={i + 1}
					onclick={handleMarkerClick}
					onmouseenter={handleMarkerEnter}
					onmouseleave={handleMarkerLeave}
				/>
			{/each}
		{/if}

		{#if showPopup}
			{#key editingAnnotation?.id ?? pendingDraft?.data.elementPath ?? popupElement}
				<AnnotationPopup
					element={popupElement}
					initialValue={popupInitialValue}
					selectedText={popupSelectedText}
					computedStyles={popupComputedStyles}
					color={popupColor}
					status={editingAnnotation?.status}
					thread={editingAnnotation?.thread}
					resolvedAt={editingAnnotation?.resolvedAt}
					resolvedBy={editingAnnotation?.resolvedBy}
					resolutionNote={editingAnnotation?.resolutionNote}
					showDelete={editingAnnotation !== null}
					showStatusActions={editingAnnotation !== null}
					position={pendingPosition}
					oncolorchange={(color) => {
						popupColor = color;
					}}
					onsubmit={handlePopupSubmit}
					oncancel={handlePopupCancel}
					ondelete={handlePopupDelete}
					onacknowledge={handlePopupAcknowledge}
					onresolve={handlePopupResolve}
					ondismiss={handlePopupDismiss}
					onreply={editingAnnotation ? handlePopupReply : undefined}
				/>
			{/key}
		{/if}

		{#if componentPickerOpen}
			<ComponentPicker
				bind:open={componentPickerOpen}
				onSelect={(entry) => {
					activeComponent = entry.name as LayoutModeComponentType;
					componentPickerOpen = false;
				}}
				onClose={() => {
					componentPickerOpen = false;
				}}
			/>
		{/if}

		{#if routeCreatorOpen}
			<RouteCreator
				bind:open={routeCreatorOpen}
				onCreate={(routePath, recipeName) => {
					newPageRoute = routePath;
					newPageRecipe = recipeName;
					canvasPurpose = 'new-page';
					routeCreatorOpen = false;
					if (layoutMode !== 'design') setLayoutMode('design');
				}}
				onClose={() => {
					routeCreatorOpen = false;
				}}
			/>
		{/if}

		{#if componentActionsTarget}
			<ComponentActions
				component={componentActionsTarget}
				position={componentActionsTarget.position}
				onSwap={() => {
					componentPickerOpen = true;
					componentActionsTarget = null;
				}}
				onRefine={(comment) => {
					pendingComponentActions = [
						...pendingComponentActions,
						{
							kind: 'refine',
							targetSelector: componentActionsTarget!.selector,
							component: componentActionsTarget!.name,
							comment
						}
					];
					componentActionsTarget = null;
				}}
				onDelete={() => {
					pendingComponentActions = [
						...pendingComponentActions,
						{
							kind: 'delete',
							targetSelector: componentActionsTarget!.selector,
							component: componentActionsTarget!.name
						}
					];
					componentActionsTarget = null;
				}}
				onClose={() => {
					componentActionsTarget = null;
				}}
			/>
		{/if}

		<FeedbackToolbar
			annotationCount={annotations.length}
			{hasOutput}
			placementCount={designPlacements.length}
			sectionCount={rearrangeState?.sections.length ?? 0}
			{copyLabel}
			{copyState}
			copyDisabled={!hasOutput}
			{submitState}
			submitDisabled={!hasOutput || submitState === 'sending'}
			{active}
			hidden={toolbarHidden}
			{paused}
			markersVisible={showMarkers}
			{settings}
			{layoutActive}
			{rearrangeActive}
			{connectionStatus}
			{endpoint}
			sessionId={currentSessionId}
			{webhookUrl}
			{shortcut}
			onToggleActive={handleToggleActive}
			onCopy={handleCopy}
			{canSubmit}
			onSubmit={canSubmit ? handleSubmit : undefined}
			onClear={handleClear}
			onSettingsChange={handleSettingsChange}
			onLayout={handleToolbarLayoutToggle}
			onRearrange={toggleRearrangeMode}
			onPause={togglePause}
			onToggleMarkers={toggleMarkers}
			onHide={hideToolbarUntilRestart}
			canUndo={layoutHistory.canUndo()}
			canRedo={layoutHistory.canRedo()}
			onUndo={() => {
				const prev = layoutHistory.undo();
				if (prev) designPlacements = prev;
			}}
			onRedo={() => {
				const next = layoutHistory.redo();
				if (next) designPlacements = next;
			}}
			onNewPage={() => {
				routeCreatorOpen = true;
			}}
		/>
	</div>
</Portal>

<style>
	.vstack-sm {
		display: grid;
		gap: var(--dry-space-2, 0.5rem);
	}

	.hstack-sm {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: max-content;
		gap: var(--dry-space-2, 0.5rem);
		align-items: center;
	}

	.wireframe-canvas {
		position: fixed;
		inset: 0;
		z-index: 999;
		pointer-events: none;
		background:
			radial-gradient(circle at top left, rgba(249, 115, 22, 0.16), transparent 34%),
			radial-gradient(circle, rgba(249, 115, 22, 0.18) 1px, transparent 1px),
			linear-gradient(180deg, rgba(255, 247, 237, 0.94), rgba(255, 255, 255, 0.72));
		background-size:
			auto,
			24px 24px,
			auto;
		background-position:
			0 0,
			12px 12px,
			0 0;
	}

	.wireframe-notice {
		position: fixed;
		left: 16px;
		bottom: 16px;
		z-index: 1005;
		pointer-events: auto;
		display: grid;
		grid-template-columns: minmax(0, 320px);
	}
</style>
