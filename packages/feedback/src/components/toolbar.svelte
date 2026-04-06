<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Badge } from '@dryui/ui/badge';
	import { Drawer } from '@dryui/ui/drawer';
	import { Toolbar } from '@dryui/ui/toolbar';
	import type { ConnectionStatus, FeedbackSettings } from '../types.js';
	import { loadSettings } from '../utils/storage.js';
	import SettingsPanel from './settings-panel.svelte';

	interface Props {
		annotationCount: number;
		hasOutput?: boolean;
		placementCount?: number;
		sectionCount?: number;
		copyLabel?: string;
		copyState?: 'idle' | 'copied';
		copyDisabled?: boolean;
		submitLabel?: string;
		submitState?: 'idle' | 'sending' | 'sent' | 'failed';
		submitDisabled?: boolean;
		active: boolean;
		hidden?: boolean;
		paused?: boolean;
		layoutActive?: boolean;
		rearrangeActive?: boolean;
		markersVisible?: boolean;
		connectionStatus?: ConnectionStatus;
		endpoint?: string;
		sessionId?: string | null;
		settings?: FeedbackSettings;
		webhookUrl?: string;
		shortcut?: string;
		onToggleActive: () => void;
		onCopy: () => void;
		canSubmit?: boolean;
		onSubmit?: () => void;
		onClear: () => void;
		onSettingsChange?: (settings: FeedbackSettings) => void;
		onLayout?: () => void;
		onRearrange?: () => void;
		onPause?: () => void;
		onToggleMarkers?: () => void;
		onHide?: () => void;
		canUndo?: boolean;
		canRedo?: boolean;
		onUndo?: () => void;
		onRedo?: () => void;
		onNewPage?: () => void;
		class?: string;
	}

	interface ToolbarPosition {
		x: number;
		y: number;
	}

	interface DragState {
		x: number;
		y: number;
		toolbarX: number;
		toolbarY: number;
	}

	const POSITION_KEY = 'dryui-feedback-toolbar-position';
	const WRAPPER_WIDTH = 337;
	const DRAG_THRESHOLD = 10;
	const ENTRANCE_DURATION = 500;
	const HIDE_DURATION = 400;

	let {
		annotationCount,
		hasOutput = annotationCount > 0,
		placementCount = 0,
		sectionCount = 0,
		copyLabel,
		copyState = 'idle',
		copyDisabled,
		submitLabel,
		submitState = 'idle',
		submitDisabled,
		active,
		hidden = false,
		paused = false,
		layoutActive = false,
		rearrangeActive = false,
		markersVisible = true,
		connectionStatus = 'disconnected',
		endpoint,
		sessionId = null,
		settings: initialSettings = loadSettings(),
		webhookUrl = '',
		shortcut,
		onToggleActive,
		onCopy,
		onSubmit,
		canSubmit = true,
		onClear,
		onSettingsChange,
		onLayout,
		onRearrange,
		onPause,
		onToggleMarkers,
		onHide,
		canUndo = false,
		canRedo = false,
		onUndo,
		onRedo,
		onNewPage,
		class: className
	}: Props = $props();

	let settingsOpen = $state(false);
	let toolbarPosition = $state<ToolbarPosition | null>(null);
	let dragState = $state<DragState | null>(null);
	let dragging = $state(false);
	let viewportWidth = $state(0);
	let tooltipsHidden = $state(false);
	let tooltipSessionActive = $state(false);
	let showEntranceAnimation = $state(false);
	let hiding = $state(false);
	let justFinishedDrag = false;

	let entranceTimer: ReturnType<typeof setTimeout> | undefined;
	let hideTimer: ReturnType<typeof setTimeout> | undefined;
	let shellEl = $state<HTMLDivElement | undefined>();

	const settings = $derived({ ...initialSettings });
	const toggleTitle = $derived(
		`${active ? 'Stop annotating' : 'Start annotating'}${shortcut ? ` (${shortcut})` : ''}`
	);
	const settingsAvailable = $derived(active && !hidden);
	const autoSendActive = $derived(
		Boolean((settings.webhookUrl || webhookUrl).trim()) && settings.webhooksEnabled
	);
	const showSubmit = $derived(canSubmit && onSubmit !== undefined && !autoSendActive);
	const copyStateLabel = $derived(copyLabel ?? (copyState === 'copied' ? 'Copied' : 'Copy output'));
	const submitStateLabel = $derived(
		submitLabel ??
			(submitState === 'sending'
				? 'Sending...'
				: submitState === 'sent'
					? 'Sent'
					: submitState === 'failed'
						? 'Send failed'
						: 'Send to agent')
	);
	const isCopyDisabled = $derived(copyDisabled ?? !hasOutput);
	const isSubmitDisabled = $derived(submitDisabled ?? (!hasOutput || submitState === 'sending'));
	const isCopyActive = $derived(copyState === 'copied');
	const isSubmitActive = $derived(submitState !== 'idle');
	const markersLabel = $derived(markersVisible ? 'Hide markers' : 'Show markers');
	const markersDisabled = $derived(annotationCount === 0 || layoutActive || rearrangeActive);
	const lightTheme = $derived(settings.theme === 'light');
	const settingsVisible = $derived(settingsOpen && settingsAvailable);
	const toolbarNearTop = $derived(Boolean(toolbarPosition && toolbarPosition.y < 230));
	const toolbarNearLeft = $derived(Boolean(toolbarPosition && toolbarPosition.x < 120));
	const toolbarNearRight = $derived(
		Boolean(toolbarPosition && viewportWidth > 0 && toolbarPosition.x > viewportWidth - 120)
	);
	const connectionDotVisible = $derived(
		Boolean(endpoint) && connectionStatus !== 'disconnected' && !settingsVisible
	);
	const shellClass = $derived(
		[
			'toolbar-shell',
			active ? 'expanded' : 'collapsed',
			lightTheme ? 'light' : 'dark',
			showEntranceAnimation ? 'entrance' : '',
			hiding ? 'hiding' : '',
			dragging ? 'dragging' : ''
		]
			.filter(Boolean)
			.join(' ')
	);
	const controlsClass = $derived(
		[
			'controls-content',
			active ? 'visible' : 'hidden',
			toolbarNearTop ? 'tooltip-below' : '',
			tooltipsHidden || settingsVisible ? 'tooltips-hidden' : '',
			tooltipSessionActive ? 'tooltips-in-session' : ''
		]
			.filter(Boolean)
			.join(' ')
	);
	function applyShellPosition(node: HTMLElement) {
		function update() {
			if (toolbarPosition) {
				node.style.setProperty('left', `${toolbarPosition.x}px`);
				node.style.setProperty('top', `${toolbarPosition.y}px`);
				node.style.setProperty('right', 'auto');
				node.style.setProperty('bottom', 'auto');
			} else {
				node.style.removeProperty('left');
				node.style.removeProperty('top');
				node.style.setProperty('right', 'var(--dry-space-4, 16px)');
				node.style.setProperty('bottom', 'var(--dry-space-4, 16px)');
			}
		}

		update();
		$effect(() => {
			toolbarPosition;
			update();
		});
	}

	function clearTimers() {
		if (entranceTimer) clearTimeout(entranceTimer);
		if (hideTimer) clearTimeout(hideTimer);
	}

	function hideTooltipsUntilMouseLeave() {
		tooltipsHidden = true;
		tooltipSessionActive = true;
	}

	function resetTooltipSession() {
		tooltipsHidden = false;
		tooltipSessionActive = false;
	}

	function closeSettings() {
		settingsOpen = false;
		resetTooltipSession();
	}

	function loadToolbarPosition(): ToolbarPosition | null {
		if (typeof window === 'undefined') return null;

		try {
			const raw = localStorage.getItem(POSITION_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw) as Partial<ToolbarPosition>;
			if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
				return { x: parsed.x, y: parsed.y };
			}
		} catch {
			return null;
		}

		return null;
	}

	function saveToolbarPosition(position: ToolbarPosition | null) {
		if (typeof window === 'undefined' || !position) return;

		try {
			localStorage.setItem(POSITION_KEY, JSON.stringify(position));
		} catch {
			// localStorage can be unavailable
		}
	}

	function getContentWidth() {
		const shell = document.querySelector(
			'[data-feedback-toolbar] .toolbar-shell'
		) as HTMLElement | null;
		return shell?.getBoundingClientRect().width ?? (active ? 297 : 44);
	}

	function clampPosition(x: number, y: number): ToolbarPosition {
		const padding = 20;
		const contentWidth = getContentWidth();
		const contentOffset = WRAPPER_WIDTH - contentWidth;
		const minX = padding - contentOffset;
		const maxX = window.innerWidth - padding - WRAPPER_WIDTH;

		return {
			x: Math.max(minX, Math.min(maxX, x)),
			y: Math.max(padding, Math.min(window.innerHeight - 44 - padding, y))
		};
	}

	function constrainToolbarPosition() {
		if (!toolbarPosition || typeof window === 'undefined') return;
		toolbarPosition = clampPosition(toolbarPosition.x, toolbarPosition.y);
	}

	async function toggleActiveState(event: MouseEvent | KeyboardEvent) {
		event.stopPropagation();
		if (active) {
			settingsOpen = false;
			hideTooltipsUntilMouseLeave();
		}
		onToggleActive();
		await tick();
		constrainToolbarPosition();
	}

	function handleSettingsChange(next: FeedbackSettings) {
		onSettingsChange?.(next);
		queueMicrotask(() => {
			tick().then(() => {
				constrainToolbarPosition();
			});
		});
	}

	async function toggleSettings(event: MouseEvent) {
		event.stopPropagation();
		if (!settingsAvailable) {
			closeSettings();
			return;
		}
		if (settingsOpen) {
			closeSettings();
			return;
		}
		if (layoutActive || rearrangeActive) {
			onLayout?.();
			await tick();
		}
		hideTooltipsUntilMouseLeave();
		settingsOpen = true;
	}

	function runAction(handler?: () => void, options?: { closeSettings?: boolean }) {
		return (event: MouseEvent) => {
			event.stopPropagation();
			hideTooltipsUntilMouseLeave();
			if (options?.closeSettings) closeSettings();
			handler?.();
		};
	}

	function handleHide() {
		if (hiding) return;
		closeSettings();
		hideTooltipsUntilMouseLeave();
		hiding = true;
		if (hideTimer) clearTimeout(hideTimer);
		hideTimer = setTimeout(() => {
			onHide?.();
		}, HIDE_DURATION);
	}

	function handleShellClick(event: MouseEvent) {
		if (active) return;
		if (justFinishedDrag) {
			justFinishedDrag = false;
			event.preventDefault();
			return;
		}
		void toggleActiveState(event);
	}

	function handleShellKeydown(event: KeyboardEvent) {
		if (active) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		void toggleActiveState(event);
	}

	function handleShellMouseDown(event: MouseEvent) {
		if (event.button !== 0) return;

		const target = event.target as HTMLElement;
		if (target.closest('button')) {
			return;
		}

		const wrapper = (event.currentTarget as HTMLElement | null)?.closest(
			'[data-feedback-toolbar]'
		) as HTMLDivElement | null;
		if (!wrapper) return;

		const rect = wrapper.getBoundingClientRect();
		dragState = {
			x: event.clientX,
			y: event.clientY,
			toolbarX: toolbarPosition?.x ?? rect.left,
			toolbarY: toolbarPosition?.y ?? rect.top
		};
		dragging = false;
	}

	function handleWindowMouseMove(event: MouseEvent) {
		if (!dragState || typeof window === 'undefined') return;

		const deltaX = event.clientX - dragState.x;
		const deltaY = event.clientY - dragState.y;
		if (!dragging && Math.hypot(deltaX, deltaY) < DRAG_THRESHOLD) {
			return;
		}

		dragging = true;
		toolbarPosition = clampPosition(dragState.toolbarX + deltaX, dragState.toolbarY + deltaY);
	}

	function handleWindowMouseUp() {
		if (dragging) {
			saveToolbarPosition(toolbarPosition);
			justFinishedDrag = true;
			window.setTimeout(() => {
				justFinishedDrag = false;
			}, 0);
		}

		dragState = null;
		dragging = false;
	}

	onMount(() => {
		viewportWidth = window.innerWidth;
		toolbarPosition = loadToolbarPosition();
		showEntranceAnimation = true;
		entranceTimer = setTimeout(() => {
			showEntranceAnimation = false;
		}, ENTRANCE_DURATION);

		const handleResize = () => {
			viewportWidth = window.innerWidth;
			constrainToolbarPosition();
		};

		// Attach click/keydown directly (not via Svelte delegation) so the
		// handler fires reliably even when the toolbar lives inside a Portal
		// that has moved this element to document.body after initial render.
		shellEl?.addEventListener('click', handleShellClick);
		shellEl?.addEventListener('keydown', handleShellKeydown as EventListener);

		window.addEventListener('mousemove', handleWindowMouseMove);
		window.addEventListener('mouseup', handleWindowMouseUp);
		window.addEventListener('resize', handleResize);

		return () => {
			shellEl?.removeEventListener('click', handleShellClick);
			shellEl?.removeEventListener('keydown', handleShellKeydown as EventListener);
			window.removeEventListener('mousemove', handleWindowMouseMove);
			window.removeEventListener('mouseup', handleWindowMouseUp);
			window.removeEventListener('resize', handleResize);
			clearTimers();
		};
	});

	$effect(() => {
		if (!settingsAvailable && settingsOpen) {
			closeSettings();
		}
	});
