<script lang="ts">
	import { AlertDialog, Button, Field, InputGroup, Kbd, Label } from '@dryui/ui';
	import type { Snippet } from 'svelte';
	import type { Attachment } from 'svelte/attachments';
	import {
		ArrowLeft,
		Boxes,
		Check,
		Eraser,
		GripVertical,
		Move,
		MoveUpRight,
		Pencil,
		Plus,
		Redo2,
		RotateCcw,
		Search,
		Send,
		Trash2,
		Type,
		Undo2,
		Ungroup
	} from 'lucide-svelte';
	import { type SubmitStatus, type Tool } from '../types.js';
	import {
		CATEGORY_LABELS,
		CATEGORY_ORDER,
		COMPONENT_CATEGORIES,
		COMPONENT_NAMES,
		type ComponentCategory
	} from './component-names.js';

	export type Mode = 'annotate' | 'components';

	interface Props {
		active: boolean;
		tool: Tool;
		mode: Mode;
		hidden: boolean;
		submitStatus: SubmitStatus;
		sent: boolean;
		hasSelection?: boolean;
		placing?: string | null;
		canUndo?: boolean;
		canRedo?: boolean;
		canReset?: boolean;
		canBreakApart?: boolean;
		addedKind?: string | null;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onsubmit: () => void;
		onmodechange: (mode: Mode) => void;
		oncomponentsreset?: () => void;
		onreset?: () => void;
		onundo?: () => void;
		onredo?: () => void;
		ondeselect?: () => void;
		onaddcomponent?: (kind: string) => void;
		oncancelplacement?: () => void;
		onremoveselected?: () => void;
		onbreakapart?: () => void;
		hint?: Snippet;
	}

	let {
		active,
		tool,
		mode,
		hidden,
		submitStatus,
		sent,
		hasSelection = false,
		placing = null,
		addedKind = null,
		canUndo = false,
		canRedo = false,
		canReset = false,
		canBreakApart = false,
		ontoggle,
		ontoolchange,
		onsubmit,
		onmodechange,
		oncomponentsreset,
		onreset,
		onundo,
		onredo,
		ondeselect,
		onaddcomponent,
		oncancelplacement,
		onremoveselected,
		onbreakapart,
		hint
	}: Props = $props();

	const inspecting = $derived(mode === 'components');
	const showAnnotationTools = $derived(mode === 'annotate');
	const showComponentsTools = $derived(mode === 'components');
	const showToolPill = $derived(showAnnotationTools || showComponentsTools);
	const inspectingLabel = 'Inspecting components';
	const toolbarId = $props.id();
	const pickerSearchId = `${toolbarId}-component-picker-search`;
	const CONTAINED_TOOLBAR_POINTER_EVENTS = ['pointerdown', 'mousedown'] as const;

	let pickerOpen = $state(false);
	let pickerName = $state('');
	let pickerPanelEl = $state<HTMLDivElement | undefined>();

	const capturePickerPanel: Attachment<HTMLDivElement> = (node) => {
		pickerPanelEl = node;
		return () => {
			if (pickerPanelEl === node) pickerPanelEl = undefined;
		};
	};

	const filteredPresets = $derived.by(() => {
		const query = pickerName.trim().toLowerCase();
		if (!query) return COMPONENT_NAMES;
		return COMPONENT_NAMES.filter((name) => name.toLowerCase().includes(query));
	});

	const groupedPresets = $derived.by(() => {
		const groups = new Map<ComponentCategory, string[]>();
		for (const name of filteredPresets) {
			const category = COMPONENT_CATEGORIES[name];
			if (!category) continue;
			let bucket = groups.get(category);
			if (!bucket) {
				bucket = [];
				groups.set(category, bucket);
			}
			bucket.push(name);
		}
		return CATEGORY_ORDER.filter((c) => groups.has(c)).map((category) => ({
			category,
			label: CATEGORY_LABELS[category],
			names: groups.get(category)!
		}));
	});

	const submitLabel = $derived(pickerName.trim() || filteredPresets[0] || '');

	function openPicker() {
		if (placing) {
			oncancelplacement?.();
			return;
		}
		pickerOpen = !pickerOpen;
		if (pickerOpen) pickerName = '';
	}

	function closePicker() {
		pickerOpen = false;
	}

	function pick(kind: string) {
		const trimmed = kind.trim();
		if (!trimmed) return;
		onaddcomponent?.(trimmed);
		pickerOpen = false;
		pickerName = '';
	}

	function handlePickerKey(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault();
			pick(submitLabel);
		} else if (e.key === 'Escape') {
			e.preventDefault();
			closePicker();
		}
	}

	$effect(() => {
		if (!pickerOpen || !pickerPanelEl) return;
		const id = requestAnimationFrame(() => {
			pickerPanelEl?.querySelector<HTMLInputElement>('[data-component-picker-input]')?.focus();
		});
		return () => cancelAnimationFrame(id);
	});

	$effect(() => {
		if (placing) pickerOpen = false;
	});

	let removeConfirmOpen = $state(false);

	$effect(() => {
		if (!hasSelection) removeConfirmOpen = false;
	});

	const removeLabel = $derived(addedKind ? `this ${addedKind}` : 'this element');

	function confirmRemove() {
		removeConfirmOpen = false;
		onremoveselected?.();
	}

	let resetConfirmOpen = $state(false);

	$effect(() => {
		if (!canReset) resetConfirmOpen = false;
	});

	function confirmReset() {
		resetConfirmOpen = false;
		onreset?.();
	}

	const SUBMIT_COPY: Record<SubmitStatus, { label: string; aria: string }> = {
		idle: { label: 'Send feedback', aria: 'Send feedback' },
		'waiting-for-capture': {
			label: 'Share tab',
			aria: 'Choose this tab to capture feedback'
		},
		capturing: { label: 'Capturing...', aria: 'Capturing screenshot' },
		uploading: { label: 'Sending...', aria: 'Sending feedback' }
	};
	const SENT_COPY = { label: 'Sent!', aria: 'Sent!' } as const;

	let dragging = $state(false);
	let dragOffset = $state({ x: 0, y: 0 });
	let pendingDrag = $state<{ id: number; x: number; y: number } | null>(null);
	let customPositioned = $state(false);
	let coarsePointer = $state(false);

	const DRAG_THRESHOLD_PX = 4;
	const VIEWPORT_EDGE_PX = 12;
	const COARSE_POINTER_QUERY = '(pointer: coarse), (hover: none)';
	const submitting = $derived(submitStatus !== 'idle');
	const submitCopy = $derived(sent ? SENT_COPY : SUBMIT_COPY[submitStatus]);

	let toolbarEl = $state<HTMLDivElement | null>(null);

	function repairToolbarLayout(node: HTMLDivElement): boolean {
		if (!node.isConnected) return false;
		const rect = node.getBoundingClientRect();
		if (rect.width > 0 && rect.height > 0) return false;

		const parent = node.parentNode;
		if (!parent) return false;
		const next = node.nextSibling;
		parent.removeChild(node);
		parent.insertBefore(node, next);
		return true;
	}

	function syncToolbarLayoutMetrics() {
		if (pickerOpen) updatePopoverPlacement();
	}

	function scheduleToolbarLayoutRepair(node: HTMLDivElement): () => void {
		let secondFrame = 0;
		const repair = () => {
			if (repairToolbarLayout(node)) syncToolbarLayoutMetrics();
		};
		const firstFrame = requestAnimationFrame(() => {
			repair();
			secondFrame = requestAnimationFrame(repair);
		});

		return () => {
			cancelAnimationFrame(firstFrame);
			if (secondFrame) cancelAnimationFrame(secondFrame);
		};
	}

	const captureToolbar: Attachment<HTMLDivElement> = (node) => {
		toolbarEl = node;
		const cleanupRepair = scheduleToolbarLayoutRepair(node);
		const stopAtToolbarBoundary = (event: Event) => {
			const target = event.target;
			if (target instanceof Element && target.closest('.drag-handle')) return;
			event.stopPropagation();
		};

		for (const eventName of CONTAINED_TOOLBAR_POINTER_EVENTS) {
			node.addEventListener(eventName, stopAtToolbarBoundary);
		}

		return () => {
			cleanupRepair();
			if (toolbarEl === node) toolbarEl = null;
			for (const eventName of CONTAINED_TOOLBAR_POINTER_EVENTS) {
				node.removeEventListener(eventName, stopAtToolbarBoundary);
			}
		};
	};

	let popoverPlacement = $state<'top' | 'bottom'>('top');
	const POPOVER_HEIGHT = 380;
	const POPOVER_GAP = 16;

	function updatePopoverPlacement() {
		if (!toolbarEl) return;
		const rect = toolbarEl.getBoundingClientRect();
		const spaceAbove = rect.top - POPOVER_GAP;
		const spaceBelow = window.innerHeight - rect.bottom - POPOVER_GAP;
		const next: 'top' | 'bottom' =
			spaceAbove < POPOVER_HEIGHT && spaceBelow > spaceAbove ? 'bottom' : 'top';
		if (next !== popoverPlacement) popoverPlacement = next;
	}

	let popoverFrame = 0;
	function schedulePopoverUpdate() {
		if (popoverFrame) return;
		popoverFrame = requestAnimationFrame(() => {
			popoverFrame = 0;
			updatePopoverPlacement();
		});
	}

	$effect(() => {
		if (!pickerOpen) return;
		updatePopoverPlacement();
		window.addEventListener('resize', schedulePopoverUpdate);
		window.addEventListener('scroll', schedulePopoverUpdate, true);
		return () => {
			if (popoverFrame) cancelAnimationFrame(popoverFrame);
			window.removeEventListener('resize', schedulePopoverUpdate);
			window.removeEventListener('scroll', schedulePopoverUpdate, true);
		};
	});

	function handleHandlePointerDown(e: PointerEvent) {
		pendingDrag = { id: e.pointerId, x: e.clientX, y: e.clientY };
	}

	function handleHandlePointerMove(e: PointerEvent) {
		if (!pendingDrag || !toolbarEl) return;
		const handle = e.currentTarget as HTMLButtonElement;

		if (!dragging) {
			const dx = e.clientX - pendingDrag.x;
			const dy = e.clientY - pendingDrag.y;
			if (Math.hypot(dx, dy) < DRAG_THRESHOLD_PX) return;
			const rect = toolbarEl.getBoundingClientRect();
			dragOffset = { x: pendingDrag.x - rect.left, y: pendingDrag.y - rect.top };
			handle.setPointerCapture(pendingDrag.id);
			dragging = true;
		}

		const x = Math.max(
			0,
			Math.min(window.innerWidth - toolbarEl.offsetWidth, e.clientX - dragOffset.x)
		);
		const y = Math.max(
			0,
			Math.min(window.innerHeight - toolbarEl.offsetHeight, e.clientY - dragOffset.y)
		);
		toolbarEl.style.left = `${x}px`;
		toolbarEl.style.top = `${y}px`;
		toolbarEl.style.right = 'auto';
		toolbarEl.style.bottom = 'auto';
	}

	function handleHandlePointerUp() {
		pendingDrag = null;
		if (dragging && toolbarEl) {
			const rect = toolbarEl.getBoundingClientRect();
			toolbarEl.style.right = `${window.innerWidth - rect.right}px`;
			toolbarEl.style.bottom = `${window.innerHeight - rect.bottom}px`;
			toolbarEl.style.left = 'auto';
			toolbarEl.style.top = 'auto';
			customPositioned = true;
		}
		dragging = false;
	}

	let clampFrame = 0;
	function clampCustomPosition() {
		if (!customPositioned || !toolbarEl) return;
		const rect = toolbarEl.getBoundingClientRect();
		const maxX = Math.max(VIEWPORT_EDGE_PX, window.innerWidth - rect.width - VIEWPORT_EDGE_PX);
		const maxY = Math.max(VIEWPORT_EDGE_PX, window.innerHeight - rect.height - VIEWPORT_EDGE_PX);
		const x = Math.max(VIEWPORT_EDGE_PX, Math.min(maxX, rect.left));
		const y = Math.max(VIEWPORT_EDGE_PX, Math.min(maxY, rect.top));
		toolbarEl.style.right = `${Math.max(VIEWPORT_EDGE_PX, window.innerWidth - x - rect.width)}px`;
		toolbarEl.style.bottom = `${Math.max(VIEWPORT_EDGE_PX, window.innerHeight - y - rect.height)}px`;
		toolbarEl.style.left = 'auto';
		toolbarEl.style.top = 'auto';
	}

	function scheduleClamp() {
		if (clampFrame) return;
		clampFrame = requestAnimationFrame(() => {
			clampFrame = 0;
			clampCustomPosition();
		});
	}

	$effect(() => {
		const pointerQuery = window.matchMedia(COARSE_POINTER_QUERY);
		const syncPointerMode = () => {
			coarsePointer = pointerQuery.matches;
		};

		syncPointerMode();
		pointerQuery.addEventListener('change', syncPointerMode);
		window.addEventListener('resize', scheduleClamp);
		window.addEventListener('orientationchange', scheduleClamp);

		return () => {
			if (clampFrame) cancelAnimationFrame(clampFrame);
			pointerQuery.removeEventListener('change', syncPointerMode);
			window.removeEventListener('resize', scheduleClamp);
			window.removeEventListener('orientationchange', scheduleClamp);
		};
	});

	function handleToolClick(t: Tool) {
		if (!active || tool !== t) {
			ontoolchange(t);
			if (!active) ontoggle();
		} else {
			ontoggle();
		}
	}

	function deactivateTools() {
		if (active) ontoggle();
	}
