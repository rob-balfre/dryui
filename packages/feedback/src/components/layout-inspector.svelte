<script lang="ts">
	import LayoutBoxPreview from './layout-box-preview.svelte';

	export type LayoutTemplateTool =
		| 'centered'
		| 'stack'
		| 'sidebar'
		| 'holy-grail'
		| '12-span'
		| 'card-grid';

	export type LayoutTool = 'box' | LayoutTemplateTool;

	export type LayoutBox = {
		id: string;
		kind?: LayoutTool;
		label: string;
		pageX: number;
		pageY: number;
		width: number;
		height: number;
	};

	type BoxCorner = 'nw' | 'ne' | 'sw' | 'se';

	type BoxOp =
		| {
				kind: 'draw';
				tool: LayoutTool;
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				label: string;
				originPageX: number;
				originPageY: number;
				currentPageX: number;
				currentPageY: number;
		  }
		| {
				kind: 'move';
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				startPointerPageX: number;
				startPointerPageY: number;
				currentPointerPageX: number;
				currentPointerPageY: number;
				origin: LayoutBox;
		  }
		| {
				kind: 'resize';
				pointerId: number;
				captureTarget: HTMLElement;
				id: string;
				corner: BoxCorner;
				startPointerPageX: number;
				startPointerPageY: number;
				currentPointerPageX: number;
				currentPointerPageY: number;
				origin: LayoutBox;
		  };

	interface Props {
		tool?: LayoutTool | null;
		boxes?: LayoutBox[];
		capturing?: boolean;
		onclose: () => void;
		ontool?: (next: LayoutTool | null) => void;
		onboxescommit?: (next: LayoutBox[]) => void;
	}

	let {
		tool = null,
		boxes = [],
		capturing = false,
		onclose,
		ontool,
		onboxescommit
	}: Props = $props();

	let boxOp = $state<BoxOp | null>(null);
	let editingBox = $state<{ id: string; value: string } | null>(null);
	let viewScrollX = $state(0);
	let viewScrollY = $state(0);

	const MIN_BOX_SIZE = 12;
	const BOX_DRAG_THRESHOLD = 3;

	function syncScroll() {
		viewScrollX = window.scrollX;
		viewScrollY = window.scrollY;
	}

	function layoutToolLabel(value: LayoutTool): string {
		if (value === 'box') return 'box';
		if (value === '12-span') return '12-span layout';
		if (value === 'card-grid') return 'card-grid layout';
		if (value === 'holy-grail') return 'holy-grail layout';
		return `${value} layout`;
	}

	function nextLayoutLabel(value: LayoutTool, existing: LayoutBox[]): string {
		const base = layoutToolLabel(value).replace(/\s+/g, '-');
		const used = new Set(existing.map((b) => b.label));
		let i = 1;
		while (used.has(`${base}-${i}`)) i++;
		return `${base}-${i}`;
	}

	function normalizeDraft(op: BoxOp & { kind: 'draw' }): LayoutBox {
		const x = Math.min(op.originPageX, op.currentPageX);
		const y = Math.min(op.originPageY, op.currentPageY);
		const w = Math.abs(op.currentPageX - op.originPageX);
		const h = Math.abs(op.currentPageY - op.originPageY);
		return {
			id: op.id,
			kind: op.tool,
			label: op.label,
			pageX: x,
			pageY: y,
			width: w,
			height: h
		};
	}

	function transformedBox(origin: LayoutBox, op: BoxOp & { kind: 'move' | 'resize' }): LayoutBox {
		const dx = op.currentPointerPageX - op.startPointerPageX;
		const dy = op.currentPointerPageY - op.startPointerPageY;
		if (op.kind === 'move') {
			return { ...origin, pageX: origin.pageX + dx, pageY: origin.pageY + dy };
		}
		let { pageX, pageY, width, height } = origin;
		if (op.corner === 'nw') {
			pageX = origin.pageX + dx;
			pageY = origin.pageY + dy;
			width = origin.width - dx;
			height = origin.height - dy;
		} else if (op.corner === 'ne') {
			pageY = origin.pageY + dy;
			width = origin.width + dx;
			height = origin.height - dy;
		} else if (op.corner === 'sw') {
			pageX = origin.pageX + dx;
			width = origin.width - dx;
			height = origin.height + dy;
		} else {
			width = origin.width + dx;
			height = origin.height + dy;
		}
		if (width < 0) {
			pageX = pageX + width;
			width = -width;
		}
		if (height < 0) {
			pageY = pageY + height;
			height = -height;
		}
		return { ...origin, pageX, pageY, width, height };
	}

	const renderedBoxes = $derived.by<LayoutBox[]>(() => {
		const op = boxOp;
		if (!op) return boxes;
		if (op.kind === 'draw') {
			return [...boxes, normalizeDraft(op)];
		}
		return boxes.map((b) => (b.id === op.id ? transformedBox(op.origin, op) : b));
	});

	function cryptoId(): string {
		return Math.random().toString(36).slice(2, 10);
	}

	function handleKey(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			e.stopPropagation();
			if (tool) {
				ontool?.(null);
				return;
			}
			onclose();
		}
	}

	function startLayoutDraw(e: PointerEvent) {
		if (!tool) return;
		if (boxes.length > 0) return;
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'draw',
			tool,
			pointerId: e.pointerId,
			captureTarget: target,
			id: cryptoId(),
			label: nextLayoutLabel(tool, boxes),
			originPageX: px,
			originPageY: py,
			currentPageX: px,
			currentPageY: py
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function startBoxMove(e: PointerEvent, box: LayoutBox) {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'move',
			pointerId: e.pointerId,
			captureTarget: target,
			id: box.id,
			startPointerPageX: px,
			startPointerPageY: py,
			currentPointerPageX: px,
			currentPointerPageY: py,
			origin: { ...box }
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function startBoxResize(e: PointerEvent, box: LayoutBox, corner: BoxCorner) {
		if (e.button !== 0) return;
		e.stopPropagation();
		e.preventDefault();
		const target = e.currentTarget as HTMLElement;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		boxOp = {
			kind: 'resize',
			pointerId: e.pointerId,
			captureTarget: target,
			id: box.id,
			corner,
			startPointerPageX: px,
			startPointerPageY: py,
			currentPointerPageX: px,
			currentPointerPageY: py,
			origin: { ...box }
		};
		try {
			target.setPointerCapture(e.pointerId);
		} catch {
			// pointer might not be capturable
		}
		window.addEventListener('pointermove', onBoxOpMove);
		window.addEventListener('pointerup', endBoxOp);
		window.addEventListener('pointercancel', endBoxOp);
	}

	function onBoxOpMove(e: PointerEvent) {
		if (!boxOp || boxOp.pointerId !== e.pointerId) return;
		const px = e.clientX + window.scrollX;
		const py = e.clientY + window.scrollY;
		if (boxOp.kind === 'draw') {
			boxOp = { ...boxOp, currentPageX: px, currentPageY: py };
		} else {
			boxOp = { ...boxOp, currentPointerPageX: px, currentPointerPageY: py };
		}
	}

	function endBoxOp(e: PointerEvent) {
		if (!boxOp || boxOp.pointerId !== e.pointerId) return;
		const op = boxOp;
		boxOp = null;
		try {
			op.captureTarget.releasePointerCapture?.(e.pointerId);
		} catch {
			// already released
		}
		window.removeEventListener('pointermove', onBoxOpMove);
		window.removeEventListener('pointerup', endBoxOp);
		window.removeEventListener('pointercancel', endBoxOp);

		if (op.kind === 'draw') {
			const draft = normalizeDraft(op);
			if (draft.width < MIN_BOX_SIZE || draft.height < MIN_BOX_SIZE) return;
			const next = [draft];
			onboxescommit?.(next);
			ontool?.(null);
		} else {
			const dx = op.currentPointerPageX - op.startPointerPageX;
			const dy = op.currentPointerPageY - op.startPointerPageY;
			if (Math.hypot(dx, dy) < BOX_DRAG_THRESHOLD) return;
			const transformed = transformedBox(op.origin, op);
			if (transformed.width < MIN_BOX_SIZE || transformed.height < MIN_BOX_SIZE) {
				transformed.width = Math.max(MIN_BOX_SIZE, transformed.width);
				transformed.height = Math.max(MIN_BOX_SIZE, transformed.height);
			}
			const next = boxes.map((b) => (b.id === op.id ? transformed : b));
			onboxescommit?.(next);
		}
	}

	function deleteBox(id: string) {
		const next = boxes.filter((b) => b.id !== id);
		if (next.length === boxes.length) return;
		onboxescommit?.(next);
		if (editingBox?.id === id) editingBox = null;
	}

	function startBoxRename(e: MouseEvent, box: LayoutBox) {
		e.stopPropagation();
		const boxEl = (e.currentTarget as HTMLElement).closest('.layout-box');
		editingBox = { id: box.id, value: box.label };
		queueMicrotask(() => {
			const input = boxEl?.querySelector<HTMLInputElement>('.layout-box-input');
			input?.focus();
			input?.select();
		});
	}

	function cancelBoxRename() {
		editingBox = null;
	}

	function commitBoxRename() {
		const current = editingBox;
		if (!current) return;
		editingBox = null;
		const next = current.value.trim();
		const target = boxes.find((b) => b.id === current.id);
		if (!target) return;
		if (!next || next === target.label) return;
		const updated = boxes.map((b) => (b.id === current.id ? { ...b, label: next } : b));
		onboxescommit?.(updated);
	}

	$effect(() => {
		syncScroll();
		window.addEventListener('scroll', syncScroll, true);
		window.addEventListener('resize', syncScroll);
		window.addEventListener('keydown', handleKey, true);
		return () => {
			window.removeEventListener('scroll', syncScroll, true);
			window.removeEventListener('resize', syncScroll);
			window.removeEventListener('keydown', handleKey, true);
			window.removeEventListener('pointermove', onBoxOpMove);
			window.removeEventListener('pointerup', endBoxOp);
			window.removeEventListener('pointercancel', endBoxOp);
		};
	});
</script>

<div
	class="layout-inspector"
	data-drawing={tool ? '' : undefined}
	data-capturing={capturing || undefined}
	data-tool={tool ?? undefined}
	role="presentation"
>
	{#if tool && boxes.length === 0 && !capturing}
		<div class="layout-box-draw-layer" role="presentation" onpointerdown={startLayoutDraw}></div>
	{/if}

	{#each renderedBoxes as b (b.id)}
		{@const left = b.pageX - viewScrollX}
		{@const top = b.pageY - viewScrollY}
		<div
			class="layout-box"
			data-active={boxOp?.id === b.id || undefined}
			data-layout-kind={b.kind ?? 'box'}
			style="left: {left}px; top: {top}px; width: {b.width}px; height: {b.height}px;"
		>
			{#if !capturing}
				<LayoutBoxPreview kind={b.kind ?? 'box'} />
			{/if}
			<button
				class="layout-box-body"
				type="button"
				aria-label="Move {b.label}"
				onpointerdown={(e) => startBoxMove(e, b)}
			></button>
			{#if !capturing}
				<button
					class="layout-box-corner"
					data-corner="nw"
					type="button"
					aria-label="Resize {b.label} from top-left"
					onpointerdown={(e) => startBoxResize(e, b, 'nw')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="ne"
					type="button"
					aria-label="Resize {b.label} from top-right"
					onpointerdown={(e) => startBoxResize(e, b, 'ne')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="sw"
					type="button"
					aria-label="Resize {b.label} from bottom-left"
					onpointerdown={(e) => startBoxResize(e, b, 'sw')}
				></button>
				<button
					class="layout-box-corner"
					data-corner="se"
					type="button"
					aria-label="Resize {b.label} from bottom-right"
					onpointerdown={(e) => startBoxResize(e, b, 'se')}
				></button>
				<button
					class="layout-box-delete"
					type="button"
					aria-label="Delete {b.label}"
					onclick={(e) => {
						e.stopPropagation();
						deleteBox(b.id);
					}}
				>
					×
				</button>
			{/if}
			{#if editingBox?.id === b.id}
				<input
					class="layout-box-input"
					type="text"
					aria-label="Rename {b.label}"
					bind:value={editingBox.value}
					onkeydown={(e) => {
						if (e.key === 'Enter') {
							e.preventDefault();
							commitBoxRename();
						} else if (e.key === 'Escape') {
							e.preventDefault();
							cancelBoxRename();
						}
					}}
					onblur={commitBoxRename}
				/>
			{:else}
				<button
					class="layout-box-label"
					type="button"
					aria-label="Rename {b.label}"
					onclick={(e) => startBoxRename(e, b)}
				>
					{b.label}
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.layout-inspector {
		position: fixed;
		inset: 0;
		z-index: 9999;
		pointer-events: none;
	}

	.layout-box-draw-layer {
		position: fixed;
		inset: 0;
		z-index: 1;
		pointer-events: auto;
		touch-action: none;
		cursor: crosshair;
		background: transparent;
	}

	.layout-box {
		position: fixed;
		z-index: 3;
		display: grid;
		place-items: center;
		border: 1.5px solid hsl(195 80% 60%);
		border-radius: 6px;
		background: hsl(195 80% 60% / 0.12);
		box-shadow:
			0 0 0 1px hsl(225 15% 8% / 0.6),
			0 8px 24px hsl(0 0% 0% / 0.25);
		color: hsl(195 80% 80%);
		pointer-events: none;
	}

	.layout-box[data-layout-kind]:not([data-layout-kind='box']) {
		border-color: hsl(25 100% 55%);
		background: hsl(25 100% 55% / 0.1);
		color: hsl(25 100% 78%);
	}

	.layout-box[data-active] {
		border-color: hsl(195 90% 70%);
		background: hsl(195 80% 60% / 0.22);
	}

	.layout-box[data-active][data-layout-kind]:not([data-layout-kind='box']) {
		border-color: hsl(25 100% 65%);
		background: hsl(25 100% 55% / 0.2);
	}

	.layout-box-body {
		position: absolute;
		inset: 8px;
		margin: 0;
		padding: 0;
		border: none;
		background: transparent;
		cursor: move;
		pointer-events: auto;
		touch-action: none;
	}

	.layout-box-corner {
		position: absolute;
		inline-size: 14px;
		block-size: 14px;
		margin: 0;
		padding: 0;
		border: 1.5px solid hsl(195 90% 70%);
		border-radius: 3px;
		background: hsl(225 15% 8%);
		pointer-events: auto;
		touch-action: none;
	}

	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-corner {
		border-color: hsl(25 100% 65%);
	}

	.layout-box-corner[data-corner='nw'] {
		inset-block-start: -7px;
		inset-inline-start: -7px;
		cursor: nwse-resize;
	}

	.layout-box-corner[data-corner='ne'] {
		inset-block-start: -7px;
		inset-inline-end: -7px;
		cursor: nesw-resize;
	}

	.layout-box-corner[data-corner='sw'] {
		inset-block-end: -7px;
		inset-inline-start: -7px;
		cursor: nesw-resize;
	}

	.layout-box-corner[data-corner='se'] {
		inset-block-end: -7px;
		inset-inline-end: -7px;
		cursor: nwse-resize;
	}

	.layout-box-delete {
		position: absolute;
		inset-block-start: -10px;
		inset-inline-end: -10px;
		inline-size: 20px;
		block-size: 20px;
		margin: 0;
		padding: 0;
		border: 1.5px solid hsl(0 75% 60%);
		border-radius: 999px;
		background: hsl(225 15% 8%);
		color: hsl(0 75% 75%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 14px;
		font-weight: 600;
		line-height: 1;
		cursor: pointer;
		pointer-events: auto;
		display: grid;
		place-items: center;
	}

	.layout-box-delete:hover,
	.layout-box-delete:focus-visible {
		background: hsl(0 75% 55%);
		color: hsl(225 15% 8%);
		outline: none;
	}

	.layout-box-label,
	.layout-box-input {
		position: relative;
		z-index: 2;
		margin: 0;
		padding: 2px 10px;
		border: 1px solid hsl(195 80% 60%);
		border-radius: 4px;
		background: hsl(225 15% 8%);
		color: hsl(195 80% 88%);
		font-family: var(--dry-font-sans, system-ui, sans-serif);
		font-size: 0.875rem;
		font-weight: 500;
		letter-spacing: 0.02em;
		line-height: 1.25;
		text-transform: lowercase;
		pointer-events: auto;
		cursor: text;
	}

	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-label,
	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-input {
		border-color: hsl(25 100% 55%);
		color: hsl(25 100% 88%);
	}

	.layout-box-label:hover,
	.layout-box-label:focus-visible {
		background: hsl(195 80% 60% / 0.9);
		color: hsl(225 15% 8%);
		outline: none;
	}

	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-label:hover,
	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-label:focus-visible {
		background: hsl(25 100% 55% / 0.9);
	}

	.layout-box-input {
		min-inline-size: 6ch;
		max-inline-size: 18ch;
		caret-color: hsl(195 90% 70%);
		outline: 2px solid hsl(195 80% 60%);
		outline-offset: 0;
	}

	.layout-box[data-layout-kind]:not([data-layout-kind='box']) .layout-box-input {
		caret-color: hsl(25 100% 70%);
		outline-color: hsl(25 100% 55%);
	}

	.layout-inspector[data-capturing] .layout-box-corner,
	.layout-inspector[data-capturing] .layout-box-delete {
		display: none;
	}
</style>