</script>

{#if !hidden}
	<div
		class={['feedback-toolbar-shell', className].filter(Boolean).join(' ')}
		data-feedback-toolbar
		data-dryui-feedback
		data-feedback-toolbar-theme={lightTheme ? 'light' : 'dark'}
		use:applyShellPosition
	>
		<div
			class={shellClass}
			data-testid="toggle-btn"
			role="button"
			tabindex={!active ? 0 : -1}
			aria-label={!active ? toggleTitle : 'Feedback toolbar'}
			aria-pressed={active}
			title={!active ? 'Start feedback mode' : undefined}
			bind:this={shellEl}
			onmousedown={handleShellMouseDown}
		>
			<div class:hidden={active} class:visible={!active} class="toggle-content">
				<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
					<path
						d="M5 7.5h9M5 12h11M5 16.5h8"
						stroke="currentColor"
						stroke-width="1.8"
						stroke-linecap="round"
					/>
					<path
						d="M18.5 6.5l1 2.2 2.2 1-2.2 1-1 2.3-1-2.3-2.3-1 2.3-1 1-2.2Z"
						fill="currentColor"
					/>
				</svg>

				{#if annotationCount > 0}
					<Badge
						class="toggle-badge"
						data-testid="annotation-count"
						variant="solid"
						size="sm"
						color="blue"
						aria-label={`${annotationCount} annotations`}
					>
						{annotationCount}
					</Badge>
				{/if}
			</div>

			<div class={controlsClass}>
				<Toolbar.Root
					aria-label="Feedback toolbar"
					class="controls-toolbar"
					onmouseenter={resetTooltipSession}
					onmouseleave={resetTooltipSession}
				>
					<div class="toolbar-item" class:align-left={toolbarNearLeft}>
						<Toolbar.Button
							data-testid="pause-btn"
							title={paused ? 'Resume animations' : 'Pause animations'}
							aria-label={paused ? 'Resume animations' : 'Pause animations'}
							aria-pressed={paused}
							onclick={runAction(onPause)}
						>
							{#if paused}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M5 4.5v7M11 4.5v7"
										stroke="currentColor"
										stroke-width="1.7"
										stroke-linecap="round"
									/>
								</svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M5.5 4.5l6 3.5-6 3.5v-7Z"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linejoin="round"
									/>
								</svg>
							{/if}
						</Toolbar.Button>
						<span class="toolbar-tooltip">Pause animations <span class="shortcut">P</span></span>
					</div>

					<div class="toolbar-item">
						<Toolbar.Button
							data-testid="layout-btn"
							title="Toggle layout mode"
							aria-label="Toggle layout mode"
							aria-pressed={layoutActive}
							onclick={runAction(onLayout, { closeSettings: true })}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<rect
									x="2"
									y="3"
									width="12"
									height="2.5"
									rx="1"
									stroke="currentColor"
									stroke-width="1.2"
								/>
								<rect
									x="2"
									y="6.75"
									width="7"
									height="6"
									rx="1"
									stroke="currentColor"
									stroke-width="1.2"
								/>
								<rect
									x="10"
									y="6.75"
									width="4"
									height="6"
									rx="1"
									stroke="currentColor"
									stroke-width="1.2"
								/>
							</svg>
						</Toolbar.Button>
						<span class="toolbar-tooltip"
							>{layoutActive ? 'Exit layout mode' : 'Layout mode'}
							<span class="shortcut">L</span></span
						>
					</div>

					<div class="toolbar-item">
						<Toolbar.Button
							data-testid="rearrange-btn"
							title="Toggle rearrange mode"
							aria-label="Toggle rearrange mode"
							aria-pressed={rearrangeActive}
							onclick={runAction(onRearrange, { closeSettings: true })}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M5.5 3.5L3.5 5.5L5.5 7.5"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M10.5 8.5L12.5 10.5L10.5 12.5"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linecap="round"
									stroke-linejoin="round"
								/>
								<path
									d="M3.5 5.5h6a3 3 0 0 1 3 3v2"
									stroke="currentColor"
									stroke-width="1.4"
									stroke-linecap="round"
								/>
							</svg>
						</Toolbar.Button>
						<span class="toolbar-tooltip"
							>{rearrangeActive ? 'Exit rearrange mode' : 'Rearrange mode'}
							<span class="shortcut">R</span></span
						>
					</div>

					{#if onNewPage && layoutActive}
						<div class="toolbar-item">
							<Toolbar.Button
								data-testid="new-page-btn"
								title="New page"
								aria-label="New page"
								onclick={runAction(onNewPage)}
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<rect
										x="3"
										y="2"
										width="10"
										height="12"
										rx="1.5"
										stroke="currentColor"
										stroke-width="1.2"
									/>
									<path
										d="M8 6v4M6 8h4"
										stroke="currentColor"
										stroke-width="1.3"
										stroke-linecap="round"
									/>
								</svg>
							</Toolbar.Button>
							<span class="toolbar-tooltip">New page</span>
						</div>
					{/if}

					<div class="toolbar-item">
						<Toolbar.Button
							data-testid="markers-btn"
							title={markersLabel}
							aria-label={markersLabel}
							aria-pressed={markersVisible}
							disabled={markersDisabled}
							onclick={runAction(onToggleMarkers)}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M2 8c1.4-2.5 3.6-4 6-4s4.6 1.5 6 4c-1.4 2.5-3.6 4-6 4S3.4 10.5 2 8Z"
									stroke="currentColor"
									stroke-width="1.2"
								/>
								<circle cx="8" cy="8" r="1.7" stroke="currentColor" stroke-width="1.2" />
								{#if !markersVisible}
									<path
										d="M3 13L13 3"
										stroke="currentColor"
										stroke-width="1.2"
										stroke-linecap="round"
									/>
								{/if}
							</svg>
						</Toolbar.Button>
						<span class="toolbar-tooltip">{markersLabel} <span class="shortcut">H</span></span>
					</div>

					<div class="toolbar-item">
						<Toolbar.Button
							data-testid="copy-btn"
							data-copy-state={copyState}
							title={copyStateLabel}
							aria-label={copyStateLabel}
							aria-pressed={isCopyActive}
							data-active={isCopyActive}
							disabled={isCopyDisabled}
							onclick={runAction(onCopy)}
						>
							{#if isCopyActive}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M3.5 8.5l2.5 2.5 6-6"
										stroke="currentColor"
										stroke-width="1.6"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<circle
										cx="8"
										cy="8"
										r="6"
										stroke="currentColor"
										stroke-width="1.2"
										fill="none"
									/>
								</svg>
							{:else}
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<rect
										x="5"
										y="5"
										width="8"
										height="8"
										rx="1.5"
										stroke="currentColor"
										stroke-width="1.5"
									/>
									<path
										d="M3 11V3a1.5 1.5 0 011.5-1.5H11"
										stroke="currentColor"
										stroke-width="1.5"
										stroke-linecap="round"
									/>
								</svg>
							{/if}
						</Toolbar.Button>
						<span class="toolbar-tooltip">{copyStateLabel} <span class="shortcut">C</span></span>
					</div>

					{#if onSubmit}
						<div
							class={[
								'toolbar-item',
								'send-button-wrapper',
								showSubmit ? 'send-button-visible' : ''
							]
								.filter(Boolean)
								.join(' ')}
							data-testid="submit-slot"
						>
							{#if showSubmit}
								<Toolbar.Button
									data-testid="submit-btn"
									data-submit-state={submitState}
									title={submitStateLabel}
									aria-label={submitStateLabel}
									aria-pressed={isSubmitActive}
									data-active={isSubmitActive}
									disabled={isSubmitDisabled}
									onclick={runAction(onSubmit)}
								>
									{#if submitState === 'sending'}
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<circle
												cx="8"
												cy="8"
												r="5.5"
												stroke="currentColor"
												stroke-width="1.2"
												opacity="0.35"
											/>
											<path
												d="M8 2.5a5.5 5.5 0 0 1 5.5 5.5"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
											/>
										</svg>
									{:else if submitState === 'sent'}
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M3.5 8.5l2.5 2.5 6-6"
												stroke="currentColor"
												stroke-width="1.6"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{:else if submitState === 'failed'}
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M4 4l8 8M12 4l-8 8"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
											/>
										</svg>
									{:else}
										<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
											<path
												d="M2 8h9m0 0L7.5 4.5M11 8l-3.5 3.5"
												stroke="currentColor"
												stroke-width="1.5"
												stroke-linecap="round"
												stroke-linejoin="round"
											/>
										</svg>
									{/if}
								</Toolbar.Button>
							{/if}
							<span class="toolbar-tooltip">{submitStateLabel} <span class="shortcut">S</span></span
							>
						</div>
					{/if}

					{#if onUndo && layoutActive}
						<div class="toolbar-item">
							<Toolbar.Button
								data-testid="undo-btn"
								title="Undo"
								aria-label="Undo"
								disabled={!canUndo}
								onclick={runAction(onUndo)}
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M4 6h5.5a3 3 0 0 1 0 6H8"
										stroke="currentColor"
										stroke-width="1.3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M6.5 3.5L4 6l2.5 2.5"
										stroke="currentColor"
										stroke-width="1.3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</Toolbar.Button>
							<span class="toolbar-tooltip">Undo <span class="shortcut">&#8984;Z</span></span>
						</div>
					{/if}

					{#if onRedo && layoutActive}
						<div class="toolbar-item">
							<Toolbar.Button
								data-testid="redo-btn"
								title="Redo"
								aria-label="Redo"
								disabled={!canRedo}
								onclick={runAction(onRedo)}
							>
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
									<path
										d="M12 6H6.5a3 3 0 0 0 0 6H8"
										stroke="currentColor"
										stroke-width="1.3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
									<path
										d="M9.5 3.5L12 6l-2.5 2.5"
										stroke="currentColor"
										stroke-width="1.3"
										stroke-linecap="round"
										stroke-linejoin="round"
									/>
								</svg>
							</Toolbar.Button>
							<span class="toolbar-tooltip">Redo <span class="shortcut">&#8984;&#8679;Z</span></span
							>
						</div>
					{/if}

					<div class="toolbar-item">
						<Toolbar.Button
							data-testid="clear-btn"
							title="Clear annotations"
							aria-label="Clear annotations"
							disabled={!hasOutput}
							onclick={runAction(onClear)}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 4l8 8M12 4l-8 8"
									stroke="currentColor"
									stroke-width="1.5"
									stroke-linecap="round"
								/>
							</svg>
						</Toolbar.Button>
						<span class="toolbar-tooltip">Clear all <span class="shortcut">X</span></span>
					</div>

					<div class="toolbar-item settings-item">
						<Toolbar.Button
							data-testid="settings-btn"
							title="Open settings"
							aria-label="Open settings"
							aria-pressed={settingsVisible}
							onclick={toggleSettings}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M6.5 2.7h3l.4 1.3c.2.1.4.2.6.3l1.2-.6 2 2-.6 1.2c.1.2.2.4.3.6l1.3.4v3l-1.3.4c-.1.2-.2.4-.3.6l.6 1.2-2 2-1.2-.6c-.2.1-.4.2-.6.3l-.4 1.3h-3l-.4-1.3c-.2-.1-.4-.2-.6-.3l-1.2.6-2-2 .6-1.2c-.1-.2-.2-.4-.3-.6l-1.3-.4v-3l1.3-.4c.1-.2.2-.4.3-.6l-.6-1.2 2-2 1.2.6c.2-.1.4-.2.6-.3l.4-1.3Z"
									stroke="currentColor"
									stroke-width="1.1"
								/>
								<circle cx="8" cy="8" r="2.2" stroke="currentColor" stroke-width="1.2" />
							</svg>
						</Toolbar.Button>
						{#if connectionDotVisible}
							<span
								class={['connection-indicator', connectionStatus].filter(Boolean).join(' ')}
								data-testid="connection-status"
								aria-label={`Server sync ${connectionStatus}`}
							></span>
						{/if}
						<span class="toolbar-tooltip">Settings</span>
					</div>

					<div class="divider" aria-hidden="true"></div>

					<div class="toolbar-item" class:align-right={toolbarNearRight}>
						<Toolbar.Button
							data-testid="exit-btn"
							title="Exit feedback"
							aria-label="Exit feedback"
							onclick={(event) => {
								void toggleActiveState(event);
							}}
						>
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
								<path
									d="M4 4l8 8M12 4l-8 8"
									stroke="currentColor"
									stroke-width="1.6"
									stroke-linecap="round"
								/>
							</svg>
						</Toolbar.Button>
						<span class="toolbar-tooltip">Exit <span class="shortcut">Esc</span></span>
					</div>
				</Toolbar.Root>
			</div>
		</div>
	</div>

	{#if settingsVisible}
		<Drawer.Root open={true} side="right">
			<Drawer.Overlay
				data-feedback-settings-overlay
				onclick={() => {
					closeSettings();
				}}
			/>
			<Drawer.Content
				class="settings-drawer"
				data-feedback-settings-drawer
				aria-label="Feedback settings"
				onkeydown={(event) => {
					if (event.key === 'Escape') {
						event.preventDefault();
						event.stopPropagation();
						closeSettings();
					}
				}}
			>
				<SettingsPanel
					{settings}
					{markersVisible}
					onChange={handleSettingsChange}
					onClose={() => {
						closeSettings();
					}}
					{placementCount}
					{sectionCount}
					{onPause}
					onHide={handleHide}
					onLayout={() => {
						closeSettings();
						onLayout?.();
					}}
					onRearrange={() => {
						closeSettings();
						onRearrange?.();
					}}
					{onToggleMarkers}
					{paused}
					{hidden}
					{layoutActive}
					{rearrangeActive}
					{connectionStatus}
					{endpoint}
					{sessionId}
				/>
			</Drawer.Content>
		</Drawer.Root>
	{/if}
{/if}

<style>
	@keyframes toolbar-enter {
		0% {
			opacity: 0;
			transform: scale(0.72);
		}

		100% {
			opacity: 1;
			transform: scale(1);
		}
	}

	@keyframes toolbar-hide {
		0% {
			opacity: 1;
			transform: scale(1);
		}

		100% {
			opacity: 0;
			transform: scale(0.72);
		}
	}

	.feedback-toolbar-shell {
		position: fixed;
		z-index: 10002;
		display: grid;
		grid-template-columns: 337px;
		pointer-events: none;
	}

	.toolbar-shell {
		position: relative;
		margin-left: auto;
		display: flex;
		align-items: center;
		justify-content: center;
		pointer-events: auto;
		user-select: none;
		transition:
			width 0.4s cubic-bezier(0.19, 1, 0.22, 1),
			transform 0.4s cubic-bezier(0.19, 1, 0.22, 1),
			background-color 0.18s ease;
	}

	.toolbar-shell.dark {
		background: rgba(15, 23, 42, 0.96);
		color: rgba(248, 250, 252, 0.94);
		box-shadow:
			0 2px 8px rgba(15, 23, 42, 0.2),
			0 4px 16px rgba(15, 23, 42, 0.12);
	}

	.toolbar-shell.light {
		background: rgba(255, 255, 255, 0.98);
		color: rgba(15, 23, 42, 0.9);
		box-shadow:
			0 2px 10px rgba(15, 23, 42, 0.12),
			0 16px 30px rgba(15, 23, 42, 0.12);
	}

	.toolbar-shell.entrance {
		animation: toolbar-enter 0.5s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
	}

	.toolbar-shell.hiding {
		animation: toolbar-hide 0.4s cubic-bezier(0.4, 0, 1, 1) forwards;
		pointer-events: none;
	}

	.toolbar-shell.dragging {
		cursor: grabbing;
	}

	.toolbar-shell.collapsed {
		aspect-ratio: 1;
		height: 44px;
		border-radius: 22px;
		cursor: grab;
	}

	.toolbar-shell.collapsed:hover {
		background: rgba(30, 41, 59, 0.98);
	}

	.toolbar-shell.light.collapsed:hover {
		background: rgba(241, 245, 249, 0.98);
	}

	.toolbar-shell.collapsed:active {
		transform: scale(0.95);
	}

	.toolbar-shell.expanded {
		min-height: 44px;
		padding: 0.375rem;
		border-radius: 1.5rem;
		cursor: grab;
	}

	.toggle-content {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: opacity 0.1s cubic-bezier(0.19, 1, 0.22, 1);
	}

	.toggle-content.visible {
		opacity: 1;
		visibility: visible;
		pointer-events: auto;
	}

	.toggle-content.hidden {
		opacity: 0;
		pointer-events: none;
	}

	.toggle-badge {
		position: absolute;
		top: -0.75rem;
		right: -0.75rem;
	}

	.controls-content {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		transition:
			filter 0.8s cubic-bezier(0.19, 1, 0.22, 1),
			opacity 0.8s cubic-bezier(0.19, 1, 0.22, 1),
			transform 0.6s cubic-bezier(0.19, 1, 0.22, 1);
	}

	.controls-content.visible {
		display: flex;
		opacity: 1;
		filter: blur(0);
		transform: scale(1);
		visibility: visible;
		pointer-events: auto;
	}

	.controls-content.hidden {
		display: flex;
		opacity: 0;
		filter: blur(10px);
		transform: scale(0.4);
		visibility: hidden;
		pointer-events: none;
	}

	.controls-toolbar {
	}

	.toolbar-item {
		position: relative;
		display: grid;
		grid-template-columns: minmax(2.125rem, max-content);
		align-items: center;
		justify-content: center;
	}

	.toolbar-item button {
		color: inherit;
		min-height: 2.125rem;
	}

	.toolbar-item:hover .toolbar-tooltip {
		opacity: 1;
		visibility: visible;
		transform: translateX(-50%) scale(1);
		transition-delay: 0.85s;
	}

	.tooltips-in-session .toolbar-item:hover .toolbar-tooltip {
		transition-delay: 0s;
	}

	.toolbar-tooltip {
		position: absolute;
		bottom: calc(100% + 14px);
		left: 50%;
		transform: translateX(-50%) scale(0.95);
		padding: 6px 10px;
		border-radius: 8px;
		white-space: nowrap;
		font-size: 12px;
		font-weight: 500;
		opacity: 0;
		visibility: hidden;
		pointer-events: none;
		z-index: 10003;
		background: rgba(15, 23, 42, 0.98);
		color: rgba(248, 250, 252, 0.96);
		box-shadow: 0 2px 8px rgba(15, 23, 42, 0.3);
		transition:
			opacity 0.135s ease,
			transform 0.135s ease,
			visibility 0.135s ease;
	}

	.toolbar-tooltip::after {
		content: '';
		position: absolute;
		top: calc(100% - 4px);
		left: 50%;
		aspect-ratio: 1;
		height: 8px;
		transform: translateX(-50%) rotate(45deg);
		background: rgba(15, 23, 42, 0.98);
		border-radius: 0 0 2px 0;
	}

	.tooltip-below .toolbar-tooltip {
		top: calc(100% + 14px);
		bottom: auto;
	}

	.tooltip-below .toolbar-tooltip::after {
		top: -4px;
		bottom: auto;
		border-radius: 2px 0 0 0;
	}

	.toolbar-item.align-left .toolbar-tooltip {
		transform: translateX(-12px) scale(0.95);
	}

	.toolbar-item.align-left .toolbar-tooltip::after {
		left: 16px;
	}

	.toolbar-item.align-left:hover .toolbar-tooltip {
		transform: translateX(-12px) scale(1);
	}

	.toolbar-item.align-right .toolbar-tooltip {
		transform: translateX(calc(-100% + 12px)) scale(0.95);
	}

	.toolbar-item.align-right .toolbar-tooltip::after {
		left: auto;
		right: 8px;
	}

	.toolbar-item.align-right:hover .toolbar-tooltip {
		transform: translateX(calc(-100% + 12px)) scale(1);
	}

	.tooltips-hidden .toolbar-tooltip {
		opacity: 0 !important;
		visibility: hidden !important;
		transition: none !important;
	}

	.shortcut {
		margin-left: 4px;
		opacity: 0.5;
	}

	.send-button-wrapper {
		display: grid;
		grid-template-columns: 0px;
		margin-left: -0.375rem;
		overflow: hidden;
		opacity: 0;
		pointer-events: none;
		transition:
			grid-template-columns 0.4s cubic-bezier(0.19, 1, 0.22, 1),
			opacity 0.3s cubic-bezier(0.19, 1, 0.22, 1),
			margin 0.4s cubic-bezier(0.19, 1, 0.22, 1);
	}

	.send-button-wrapper button {
		transform: scale(0.8);
		transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
	}

	.send-button-wrapper.send-button-visible {
		grid-template-columns: 34px;
		margin-left: 0;
		overflow: visible;
		opacity: 1;
		pointer-events: auto;
	}

	.send-button-wrapper.send-button-visible button {
		transform: scale(1);
	}

	.settings-item {
		margin-left: 0.125rem;
	}

	.connection-indicator {
		position: absolute;
		top: 5px;
		right: 5px;
		aspect-ratio: 1;
		height: 7px;
		border-radius: 999px;
		background: #94a3b8;
		box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.96);
	}

	.toolbar-shell.light .connection-indicator {
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.98);
	}

	.connection-indicator.connected {
		background: #22c55e;
	}

	.connection-indicator.connecting {
		background: #f59e0b;
	}

	.divider {
		aspect-ratio: 1 / 12;
		height: 12px;
		margin: 0 0.125rem;
		background: rgba(255, 255, 255, 0.16);
	}

	.toolbar-shell.light .divider {
		background: rgba(15, 23, 42, 0.14);
	}

	.settings-drawer {
		display: grid;
		grid-template-columns: minmax(0, min(24rem, calc(100vw - 1.5rem)));
	}
</style>