</script>

<div
	class="toolbar"
	{@attach captureToolbar}
	data-hidden={hidden || undefined}
	data-dragging={dragging || undefined}
	data-custom-position={customPositioned || undefined}
	data-coarse-pointer={coarsePointer || undefined}
	role="toolbar"
	tabindex="-1"
	aria-hidden={hidden}
	aria-label="Feedback toolbar"
>
	{#if hint}
		<div class="toolbar-hint" aria-hidden="true">
			{@render hint()}
		</div>
	{/if}

	<div class="toolbar-row">
		<div class="history-pill" role="group" aria-label="History">
			{@render historyButtons()}
		</div>

		<div class="mode-pill" role="tablist" aria-label="Feedback mode">
			<Button
				variant="trigger"
				size="sm"
				class="mode-btn"
				type="button"
				role="tab"
				aria-selected={mode === 'annotate'}
				data-active={mode === 'annotate' || undefined}
				onclick={() => onmodechange('annotate')}
			>
				<Pencil size={12} aria-hidden="true" />
				<span>Annotate</span>
			</Button>

			<Button
				variant="trigger"
				size="sm"
				class="mode-btn"
				type="button"
				role="tab"
				aria-selected={mode === 'components'}
				data-active={mode === 'components' || undefined}
				onclick={() => onmodechange('components')}
			>
				<Boxes size={12} aria-hidden="true" />
				<span>Components</span>
			</Button>

			<Button
				variant="trigger"
				size="sm"
				class="drag-handle"
				type="button"
				aria-label="Drag toolbar"
				onpointerdown={handleHandlePointerDown}
				onpointermove={handleHandlePointerMove}
				onpointerup={handleHandlePointerUp}
				onpointercancel={handleHandlePointerUp}
			>
				<GripVertical size={14} aria-hidden="true" />
			</Button>
		</div>

		<Button
			variant="solid"
			size="sm"
			class="submit-pill"
			type="button"
			data-submitting={submitting || undefined}
			data-sent={sent || undefined}
			onclick={onsubmit}
			aria-label={submitCopy.aria}
		>
			{#if sent}
				<Check size={14} />
			{:else}
				<Send size={14} />
			{/if}
			<span class="submit-label">{submitCopy.label}</span>
		</Button>
	</div>

	{#snippet historyButtons()}
		<Button
			variant="trigger"
			size="sm"
			class="tool-btn history-btn"
			type="button"
			data-tooltip="Undo"
			disabled={!canUndo}
			onclick={() => onundo?.()}
			aria-label="Undo last change"
		>
			<Undo2 size={14} />
		</Button>

		<Button
			variant="trigger"
			size="sm"
			class="tool-btn history-btn"
			type="button"
			data-tooltip="Redo"
			disabled={!canRedo}
			onclick={() => onredo?.()}
			aria-label="Redo last change"
		>
			<Redo2 size={14} />
		</Button>

		<AlertDialog.Root bind:open={resetConfirmOpen}>
			<AlertDialog.Trigger>
				<Button
					variant="trigger"
					size="sm"
					class="tool-btn history-btn"
					type="button"
					data-tooltip="Reset"
					disabled={!canReset}
					aria-label="Clear all annotations and changes"
				>
					<RotateCcw size={14} />
				</Button>
			</AlertDialog.Trigger>
			<AlertDialog.Overlay />
			<AlertDialog.Content>
				<AlertDialog.Header>Reset feedback?</AlertDialog.Header>
				<AlertDialog.Body>
					Drawings, placed components, and layout changes are cleared. This cannot be undone.
				</AlertDialog.Body>
				<AlertDialog.Footer>
					<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
					<AlertDialog.Action onclick={confirmReset}>Reset</AlertDialog.Action>
				</AlertDialog.Footer>
			</AlertDialog.Content>
		</AlertDialog.Root>
	{/snippet}

	<div class="tool-row" data-empty={(!showToolPill && !inspecting) || undefined}>
		{#if inspecting}
			<div class="inspect-pill" role="status">
				<span class="inspect-pill-dot" aria-hidden="true"></span>
				<span class="inspect-pill-label">{inspectingLabel}</span>
				<Kbd data-inspect-pill-kbd>ESC</Kbd>
			</div>
		{/if}

		{#if showToolPill}
			<div
				class="tool-pill"
				role="group"
				aria-label={showComponentsTools ? 'Components tools' : 'Annotation tools'}
			>
				{#if showComponentsTools}
					<div class="add-wrap" data-placement={popoverPlacement}>
						<Button
							variant="trigger"
							size="sm"
							class="tool-btn add-btn"
							type="button"
							data-tooltip={placing ? 'Cancel placement' : 'Add component'}
							data-active={pickerOpen || placing || undefined}
							onclick={openPicker}
							aria-label={placing ? `Cancel placing ${placing}` : 'Add component'}
							aria-expanded={pickerOpen}
						>
							<Plus size={14} aria-hidden="true" />
							<span class="add-btn-label">{placing ? 'Cancel' : 'Add'}</span>
						</Button>

						{#if pickerOpen}
							<div
								class="component-picker"
								{@attach capturePickerPanel}
								role="dialog"
								aria-label="Pick component"
							>
								<Field.Root data-component-picker-search>
									<Label size="sm" for={pickerSearchId} data-sr-only>Search components</Label>
									<InputGroup.Root size="sm" data-component-picker-search-box>
										<InputGroup.Prefix data-component-picker-search-icon aria-hidden="true">
											<Search size={13} />
										</InputGroup.Prefix>
										<InputGroup.Input
											id={pickerSearchId}
											type="text"
											placeholder="Search components"
											bind:value={pickerName}
											data-component-picker-input
											onkeydown={handlePickerKey}
										/>
									</InputGroup.Root>
								</Field.Root>
								{#if groupedPresets.length > 0}
									<div class="component-picker-presets">
										{#each groupedPresets as group (group.category)}
											<div class="component-picker-group">
												<div class="component-picker-group-label">{group.label}</div>
												{#each group.names as preset (preset)}
													<Button
														variant="bare"
														size="sm"
														class="component-picker-preset"
														type="button"
														onclick={() => pick(preset)}
													>
														<span class="component-picker-preset-label">{preset}</span>
													</Button>
												{/each}
											</div>
										{/each}
									</div>
								{:else if pickerName.trim()}
									<Button
										variant="bare"
										size="sm"
										class="component-picker-preset component-picker-create"
										type="button"
										onclick={() => pick(pickerName)}
									>
										<span class="component-picker-preset-label">Add "{pickerName.trim()}"</span>
									</Button>
								{/if}
							</div>
						{/if}
					</div>

					{#if hasSelection && canBreakApart}
						<Button
							variant="trigger"
							size="sm"
							class="tool-btn"
							type="button"
							data-tooltip="Break apart"
							onclick={() => onbreakapart?.()}
							aria-label="Break component apart into its slots"
						>
							<Ungroup size={16} />
						</Button>
					{/if}

					{#if hasSelection}
						<AlertDialog.Root bind:open={removeConfirmOpen}>
							<AlertDialog.Trigger>
								<Button
									variant="trigger"
									size="sm"
									class="tool-btn"
									type="button"
									data-tooltip="Remove"
									aria-label={addedKind ? `Remove ${addedKind}` : 'Remove element'}
								>
									<Trash2 size={16} />
								</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Overlay />
							<AlertDialog.Content>
								<AlertDialog.Header>Remove {removeLabel}?</AlertDialog.Header>
								<AlertDialog.Body>
									{addedKind
										? 'The placement disappears from the page. Undo restores it.'
										: 'The element is hidden from this view and the captured screenshot. Undo restores it.'}
								</AlertDialog.Body>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
									<AlertDialog.Action onclick={confirmRemove}>Remove</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>

						<Button
							variant="trigger"
							size="sm"
							class="tool-btn"
							type="button"
							data-tooltip="Back"
							onclick={() => ondeselect?.()}
							aria-label="Back to inspector"
						>
							<ArrowLeft size={16} />
						</Button>

						<Button
							variant="trigger"
							size="sm"
							class="tool-btn"
							type="button"
							data-tooltip="Reset"
							onclick={() => oncomponentsreset?.()}
							aria-label="Reset component overrides"
						>
							<RotateCcw size={16} />
						</Button>
					{/if}
				{:else}
					<Button
						variant="trigger"
						size="sm"
						class="tool-btn esc-btn"
						type="button"
						data-tooltip="Stop tool"
						disabled={!active}
						onclick={deactivateTools}
						aria-label="Deactivate drawing tools"
					>
						<Kbd data-esc-tool-kbd aria-hidden="true">ESC</Kbd>
					</Button>

					<Button
						variant="trigger"
						size="sm"
						class="tool-btn"
						data-tooltip="Draw"
						data-active={(active && tool === 'pencil') || undefined}
						onclick={() => handleToolClick('pencil')}
						aria-label={active && tool === 'pencil' ? 'Stop drawing' : 'Draw'}
					>
						<Pencil size={16} />
					</Button>

					<Button
						variant="trigger"
						size="sm"
						class="tool-btn"
						data-tooltip="Arrow"
						data-active={(active && tool === 'arrow') || undefined}
						onclick={() => handleToolClick('arrow')}
						aria-label={active && tool === 'arrow' ? 'Stop arrows' : 'Arrow'}
					>
						<MoveUpRight size={16} />
					</Button>

					<Button
						variant="trigger"
						size="sm"
						class="tool-btn"
						data-tooltip="Text"
						data-active={(active && tool === 'text') || undefined}
						onclick={() => handleToolClick('text')}
						aria-label={active && tool === 'text' ? 'Stop text' : 'Text'}
					>
						<Type size={16} />
					</Button>

					<Button
						variant="trigger"
						size="sm"
						class="tool-btn"
						data-tooltip="Move"
						data-active={(active && tool === 'move') || undefined}
						onclick={() => handleToolClick('move')}
						aria-label={active && tool === 'move' ? 'Stop moving' : 'Move'}
					>
						<Move size={16} />
					</Button>

					<Button
						variant="trigger"
						size="sm"
						class="tool-btn"
						data-tooltip="Erase"
						data-active={(active && tool === 'eraser') || undefined}
						onclick={() => handleToolClick('eraser')}
						aria-label={active && tool === 'eraser' ? 'Stop erasing' : 'Erase'}
					>
						<Eraser size={16} />
					</Button>
				{/if}
			</div>
		{/if}
	</div>
</div>

<style>
	.toolbar {
		--accent: oklch(65% 0.19 34);
		--accent-weak: oklch(65% 0.19 34 / 0.14);
		--accent-strong: oklch(76% 0.16 34);
		--signal: oklch(73% 0.14 205);
		--signal-weak: oklch(73% 0.14 205 / 0.13);
		--signal-line: oklch(73% 0.14 205 / 0.32);
		--feedback-ink: oklch(96% 0.004 160);
		--feedback-muted: oklch(96% 0.004 160 / 0.62);
		--feedback-weak: oklch(96% 0.004 160 / 0.38);
		--feedback-line: oklch(96% 0.004 160 / 0.13);
		--feedback-panel: oklch(12% 0.006 160 / 0.96);
		--feedback-panel-raised: oklch(17% 0.008 160 / 0.96);
		--feedback-sunken: oklch(8% 0.005 160 / 0.94);
		--pill-bg: var(--feedback-panel);
		--pill-shadow: 0 12px 28px oklch(0% 0 0 / 0.32), 0 1px 0 var(--feedback-line) inset;
		--tool-slot-height: 40px;
		--tool-button-size: 28px;
		--toolbar-edge-block: 24px;
		--toolbar-edge-inline: 24px;

		position: absolute;
		right: var(--toolbar-edge-inline);
		bottom: var(--toolbar-edge-block);
		z-index: 10002;
		display: grid;
		grid-template-rows: auto var(--tool-slot-height);
		justify-items: end;
		gap: 4px;
		user-select: none;
		touch-action: none;
	}

	.toolbar-row {
		display: grid;
		grid-auto-flow: column;
		align-items: stretch;
		gap: 4px;
		padding: 4px;
		border: 1px solid var(--feedback-line);
		border-radius: 10px;
		background: var(--pill-bg);
		box-shadow: var(--pill-shadow);
	}

	.toolbar-hint {
		position: absolute;
		right: 0;
		bottom: 100%;
		margin-block-end: 12px;
		pointer-events: none;
	}

	.toolbar[data-hidden] .toolbar-hint {
		visibility: hidden;
	}

	.tool-row {
		grid-row: 2;
		align-self: end;
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		justify-items: end;
		justify-content: end;
		gap: 8px;
	}

	.tool-row[data-empty] {
		display: none;
	}

	.tool-pill {
		position: relative;
		z-index: 1;
	}

	.toolbar[data-dragging] {
		cursor: grabbing;
	}

	.toolbar[data-hidden] {
		visibility: hidden;
		pointer-events: none;
	}

	.mode-pill,
	.tool-pill,
	.history-pill {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 1px;
		padding: 0;
		border-radius: 8px;
		background: transparent;
	}

	.tool-pill {
		padding: 4px;
		border: 1px solid var(--feedback-line);
		border-radius: 10px;
		background: var(--pill-bg);
		box-shadow: var(--pill-shadow);
	}

	.history-pill,
	.mode-pill {
		padding-inline: 2px;
	}

	.history-pill {
		border-inline-end: 1px solid var(--feedback-line);
		padding-inline-end: 5px;
	}

	:global(.mode-btn) {
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--feedback-muted);
		--dry-btn-font-size: 11px;
		--dry-btn-min-height: 30px;
		--dry-btn-padding-x: 10px;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 8px;

		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 6px;
		position: relative;
		padding: 0 10px;
		min-block-size: 30px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: var(--feedback-muted);
		cursor: pointer;
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		transition:
			background 0.15s,
			color 0.15s;
	}

	:global(.mode-btn)::before {
		display: none;
	}

	:global(.mode-btn:hover:not([data-active])) {
		--dry-btn-bg: var(--feedback-panel-raised);
		--dry-btn-color: var(--feedback-ink);

		background: var(--feedback-panel-raised);
		color: var(--feedback-ink);
	}

	:global(.mode-btn[data-active]) {
		--dry-btn-bg: var(--signal-weak);
		--dry-btn-color: var(--feedback-ink);

		background: var(--signal-weak);
		color: var(--feedback-ink);
		box-shadow:
			0 0 0 1px var(--signal-line) inset,
			0 1px 0 oklch(96% 0.004 160 / 0.08) inset;
	}

	:global(.mode-btn:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	:global(.drag-handle) {
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--feedback-weak);
		--dry-btn-min-height: 0;
		--dry-btn-padding-x: 3px;
		--dry-btn-padding-y: 4px;
		--dry-btn-radius: 6px;

		display: grid;
		place-items: center;
		padding: 4px 3px;
		min-block-size: 0;
		margin-inline-start: 2px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--feedback-weak);
		cursor: grab;
		touch-action: none;
		transition:
			background 0.15s,
			color 0.15s;
	}

	:global(.drag-handle:hover) {
		--dry-btn-bg: var(--feedback-panel-raised);
		--dry-btn-color: var(--feedback-muted);

		background: var(--feedback-panel-raised);
		color: var(--feedback-muted);
	}

	:global(.drag-handle:focus-visible) {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.toolbar[data-dragging] :global(.drag-handle) {
		--dry-btn-color: var(--accent-strong);

		cursor: grabbing;
		color: var(--accent-strong);
	}

	.inspect-pill {
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 8px;
		border: 1px solid var(--feedback-line);
		background: var(--pill-bg);
		color: var(--feedback-ink);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.04em;
		box-shadow: var(--pill-shadow);
		white-space: nowrap;
		pointer-events: none;
	}

	.inspect-pill-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: var(--signal);
		box-shadow: 0 0 8px var(--signal-line);
	}

	:global([data-inspect-pill-kbd]) {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		border: 1px solid var(--feedback-line);
		background: var(--feedback-sunken);
		color: var(--feedback-muted);
	}

	:global(.tool-btn) {
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--feedback-muted);
		--dry-btn-font-size: 12px;
		--dry-btn-min-height: 26px;
		--dry-btn-padding-x: 0;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 7px;

		position: relative;
		display: grid;
		place-items: center;
		padding: 0;
		inline-size: var(--tool-button-size);
		block-size: var(--tool-button-size);
		min-inline-size: 0;
		min-block-size: 0;
		border: 1px solid transparent;
		border-radius: 7px;
		background: transparent;
		color: var(--feedback-muted);
		cursor: pointer;
		box-sizing: border-box;
		transition:
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s,
			color 0.15s;
	}

	:global(.tool-btn)::before {
		display: none;
	}

	:global(.tool-btn svg) {
		stroke-width: 1.7;
	}

	:global(.esc-btn) {
		--dry-btn-color: var(--feedback-weak);

		inline-size: 34px;
		margin-inline-start: 4px;
		margin-inline-end: 8px;
	}

	:global(.esc-btn:hover:not(:disabled)) {
		--dry-btn-color: var(--feedback-ink);

		color: var(--feedback-ink);
	}

	:global([data-esc-tool-kbd]) {
		padding: 2px 5px;
		border-radius: 4px;
		border: 1px solid var(--feedback-line);
		background: var(--feedback-sunken);
		color: currentColor;
		font-size: 10px;
		font-weight: 650;
	}

	:global(.add-btn) {
		--dry-btn-padding-x: 10px;

		grid-auto-flow: column;
		gap: 6px;
		inline-size: auto;
		padding-inline: 10px;
	}

	.add-btn-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
	}

	:global(.tool-btn[data-tooltip])::after {
		content: attr(data-tooltip);
		position: absolute;
		bottom: calc(100% + 8px);
		left: 50%;
		transform: translateX(-50%) translateY(4px);
		z-index: 1;
		pointer-events: none;
		white-space: nowrap;
		padding: 4px 8px;
		border-radius: 6px;
		background: var(--pill-bg);
		color: var(--feedback-ink);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.02em;
		box-shadow: var(--pill-shadow);
		opacity: 0;
		transition:
			opacity 0.12s ease-out,
			transform 0.12s ease-out;
	}

	:global(.tool-btn[data-tooltip]:hover)::after,
	:global(.tool-btn[data-tooltip]:focus-visible)::after {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	:global(.tool-btn:hover:not(:disabled)) {
		--dry-btn-bg: var(--feedback-panel-raised);
		--dry-btn-color: var(--feedback-ink);

		background: var(--feedback-panel-raised);
		color: var(--feedback-ink);
	}

	:global(.tool-btn:disabled) {
		opacity: 0.46;
		cursor: not-allowed;
	}

	:global(.tool-btn:disabled)::after {
		display: none;
	}

	:global(.tool-btn[data-active]) {
		--dry-btn-bg: var(--signal-weak);
		--dry-btn-border: var(--signal-line);
		--dry-btn-color: var(--feedback-ink);

		background: var(--signal-weak);
		border-color: var(--signal-line);
		color: var(--feedback-ink);
		box-shadow:
			0 0 0 1px var(--signal-line) inset,
			0 1px 0 oklch(96% 0.004 160 / 0.08) inset,
			0 0 0 1px oklch(0% 0 0 / 0.18);
	}

	:global(.tool-btn[data-active]:hover) {
		--dry-btn-bg: var(--feedback-panel-raised);
		--dry-btn-color: var(--feedback-ink);

		background: var(--feedback-panel-raised);
		color: var(--feedback-ink);
	}

	.history-pill :global(.history-btn) {
		inline-size: var(--tool-button-size);
		block-size: var(--tool-button-size);
	}

	.add-wrap {
		position: relative;
		display: grid;
	}

	:global([data-sr-only]) {
		position: absolute;
		inline-size: 1px;
		block-size: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border: 0;
	}

	.component-picker {
		position: absolute;
		bottom: calc(100% + 10px);
		right: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 10px;
		inline-size: min(320px, calc(100dvw - 32px));
		max-block-size: min(70dvh, 440px);
		padding: 10px;
		border: 1px solid var(--feedback-line);
		border-radius: 12px;
		background: var(--pill-bg);
		box-shadow: var(--pill-shadow);
		z-index: 10001;
	}

	.add-wrap[data-placement='bottom'] .component-picker {
		top: calc(100% + 10px);
		bottom: auto;
	}

	:global([data-component-picker-search]) {
		position: relative;
		display: grid;
	}

	:global([data-component-picker-search-box]) {
		--dry-input-bg: var(--feedback-sunken);
		--dry-input-border: var(--feedback-line);
		--dry-input-color: var(--feedback-ink);
		--dry-input-font-size: 12px;
		--dry-input-group-border-strong: oklch(73% 0.16 48 / 0.5);
		--dry-input-group-muted: var(--feedback-weak);
		--dry-input-padding-x: 10px;
		--dry-input-padding-y: 7px;
		--dry-input-radius: 8px;

		border: 1px solid var(--feedback-line);
		border-radius: 8px;
		background: var(--feedback-sunken);
		color: var(--feedback-ink);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		outline: none;
		transition:
			border-color 0.15s,
			background 0.15s,
			box-shadow 0.15s;
	}

	:global([data-component-picker-search-box]:focus-within) {
		--dry-input-bg: var(--feedback-sunken);
		--dry-input-border: oklch(73% 0.16 48 / 0.5);

		border-color: oklch(73% 0.16 48 / 0.5);
		background: var(--feedback-sunken);
	}

	:global([data-component-picker-search-icon]) {
		color: var(--feedback-weak);
	}

	:global([data-component-picker-search]:focus-within [data-component-picker-search-icon]) {
		color: var(--accent);
	}

	:global([data-component-picker-input])::placeholder {
		color: var(--feedback-weak);
	}

	.component-picker-presets {
		display: grid;
		align-content: start;
		gap: 6px;
		min-block-size: 0;
		padding-block: 2px 4px;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: var(--feedback-line) transparent;
		mask-image: linear-gradient(
			180deg,
			transparent 0,
			black 8px,
			black calc(100% - 8px),
			transparent 100%
		);
	}

	.component-picker-group {
		display: grid;
		gap: 2px;
	}

	.component-picker-presets::-webkit-scrollbar {
		inline-size: 6px;
	}

	.component-picker-presets::-webkit-scrollbar-track {
		background: transparent;
	}

	.component-picker-presets::-webkit-scrollbar-thumb {
		background: var(--feedback-line);
		border-radius: 999px;
	}

	.component-picker-presets::-webkit-scrollbar-thumb:hover {
		background: var(--feedback-weak);
	}

	.component-picker-group-label {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 8px 8px 5px;
		background: linear-gradient(
			180deg,
			var(--pill-bg) 0%,
			var(--pill-bg) 70%,
			oklch(12% 0.006 160 / 0) 100%
		);
		color: var(--accent-strong);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.component-picker-group:first-child .component-picker-group-label {
		padding-block-start: 2px;
	}

	:global(.component-picker-create) {
		--dry-btn-border: oklch(73% 0.16 48 / 0.45);
		--dry-btn-color: var(--accent-strong);

		margin-block-start: 6px;
		padding: 8px 10px;
		border: 1px dashed oklch(73% 0.16 48 / 0.45);
		border-radius: 8px;
		color: var(--accent-strong);
	}

	:global(.component-picker-preset) {
		--dry-btn-bg: transparent;
		--dry-btn-border: transparent;
		--dry-btn-color: var(--feedback-muted);
		--dry-btn-font-size: 12px;
		--dry-btn-justify: stretch;
		--dry-btn-align: center stretch;
		--dry-btn-min-height: 30px;
		--dry-btn-padding-x: 10px;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 6px;

		display: grid;
		grid-template-columns: minmax(0, 1fr) 12px;
		align-items: center;
		justify-items: stretch;
		gap: 8px;
		min-block-size: 30px;
		padding: 0 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: var(--feedback-muted);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		line-height: 1.25;
		letter-spacing: 0;
		text-align: start;
		cursor: pointer;
		transition:
			background 0.12s ease-out,
			color 0.12s ease-out;
	}

	.component-picker-preset-label {
		min-inline-size: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	:global(.component-picker-preset)::after {
		content: '';
		inline-size: 12px;
		block-size: 1px;
		background: oklch(73% 0.16 48 / 0);
		transition: background 0.12s ease-out;
	}

	:global(.component-picker-preset:hover),
	:global(.component-picker-preset:focus-visible) {
		--dry-btn-bg: var(--accent-weak);
		--dry-btn-color: var(--accent-strong);

		background: var(--accent-weak);
		color: var(--accent-strong);
		outline: none;
	}

	:global(.component-picker-preset:hover)::after,
	:global(.component-picker-preset:focus-visible)::after {
		background: var(--accent);
	}

	:global(.submit-pill) {
		--dry-btn-bg: oklch(18% 0.05 145 / 0.82);
		--dry-btn-border: oklch(65% 0.19 145 / 0.36);
		--dry-btn-color: oklch(88% 0.1 145);
		--dry-btn-font-size: 11px;
		--dry-btn-min-height: 30px;
		--dry-btn-padding-x: 12px;
		--dry-btn-padding-y: 0;
		--dry-btn-radius: 8px;

		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 6px;
		padding: 0 12px;
		block-size: 30px;
		border: 1px solid oklch(65% 0.19 145 / 0.36);
		border-radius: 8px;
		background: oklch(18% 0.05 145 / 0.82);
		color: oklch(88% 0.1 145);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	:global(.submit-pill:hover:not([data-submitting])) {
		--dry-btn-bg: oklch(22% 0.07 145 / 0.92);
		--dry-btn-border: oklch(76% 0.16 145 / 0.5);
		--dry-btn-color: oklch(93% 0.07 145);

		background: oklch(22% 0.07 145 / 0.92);
		border-color: oklch(76% 0.16 145 / 0.5);
		color: oklch(93% 0.07 145);
	}

	:global(.submit-pill:focus-visible) {
		outline: 2px solid oklch(76% 0.16 145 / 0.9);
		outline-offset: 1px;
	}

	:global(.submit-pill[data-submitting]) {
		opacity: 0.6;
		cursor: progress;
	}

	:global(.submit-pill[data-sent]) {
		--dry-btn-bg: oklch(19% 0.05 205);
		--dry-btn-border: oklch(73% 0.14 205 / 0.52);
		--dry-btn-color: oklch(88% 0.08 205);

		background: oklch(19% 0.05 205);
		border-color: oklch(73% 0.14 205 / 0.52);
		color: oklch(88% 0.08 205);
	}

	.submit-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}

	@container dryui-feedback-root (max-width: 36rem) {
		.toolbar {
			--tool-button-size: 36px;
			--tool-slot-height: auto;
			--toolbar-edge-block: max(12px, env(safe-area-inset-bottom));
			--toolbar-edge-inline: max(12px, env(safe-area-inset-right));

			gap: 8px;
			justify-items: stretch;
		}

		.toolbar:not([data-custom-position]) {
			inset-inline: max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-right));
			bottom: var(--toolbar-edge-block);
		}

		.toolbar-row {
			grid-auto-flow: row;
			grid-auto-columns: initial;
			grid-template-columns: auto minmax(0, 1fr);
			align-items: stretch;
			justify-items: stretch;
		}

		.history-pill {
			justify-self: start;
		}

		.mode-pill {
			justify-content: stretch;
		}

		.tool-row {
			grid-row: auto;
			justify-self: stretch;
			grid-auto-flow: row;
			justify-content: stretch;
			justify-items: stretch;
		}

		.tool-pill {
			grid-auto-flow: row;
			grid-template-columns: repeat(auto-fit, minmax(var(--tool-button-size), 1fr));
			justify-content: stretch;
		}

		:global(.mode-btn) {
			--dry-btn-min-height: 36px;

			justify-content: center;
			min-block-size: 36px;
		}

		:global(.submit-pill) {
			--dry-btn-min-height: 38px;

			grid-column: 1 / -1;
			justify-content: center;
			block-size: 38px;
		}

		.component-picker {
			position: fixed;
			inset-inline: max(12px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-right));
			bottom: calc(max(12px, env(safe-area-inset-bottom)) + 112px);
			inline-size: auto;
			min-inline-size: 0;
			max-inline-size: none;
			max-block-size: min(56dvh, 380px);
		}

		.add-wrap[data-placement='bottom'] .component-picker {
			top: max(12px, env(safe-area-inset-top));
			bottom: auto;
		}
	}

	@container dryui-feedback-root (max-width: 24rem) {
		:global(.mode-btn span) {
			display: none;
		}

		:global(.mode-btn) {
			--dry-btn-padding-x: 8px;
		}

		:global(.submit-pill) {
			--dry-btn-padding-x: 10px;
		}
	}

	.toolbar[data-coarse-pointer] {
		--tool-button-size: 42px;
		--tool-slot-height: 54px;
		gap: 8px;
	}

	.toolbar[data-coarse-pointer] :global(.tool-btn) {
		touch-action: manipulation;
	}

	.toolbar[data-coarse-pointer] :global(.mode-btn) {
		--dry-btn-min-height: 40px;
		--dry-btn-padding-x: 12px;
		--dry-btn-padding-y: 9px;

		min-block-size: 40px;
		touch-action: manipulation;
	}

	.toolbar[data-coarse-pointer] :global(.drag-handle) {
		padding: 8px 6px;
		touch-action: none;
	}

	.toolbar[data-coarse-pointer] :global(.submit-pill) {
		--dry-btn-min-height: 44px;

		block-size: 44px;
		touch-action: manipulation;
	}
</style>
