<script lang="ts">
	import {
		ArrowLeft,
		Check,
		Eraser,
		GripVertical,
		LayoutTemplate,
		Move,
		MoveUpRight,
		Pencil,
		Plus,
		Redo2,
		RotateCcw,
		Search,
		Send,
		Settings,
		Type,
		Undo2
	} from 'lucide-svelte';
	import { type SubmitStatus, type Tool } from '../types.js';
	import {
		CATEGORY_LABELS,
		CATEGORY_ORDER,
		COMPONENT_CATEGORIES,
		COMPONENT_NAMES,
		type ComponentCategory
	} from './component-names.js';
	import type { SchemaField } from './component-schemas.js';

	export type Mode = 'annotate' | 'layout';

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
		addedKind?: string | null;
		addedLabel?: string;
		addedPropsJson?: string;
		ontoggle: () => void;
		ontoolchange: (tool: Tool) => void;
		onsubmit: () => void;
		onmodechange: (mode: Mode) => void;
		onlayoutreset?: () => void;
		onundo?: () => void;
		onredo?: () => void;
		ondeselect?: () => void;
		onaddcomponent?: (kind: string) => void;
		oncancelplacement?: () => void;
		onapplyprops?: (label: string, propsJson: string) => void;
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
		addedLabel = '',
		addedPropsJson = '',
		canUndo = false,
		canRedo = false,
		ontoggle,
		ontoolchange,
		onsubmit,
		onmodechange,
		onlayoutreset,
		onundo,
		onredo,
		ondeselect,
		onaddcomponent,
		oncancelplacement,
		onapplyprops
	}: Props = $props();

	const inspecting = $derived(mode === 'layout');
	const showAnnotationTools = $derived(mode === 'annotate');
	const showLayoutTools = $derived(mode === 'layout');
	const showToolPill = $derived(showAnnotationTools || showLayoutTools);

	let pickerOpen = $state(false);
	let pickerName = $state('');
	let pickerInputEl = $state<HTMLInputElement | undefined>();

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
		if (!pickerOpen || !pickerInputEl) return;
		const id = requestAnimationFrame(() => pickerInputEl?.focus());
		return () => cancelAnimationFrame(id);
	});

	$effect(() => {
		if (placing) pickerOpen = false;
	});

	let propsPanelOpen = $state(false);
	let propsLabelInput = $state('');
	let propsValues = $state<Record<string, unknown>>({});
	let propsLabelEl = $state<HTMLInputElement | undefined>();

	let schemas = $state<Record<string, SchemaField[]> | null>(null);

	$effect(() => {
		if (!propsPanelOpen || schemas) return;
		let cancelled = false;
		import('./component-schemas.js').then((mod) => {
			if (cancelled) return;
			schemas = mod.COMPONENT_SCHEMAS;
		});
		return () => {
			cancelled = true;
		};
	});

	const propsSchema = $derived<SchemaField[]>(
		addedKind && schemas ? (schemas[addedKind] ?? []) : []
	);

	const formFields = $derived(propsSchema.filter((field) => field.type.kind !== 'snippet'));

	function syncPropsPanel() {
		propsLabelInput = addedLabel ?? '';
		propsValues = parsePropsJson(addedPropsJson ?? '');
	}

	function parsePropsJson(raw: string): Record<string, unknown> {
		const trimmed = raw.trim();
		if (!trimmed) return {};
		try {
			const parsed = JSON.parse(trimmed);
			if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
				return parsed as Record<string, unknown>;
			}
		} catch {
			// fall through to empty on invalid JSON
		}
		return {};
	}

	function serializePropsValues(values: Record<string, unknown>): string {
		const trimmed: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(values)) {
			if (value === undefined || value === null || value === '') continue;
			trimmed[key] = value;
		}
		if (Object.keys(trimmed).length === 0) return '';
		return JSON.stringify(trimmed);
	}

	$effect(() => {
		void addedKind;
		syncPropsPanel();
	});

	$effect(() => {
		if (!addedKind) propsPanelOpen = false;
	});

	$effect(() => {
		if (!propsPanelOpen || !propsLabelEl) return;
		const id = requestAnimationFrame(() => propsLabelEl?.focus());
		return () => cancelAnimationFrame(id);
	});

	function togglePropsPanel() {
		if (!addedKind) return;
		propsPanelOpen = !propsPanelOpen;
		if (propsPanelOpen) syncPropsPanel();
	}

	function applyProps() {
		onapplyprops?.(propsLabelInput, serializePropsValues(propsValues));
		propsPanelOpen = false;
	}

	function setFieldValue(field: SchemaField, value: unknown) {
		propsValues = { ...propsValues, [field.name]: value };
	}

	function clearFieldValue(field: SchemaField) {
		const next = { ...propsValues };
		delete next[field.name];
		propsValues = next;
	}

	function handlePropsKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !(e.target instanceof HTMLTextAreaElement)) {
			e.preventDefault();
			applyProps();
		} else if (e.key === 'Escape') {
			e.preventDefault();
			propsPanelOpen = false;
		}
	}

	function readEnumValue(field: SchemaField): string {
		const value = propsValues[field.name];
		return typeof value === 'string' ? value : '';
	}

	function readBooleanValue(field: SchemaField): boolean {
		return propsValues[field.name] === true;
	}

	function readNumberValue(field: SchemaField): string {
		const value = propsValues[field.name];
		return typeof value === 'number' ? String(value) : '';
	}

	function readStringValue(field: SchemaField): string {
		const value = propsValues[field.name];
		return typeof value === 'string' ? value : '';
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

	const DRAG_THRESHOLD_PX = 4;
	const submitting = $derived(submitStatus !== 'idle');
	const submitCopy = $derived(sent ? SENT_COPY : SUBMIT_COPY[submitStatus]);

	let toolbarEl = $state<HTMLDivElement | null>(null);
	let pillPosition = $state<'above' | 'below'>('above');
	const PILL_CLEARANCE = 56;

	function updatePillPosition() {
		if (!toolbarEl) return;
		const rect = toolbarEl.getBoundingClientRect();
		const next = rect.top < PILL_CLEARANCE ? 'below' : 'above';
		if (next !== pillPosition) pillPosition = next;
	}

	let pillFrame = 0;
	function schedulePillUpdate() {
		if (pillFrame) return;
		pillFrame = requestAnimationFrame(() => {
			pillFrame = 0;
			updatePillPosition();
		});
	}

	$effect(() => {
		if (!inspecting) return;
		updatePillPosition();
		window.addEventListener('resize', schedulePillUpdate);
		window.addEventListener('scroll', schedulePillUpdate, true);
		return () => {
			if (pillFrame) cancelAnimationFrame(pillFrame);
			window.removeEventListener('resize', schedulePillUpdate);
			window.removeEventListener('scroll', schedulePillUpdate, true);
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
		if (inspecting) updatePillPosition();
	}

	function handleHandlePointerUp() {
		pendingDrag = null;
		if (dragging && toolbarEl) {
			const rect = toolbarEl.getBoundingClientRect();
			toolbarEl.style.right = `${window.innerWidth - rect.right}px`;
			toolbarEl.style.bottom = `${window.innerHeight - rect.bottom}px`;
			toolbarEl.style.left = 'auto';
			toolbarEl.style.top = 'auto';
		}
		dragging = false;
	}

	function handleToolClick(t: Tool) {
		if (!active || tool !== t) {
			ontoolchange(t);
			if (!active) ontoggle();
		} else {
			ontoggle();
		}
	}
</script>

<div
	bind:this={toolbarEl}
	class="toolbar"
	data-hidden={hidden || undefined}
	data-dragging={dragging || undefined}
	role="toolbar"
	tabindex="-1"
	aria-hidden={hidden}
	aria-label="Feedback toolbar"
>
	<div class="toolbar-row">
		<div class="history-pill" role="group" aria-label="History">
			{@render historyButtons()}
		</div>

		<div class="mode-pill" role="tablist" aria-label="Feedback mode">
			<button
				class="mode-btn"
				type="button"
				role="tab"
				aria-selected={mode === 'annotate'}
				data-active={mode === 'annotate' || undefined}
				onclick={() => onmodechange('annotate')}
			>
				<Pencil size={12} aria-hidden="true" />
				<span>Annotate</span>
			</button>

			<button
				class="mode-btn"
				type="button"
				role="tab"
				aria-selected={mode === 'layout'}
				data-active={mode === 'layout' || undefined}
				onclick={() => onmodechange('layout')}
			>
				<LayoutTemplate size={12} aria-hidden="true" />
				<span>Layout</span>
			</button>

			<button
				class="drag-handle"
				type="button"
				aria-label="Drag toolbar"
				onpointerdown={handleHandlePointerDown}
				onpointermove={handleHandlePointerMove}
				onpointerup={handleHandlePointerUp}
				onpointercancel={handleHandlePointerUp}
			>
				<GripVertical size={14} aria-hidden="true" />
			</button>
		</div>

		<button
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
		</button>
	</div>

	{#snippet historyButtons()}
		<button
			class="tool-btn history-btn"
			type="button"
			data-tooltip="Undo"
			disabled={!canUndo}
			onclick={() => onundo?.()}
			aria-label="Undo last change"
		>
			<Undo2 size={14} />
		</button>

		<button
			class="tool-btn history-btn"
			type="button"
			data-tooltip="Redo"
			disabled={!canRedo}
			onclick={() => onredo?.()}
			aria-label="Redo last change"
		>
			<Redo2 size={14} />
		</button>
	{/snippet}

	{#if showToolPill}
		<div
			class="tool-pill"
			role="group"
			aria-label={showLayoutTools ? 'Layout tools' : 'Annotation tools'}
		>
			{#if showLayoutTools}
				{#if addedKind}
					<div class="add-wrap">
						<button
							class="tool-btn"
							type="button"
							data-tooltip="Edit props"
							data-active={propsPanelOpen || undefined}
							onclick={togglePropsPanel}
							aria-label={`Edit ${addedKind} props`}
							aria-expanded={propsPanelOpen}
						>
							<Settings size={16} />
						</button>

						{#if propsPanelOpen}
							<div class="props-panel" role="dialog" aria-label={`${addedKind} props`}>
								<div class="props-panel-title">{addedKind} props</div>
								<label class="props-panel-field">
									<span class="props-panel-label">Label</span>
									<input
										class="props-panel-input"
										type="text"
										bind:this={propsLabelEl}
										bind:value={propsLabelInput}
										placeholder={addedKind}
										onkeydown={handlePropsKey}
									/>
								</label>
								{#each formFields as field (field.name)}
									{#if field.type.kind === 'enum'}
										<label class="props-panel-field">
											<span class="props-panel-label">{field.name}</span>
											<select
												class="props-panel-input"
												value={readEnumValue(field)}
												onchange={(e) => {
													const next = (e.currentTarget as HTMLSelectElement).value;
													if (!next) clearFieldValue(field);
													else setFieldValue(field, next);
												}}
											>
												<option value="">Default</option>
												{#each field.type.options as option}
													<option value={option}>{option}</option>
												{/each}
											</select>
										</label>
									{:else if field.type.kind === 'boolean'}
										<label class="props-panel-checkbox">
											<input
												type="checkbox"
												checked={readBooleanValue(field)}
												onchange={(e) => {
													const next = (e.currentTarget as HTMLInputElement).checked;
													if (next) setFieldValue(field, true);
													else clearFieldValue(field);
												}}
											/>
											<span>{field.name}</span>
										</label>
									{:else if field.type.kind === 'number'}
										<label class="props-panel-field">
											<span class="props-panel-label">{field.name}</span>
											<input
												class="props-panel-input"
												type="number"
												value={readNumberValue(field)}
												onkeydown={handlePropsKey}
												oninput={(e) => {
													const raw = (e.currentTarget as HTMLInputElement).value;
													if (raw === '') {
														clearFieldValue(field);
														return;
													}
													const num = Number(raw);
													if (Number.isFinite(num)) setFieldValue(field, num);
												}}
											/>
										</label>
									{:else}
										<label class="props-panel-field">
											<span class="props-panel-label">{field.name}</span>
											<input
												class="props-panel-input"
												type="text"
												value={readStringValue(field)}
												onkeydown={handlePropsKey}
												oninput={(e) => {
													const raw = (e.currentTarget as HTMLInputElement).value;
													if (raw === '') clearFieldValue(field);
													else setFieldValue(field, raw);
												}}
											/>
										</label>
									{/if}
								{/each}
								<div class="props-panel-actions">
									<button
										class="props-panel-btn"
										type="button"
										onclick={() => (propsPanelOpen = false)}
									>
										Cancel
									</button>
									<button
										class="props-panel-btn props-panel-btn-primary"
										type="button"
										onclick={applyProps}
									>
										Apply
									</button>
								</div>
							</div>
						{/if}
					</div>
				{/if}

				<div class="add-wrap">
					<button
						class="tool-btn"
						type="button"
						data-tooltip={placing ? 'Cancel placement' : 'Add component'}
						data-active={pickerOpen || placing || undefined}
						onclick={openPicker}
						aria-label={placing ? `Cancel placing ${placing}` : 'Add component'}
						aria-expanded={pickerOpen}
					>
						<Plus size={16} />
					</button>

					{#if pickerOpen}
						<div class="component-picker" role="dialog" aria-label="Pick component">
							<div class="component-picker-search">
								<span class="component-picker-search-icon" aria-hidden="true">
									<Search size={13} />
								</span>
								<input
									class="component-picker-input"
									type="text"
									placeholder="Search components"
									bind:this={pickerInputEl}
									bind:value={pickerName}
									onkeydown={handlePickerKey}
								/>
							</div>
							{#if groupedPresets.length > 0}
								<div class="component-picker-presets">
									{#each groupedPresets as group (group.category)}
										<div class="component-picker-group-label">{group.label}</div>
										{#each group.names as preset (preset)}
											<button
												class="component-picker-preset"
												type="button"
												onclick={() => pick(preset)}
											>
												{preset}
											</button>
										{/each}
									{/each}
								</div>
							{:else if pickerName.trim()}
								<button
									class="component-picker-preset component-picker-create"
									type="button"
									onclick={() => pick(pickerName)}
								>
									Add "{pickerName.trim()}"
								</button>
							{/if}
						</div>
					{/if}
				</div>

				{#if hasSelection}
					<button
						class="tool-btn"
						type="button"
						data-tooltip="Back"
						onclick={() => ondeselect?.()}
						aria-label="Back to inspector"
					>
						<ArrowLeft size={16} />
					</button>

					<button
						class="tool-btn"
						type="button"
						data-tooltip="Reset"
						onclick={() => onlayoutreset?.()}
						aria-label="Reset layout overrides"
					>
						<RotateCcw size={16} />
					</button>
				{/if}
			{:else}
				<button
					class="tool-btn"
					data-tooltip="Draw"
					data-active={(active && tool === 'pencil') || undefined}
					onclick={() => handleToolClick('pencil')}
					aria-label={active && tool === 'pencil' ? 'Stop drawing' : 'Draw'}
				>
					<Pencil size={16} />
				</button>

				<button
					class="tool-btn"
					data-tooltip="Arrow"
					data-active={(active && tool === 'arrow') || undefined}
					onclick={() => handleToolClick('arrow')}
					aria-label={active && tool === 'arrow' ? 'Stop arrows' : 'Arrow'}
				>
					<MoveUpRight size={16} />
				</button>

				<button
					class="tool-btn"
					data-tooltip="Text"
					data-active={(active && tool === 'text') || undefined}
					onclick={() => handleToolClick('text')}
					aria-label={active && tool === 'text' ? 'Stop text' : 'Text'}
				>
					<Type size={16} />
				</button>

				<button
					class="tool-btn"
					data-tooltip="Move"
					data-active={(active && tool === 'move') || undefined}
					onclick={() => handleToolClick('move')}
					aria-label={active && tool === 'move' ? 'Stop moving' : 'Move'}
				>
					<Move size={16} />
				</button>

				<button
					class="tool-btn"
					data-tooltip="Erase"
					data-active={(active && tool === 'eraser') || undefined}
					onclick={() => handleToolClick('eraser')}
					aria-label={active && tool === 'eraser' ? 'Stop erasing' : 'Erase'}
				>
					<Eraser size={16} />
				</button>
			{/if}
		</div>
	{/if}

	{#if inspecting}
		<div class="inspect-pill" data-position={pillPosition} role="status">
			<span class="inspect-pill-dot" aria-hidden="true"></span>
			<span class="inspect-pill-label">Inspecting layout</span>
			<kbd class="inspect-pill-kbd">ESC</kbd>
		</div>
	{/if}
</div>

<style>
	.toolbar {
		--accent: hsl(25 100% 55%);
		--pill-bg: hsl(225 15% 15% / 0.95);
		--pill-shadow: 0 4px 24px hsl(0 0% 0% / 0.4);
		--tool-slot-height: 46px;

		position: absolute;
		right: 24px;
		bottom: 24px;
		z-index: 10002;
		display: grid;
		grid-template-rows: auto var(--tool-slot-height);
		justify-items: end;
		gap: 6px;
		user-select: none;
		touch-action: none;
	}

	.toolbar-row {
		display: grid;
		grid-auto-flow: column;
		align-items: stretch;
		gap: 6px;
	}

	.tool-pill {
		grid-row: 2;
		align-self: end;
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
		gap: 2px;
		padding: 3px;
		border-radius: 12px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		box-shadow: var(--pill-shadow);
	}

	.mode-btn {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: none;
		border-radius: 8px;
		background: transparent;
		color: hsl(220 10% 60%);
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

	.mode-btn:hover:not([data-active]) {
		color: hsl(220 10% 88%);
	}

	.mode-btn[data-active] {
		background: hsl(25 100% 55% / 0.18);
		color: hsl(25 100% 80%);
	}

	.mode-btn:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.drag-handle {
		display: grid;
		place-items: center;
		padding: 4px 3px;
		margin-inline-start: 2px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: hsl(220 10% 38%);
		cursor: grab;
		touch-action: none;
		transition:
			background 0.15s,
			color 0.15s;
	}

	.drag-handle:hover {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 70%);
	}

	.drag-handle:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}

	.toolbar[data-dragging] .drag-handle {
		cursor: grabbing;
		color: hsl(25 100% 67%);
	}

	.inspect-pill {
		position: absolute;
		inset-inline-end: 0;
		display: inline-grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border-radius: 8px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		color: hsl(220 10% 92%);
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

	.inspect-pill[data-position='above'] {
		inset-block-end: calc(100% + 8px);
	}

	.inspect-pill[data-position='below'] {
		inset-block-start: calc(100% + 8px);
	}

	.inspect-pill-dot {
		display: inline-block;
		width: 6px;
		height: 6px;
		border-radius: 999px;
		background: hsl(25 100% 55%);
		box-shadow: 0 0 8px hsl(25 100% 55% / 0.6);
	}

	.inspect-pill-kbd {
		font-family: ui-monospace, 'SF Mono', Menlo, monospace;
		font-size: 10px;
		font-weight: 600;
		padding: 2px 6px;
		border-radius: 4px;
		background: hsl(225 15% 22%);
		color: hsl(220 10% 80%);
	}

	.tool-btn {
		position: relative;
		display: grid;
		place-items: center;
		padding: 0;
		inline-size: 26px;
		block-size: 26px;
		border: 1px solid transparent;
		border-radius: 7px;
		background: transparent;
		color: hsl(220 10% 70%);
		cursor: pointer;
		box-sizing: border-box;
		transition:
			background 0.15s,
			border-color 0.15s,
			box-shadow 0.15s,
			color 0.15s;
	}

	.tool-btn[data-tooltip]::after {
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
		backdrop-filter: blur(8px);
		color: hsl(220 10% 92%);
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

	.tool-btn[data-tooltip]:hover::after,
	.tool-btn[data-tooltip]:focus-visible::after {
		opacity: 1;
		transform: translateX(-50%) translateY(0);
	}

	.tool-btn:hover:not(:disabled) {
		background: hsl(225 15% 22%);
		color: hsl(220 10% 90%);
	}

	.tool-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.tool-btn:disabled::after {
		display: none;
	}

	.tool-btn[data-active] {
		background: var(--accent);
		border-color: white;
		color: black;
		box-shadow:
			0 0 0 1px black,
			0 4px 12px hsl(0 0% 0% / 0.35);
	}

	.tool-btn[data-active]:hover {
		background: hsl(25 100% 62%);
		color: black;
	}

	.history-pill .history-btn {
		inline-size: 26px;
		block-size: 26px;
	}

	.add-wrap {
		position: relative;
		display: grid;
	}

	.component-picker {
		position: absolute;
		bottom: calc(100% + 10px);
		right: 0;
		display: grid;
		grid-template-rows: auto 1fr;
		gap: 8px;
		inline-size: 260px;
		max-block-size: 380px;
		padding: 8px;
		border-radius: 12px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		box-shadow: var(--pill-shadow);
		z-index: 10001;
	}

	.component-picker-search {
		position: relative;
		display: grid;
	}

	.component-picker-search-icon {
		position: absolute;
		inset-block: 0;
		inset-inline-start: 10px;
		display: grid;
		place-items: center;
		color: hsl(220 10% 45%);
		pointer-events: none;
	}

	.component-picker-input {
		padding: 7px 10px 7px 30px;
		border: 1px solid hsl(220 10% 22%);
		border-radius: 8px;
		background: hsl(225 15% 10% / 0.5);
		color: hsl(220 10% 92%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		outline: none;
		transition:
			border-color 0.15s,
			background 0.15s;
	}

	.component-picker-input:focus-visible {
		border-color: hsl(25 100% 55% / 0.5);
		background: hsl(225 15% 10% / 0.7);
	}

	.component-picker-search:focus-within .component-picker-search-icon {
		color: var(--accent);
	}

	.component-picker-input::placeholder {
		color: hsl(220 10% 45%);
	}

	.component-picker-presets {
		display: grid;
		gap: 0;
		min-block-size: 0;
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: hsl(220 10% 28%) transparent;
		mask-image: linear-gradient(
			180deg,
			transparent 0,
			black 8px,
			black calc(100% - 8px),
			transparent 100%
		);
	}

	.component-picker-presets::-webkit-scrollbar {
		inline-size: 6px;
	}

	.component-picker-presets::-webkit-scrollbar-track {
		background: transparent;
	}

	.component-picker-presets::-webkit-scrollbar-thumb {
		background: hsl(220 10% 28%);
		border-radius: 999px;
	}

	.component-picker-presets::-webkit-scrollbar-thumb:hover {
		background: hsl(220 10% 38%);
	}

	.component-picker-group-label {
		position: sticky;
		top: 0;
		z-index: 1;
		padding: 10px 6px 4px;
		background: linear-gradient(
			180deg,
			var(--pill-bg) 0%,
			var(--pill-bg) 70%,
			hsl(225 15% 15% / 0) 100%
		);
		color: hsl(25 100% 70%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 9px;
		font-weight: 700;
		letter-spacing: 0.12em;
		text-transform: uppercase;
	}

	.component-picker-group-label:first-child {
		padding-block-start: 4px;
	}

	.component-picker-create {
		margin-block-start: 6px;
		padding: 8px 10px;
		border: 1px dashed hsl(25 100% 55% / 0.45);
		border-radius: 8px;
		color: hsl(25 100% 80%);
	}

	.props-panel {
		position: absolute;
		bottom: calc(100% + 10px);
		right: 0;
		display: grid;
		gap: 8px;
		min-inline-size: 260px;
		max-inline-size: 320px;
		padding: 12px;
		border-radius: 12px;
		background: var(--pill-bg);
		backdrop-filter: blur(8px);
		box-shadow: var(--pill-shadow);
		z-index: 10001;
	}

	.props-panel-title {
		color: hsl(25 100% 80%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}

	.props-panel-field {
		display: grid;
		gap: 4px;
	}

	.props-panel-checkbox {
		display: grid;
		grid-auto-flow: column;
		justify-content: start;
		align-items: center;
		gap: 8px;
		color: hsl(220 10% 88%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
	}

	.props-panel-checkbox input {
		accent-color: hsl(25 100% 55%);
	}

	.props-panel-label {
		color: hsl(220 10% 60%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 10px;
		font-weight: 600;
		letter-spacing: 0.04em;
		text-transform: uppercase;
	}

	.props-panel-input {
		padding: 6px 10px;
		border: 1px solid hsl(220 10% 30%);
		border-radius: 6px;
		background: hsl(225 15% 10% / 0.6);
		color: hsl(220 10% 92%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		outline: none;
	}

	.props-panel-input:focus-visible {
		border-color: var(--accent);
	}

	.props-panel-actions {
		display: grid;
		grid-auto-flow: column;
		justify-content: end;
		gap: 6px;
	}

	.props-panel-btn {
		padding: 6px 12px;
		border: 1px solid hsl(220 10% 25%);
		border-radius: 6px;
		background: transparent;
		color: hsl(220 10% 88%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.02em;
		cursor: pointer;
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.props-panel-btn:hover {
		background: hsl(225 15% 22%);
		border-color: hsl(220 10% 35%);
	}

	.props-panel-btn-primary {
		background: hsl(25 100% 55%);
		border-color: hsl(25 100% 55%);
		color: black;
	}

	.props-panel-btn-primary:hover {
		background: hsl(25 100% 62%);
		border-color: hsl(25 100% 62%);
		color: black;
	}

	.component-picker-preset {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: 8px;
		padding: 6px 10px;
		border: none;
		border-radius: 6px;
		background: transparent;
		color: hsl(220 10% 80%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0;
		text-align: start;
		cursor: pointer;
		transition:
			background 0.12s ease-out,
			color 0.12s ease-out;
	}

	.component-picker-preset::after {
		content: '';
		inline-size: 12px;
		block-size: 1px;
		background: hsl(25 100% 55% / 0);
		transition: background 0.12s ease-out;
	}

	.component-picker-preset:hover,
	.component-picker-preset:focus-visible {
		background: hsl(25 100% 55% / 0.1);
		color: hsl(25 100% 92%);
		outline: none;
	}

	.component-picker-preset:hover::after,
	.component-picker-preset:focus-visible::after {
		background: hsl(25 100% 55%);
	}

	.submit-pill {
		display: grid;
		grid-auto-flow: column;
		align-items: center;
		gap: 6px;
		padding: 0 12px;
		block-size: 32px;
		border: 1px solid hsl(145 40% 26%);
		border-radius: 12px;
		background: hsl(145 50% 12% / 0.7);
		color: hsl(145 60% 70%);
		font-family:
			system-ui,
			-apple-system,
			sans-serif;
		cursor: pointer;
		backdrop-filter: blur(8px);
		box-shadow: var(--pill-shadow);
		transition:
			background 0.15s,
			border-color 0.15s,
			color 0.15s;
	}

	.submit-pill:hover:not([data-submitting]) {
		background: hsl(145 55% 18%);
		border-color: hsl(145 55% 40%);
		color: hsl(145 70% 88%);
	}

	.submit-pill:focus-visible {
		outline: 2px solid hsl(145 60% 50%);
		outline-offset: 1px;
	}

	.submit-pill[data-submitting] {
		opacity: 0.6;
		cursor: progress;
	}

	.submit-pill[data-sent] {
		background: hsl(145 65% 22%);
		border-color: hsl(145 65% 36%);
		color: hsl(145 70% 92%);
	}

	.submit-label {
		font-size: 11px;
		font-weight: 600;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
</style>
